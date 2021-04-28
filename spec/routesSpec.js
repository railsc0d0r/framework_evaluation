const initApp = require('../server/initApp');
const supertest = require('supertest');
const Agent = require('../server/models/agent');
const AgentStates = require('../server/models/agentStates');
const Group = require('../server/models/group');
const Indicator = require('../server/models/indicator');
const IndicatorNames = require('../server/models/indicatorNames');

describe('Routes:', function() {
  beforeEach(function(done) {
    initApp().then(app => {
      this.server = supertest(app);
      done();
    }).catch(msg => {
      fail(msg);
      done();
    });
  });

  it('GET / returns 200 with a message', function(done) {
    this.server
      .get('/')
      .expect(200)
      .expect('Success')
      .end(finishSupertestCase(done));
  });

  describe('/api', function() {
    beforeEach(function() {
      this.baseUrl = '/api';
    });

    it('GET /api returns 200 with a JSON-object containing a message', function(done) {
      this.server
        .get(this.baseUrl)
        .expect(200)
        .expect({message: 'Success'})
        .end(finishSupertestCase(done));
    });

    describe('/api/agent_states', function() {
      beforeEach(function() {
        this.url = `${this.baseUrl}/agent_states`;
      });

      it('GET returns 200 and a JSON-object providing all possible states for agents', function(done) {
        this.server
          .get(this.url)
          .expect(200)
          .expect({ agent_states: AgentStates })
          .end(finishSupertestCase(done));
      })
    });

    describe('/api/agents', function() {
      beforeEach(function() {
        this.url = `${this.baseUrl}/agents`;
      });

      describe('POST /api/agents', function() {
        beforeEach(function(done) {
          const failCallback = error => {
            fail(JSON.stringify(error));
            done();
          };

          const groupArgs = {
            name: 'myName1'
          };

          Group.create(groupArgs).then(group => {
            this.group = group;
            done();
          }).catch(failCallback);
        });

        it('on success returns 201 and a JSON-object w/ the newly created agent', function(done) {
          const agentArgs = {
            name: 'myTestName',
            status: 'myTestStatus',
            groupId: this.group.id
          };

          this.server
            .post(this.url)
            .send({ agent: agentArgs })
            .expect(201)
            .expect(res => {
              const agent = res.body.agent;

              expect(agent.id).toBeDefined();
              expect(agent.createdAt).toBeDefined();
              expect(agent.name).toEqual(agentArgs.name);
              expect(agent.status).toEqual(agentArgs.status);
              expect(agent.groupId).toEqual(agentArgs.groupId);

              expect(res.headers.location).toEqual(`${this.url}/${agent.id}`);
            })
            .end(finishSupertestCase(done));
        });

        it('on invalid arguments returns 400 and a JSON-object w/ an error-description', function(done) {
          const agentArgs = {
            status: 'myTestStatus'
          };

          this.server
            .post(this.url)
            .send({ agent: agentArgs })
            .expect(400)
            .expect(res => {
              const errors = res.body.errors;

              expect(errors).toEqual(jasmine.any(Array));
              expect(errors).toContain({ title: 'Validation failed.' });
              expect(errors).toContain({
                name: [ 'Name is required!' ],
                groupId: [ 'Group-Id is required!' ]
              });
            })
            .end(finishSupertestCase(done));
        });
      });

      describe('w/ existing agents', function() {
        beforeEach(function(done) {
          const failCallback = error => {
            fail(JSON.stringify(error));
            done();
          };

          const modelProperties = [
            {
              name: 'myName1',
              status: 'myStatusWhereTest',
              groupId: '4711'
            },
            {
              name: 'myName2',
              status: 'myStatus',
              groupId: '4711'
            },
            {
              name: 'myName3',
              status: 'myStatusWhereTest',
              groupId: '2342'
            },
            {
              name: 'myName4',
              status: 'myStatus',
              groupId: '2342'
            },
            {
              name: 'myName5',
              status: 'Status',
              groupId: '2342'
            }
          ];

          modelProperties.forEach(attributes => {
            Agent.create(attributes).then(() => {
              done();
            }).catch(failCallback);
          });
        });

        describe('GET /api/agents', function() {
          beforeEach(function(done) {
            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            Agent.all().then(agents => {
              let expectedResponseBody = { agents: [] };

              agents.forEach(agent => {
                expectedResponseBody.agents.push(agent.serializeAttributes());
              });

              // Necessary to account for strange JSON-behaviour converting everything to strings
              this.expectedResponseBody = JSON.parse(JSON.stringify(expectedResponseBody));

              done();
            }).catch(failCallback);
          });

          it('returns 200 and a JSON-object with all agents', function(done) {
            this.server
              .get(this.url)
              .expect(200)
              .expect(this.expectedResponseBody)
              .end(finishSupertestCase(done));
          });
        });

        describe('on an existing agent', function() {
          beforeEach(function(done) {
            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            Agent.all().then(agents => {
              this.agent = agents[0];
              this.url = `${this.url}/${this.agent.id}`;
              done();
            }).catch(failCallback);
          });

          describe('GET /api/agents/:id', function() {
            beforeEach(function() {
              let expectedResponseBody = { agent: this.agent.serializeAttributes() };

              // Necessary to account for strange JSON-behaviour converting everything to strings
              this.expectedResponseBody = JSON.parse(JSON.stringify(expectedResponseBody));
            });

            it('returns 200 and a JSON-object with the attributes of a single resource', function(done) {
              this.server
                .get(this.url)
                .expect(200)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('PATCH /api/agents/:id', function() {
            beforeEach(function() {
              this.agentArgs = this.agent.serializeAttributes();
            });

            it('returns 200 and "OK"', function(done) {
              this.agentArgs.name = 'myNewName';

              this.server
                .patch(this.url)
                .send({ agent: this.agentArgs })
                .expect(200)
                .expect('"OK"')
                .end(finishSupertestCase(done));
            });
          });

          describe('DELETE /api/agents/:id', function() {
            it('returns 200 and "OK"', function(done) {
              this.server
                .delete(this.url)
                .expect(200)
                .expect('"OK"')
                .end(finishSupertestCase(done));
            });
          });
        });

        describe('on an non-existing agent', function() {
          beforeEach(function(done) {
            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            Agent.all().then(agents => {
              this.nonexistingAgentId = agents.length + 1;

              this.url = `${this.url}/${this.nonexistingAgentId}`;

              let expectedResponseBody = {
                errors: [
                  { title: `No Agent found for id ${this.nonexistingAgentId}.` }
                ]
              };

              // Necessary to account for strange JSON-behaviour converting everything to strings
              this.expectedResponseBody = JSON.parse(JSON.stringify(expectedResponseBody));

              done();
            }).catch(failCallback);
          });

          describe('GET /api/agents/:id', function() {
            it('returns 404 and a JSON-object w/ an error-object', function(done) {
              this.server
                .get(this.url)
                .expect(404)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('PATCH /api/agents/:id', function() {
            it('returns 404 and a JSON-object w/ an error-object', function(done) {
              this.server
                .patch(this.url)
                .expect(404)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('DELETE /api/agents/:id', function() {
            it('returns 404 and a JSON-object w/ an error-object', function(done) {
              this.server
                .delete(this.url)
                .expect(404)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });
        });
      });
    });

    describe('/api/groups', function() {
      beforeEach(function() {
        this.url = `${this.baseUrl}/groups`;
      });

      describe('POST /api/groups', function() {
        it('on success returns 201 and a JSON-object w/ the newly created group', function(done) {
          const groupArgs = {
            name: 'myTestName'
          };

          this.server
            .post(this.url)
            .send({ group: groupArgs })
            .expect(201)
            .expect(res => {
              const group = res.body.group;

              expect(group.id).toBeDefined();
              expect(group.createdAt).toBeDefined();
              expect(group.name).toEqual(groupArgs.name);
              expect(group.status).toEqual(groupArgs.status);
              expect(group.groupId).toEqual(groupArgs.groupId);

              expect(res.headers.location).toEqual(`${this.url}/${group.id}`);
            })
            .end(finishSupertestCase(done));
        });

        it('on invalid arguments returns 400 and a JSON-object w/ an error-description', function(done) {
          this.server
            .post(this.url)
            .send({ group: {} })
            .expect(400)
            .expect(res => {
              const errors = res.body.errors;

              expect(errors).toEqual(jasmine.any(Array));
              expect(errors).toContain({ title: 'Validation failed.' });
              expect(errors).toContain({
                name: [ 'Name is required!' ]
              });
            })
            .end(finishSupertestCase(done));
        });
      });

      describe('w/ existing groups', function() {
        beforeEach(function (done) {
          const failCallback = error => {
            fail(JSON.stringify(error));
            done();
          };

          const modelProperties = [
            {
              name: 'myName1'
            },
            {
              name: 'myName2'
            },
            {
              name: 'myName3'
            },
            {
              name: 'myName4'
            },
            {
              name: 'myName5'
            }
          ];

          modelProperties.forEach(attributes => {
            Group.create(attributes).then(() => {
              done();
            }).catch(failCallback);
          });
        });

        describe('GET /api/groups', function() {
          beforeEach(function(done) {
            this.expectedResponseBody = { groups: [] };
            let promiseArray = [];

            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            const groupsPromise = Group.all();
            promiseArray.push(groupsPromise);

            groupsPromise.then(groups => {
              groups.forEach(group => {
                let groupPromiseArray = [];
                let jsonObject = group.serializeAttributes();

                const agentsPromise = group.agents;
                groupPromiseArray.push(agentsPromise);

                agentsPromise.then(agents => {
                  let agentIds = [];
                  agents.forEach(agent => {
                    agentIds.push(agent.id);
                  });

                  jsonObject.agents = agentIds;
                });

                const indicatorsPromise = group.indicators;
                groupPromiseArray.push(indicatorsPromise);

                indicatorsPromise.then(indicators => {
                  let indicatorIds = [];

                  indicators.forEach(indicator => {
                    indicatorIds.push(indicator.id);
                  });

                  jsonObject.indicators = indicatorIds;
                });

                const groupPromises = Promise.all(groupPromiseArray);
                promiseArray.push(groupPromises);

                groupPromises.then(() => {
                  // Necessary to account for strange JSON-behaviour converting everything to strings
                  jsonObject = JSON.parse(JSON.stringify(jsonObject));

                  this.expectedResponseBody.groups.push(jsonObject);
                });
              });
            });

            Promise.all(promiseArray).then(() => {
              done();
            }).catch(failCallback);
          });

          it('returns 200 and a JSON-object with all groups', function(done) {
            this.server
              .get(this.url)
              .expect(200)
              .expect(this.expectedResponseBody)
              .end(finishSupertestCase(done));
          });
        });

        describe('on an existing group', function() {
          beforeEach(function(done) {
            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            Group.all().then(groups => {
              this.group = groups[0];
              this.url = `${this.url}/${this.group.id}`;
              done();
            }).catch(failCallback);
          });

          describe('GET /api/groups/:id', function() {
            beforeEach(function(done) {
              const failCallback = error => {
                fail(JSON.stringify(error));
                done();
              };

              let promiseArray = [];

              this.expectedResponseBody = {
                group: JSON.parse(JSON.stringify(this.group.serializeAttributes()))
              };

              const agentsPromise = this.group.agents.then(agents => {
                let agentIds = [];

                agents.forEach(agent => {
                  agentIds.push(agent.id);
                });

                this.expectedResponseBody.group.agents = agentIds;
              });

              promiseArray.push(agentsPromise);

              const indicatorsPromise = this.group.indicators.then(indicators => {
                let indicatorIds = [];

                indicators.forEach(indicator => {
                  indicatorIds.push(indicator.id);
                });

                this.expectedResponseBody.group.indicators = indicatorIds;
              });

              promiseArray.push(indicatorsPromise);

              Promise.all(promiseArray).then(() => {
                done();
              }).catch(failCallback);
            });

            it('returns 200 and a JSON-object with the attributes of a single resource', function(done) {
              this.server
                .get(this.url)
                .expect(200)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('PATCH /api/groups/:id', function() {
            beforeEach(function() {
              this.groupArgs = this.group.serializeAttributes();
            });

            it('returns 200 and "OK"', function(done) {
              this.groupArgs.name = 'myNewName';

              this.server
                .patch(this.url)
                .send({ group: this.groupArgs })
                .expect(200)
                .expect('"OK"')
                .end(finishSupertestCase(done));
            });
          });

          describe('DELETE /api/groups/:id', function() {
            it('returns 200 and "OK"', function(done) {
              this.server
                .delete(this.url)
                .expect(200)
                .expect('"OK"')
                .end(finishSupertestCase(done));
            });
          });

          describe('GET /api/groups/:id/indicators', function() {
            beforeEach(function(done) {
              this.url = `${this.url}/indicators`;

              this.group.indicators.then(indicators => {
                let expectedResponseBody = { indicators: [] };

                indicators.forEach(indicator => {
                  expectedResponseBody.indicators.push(indicator.serializeAttributes());
                });

                // Necessary to account for strange JSON-behaviour converting everything to strings
                this.expectedResponseBody = JSON.parse(JSON.stringify(expectedResponseBody));

                done();
              });
            });

            it('returns 200 and a JSON-object with all indicators for this group', function(done) {
              this.server
                .get(this.url)
                .expect(200)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('GET /api/groups/:id/agents', function() {
            beforeEach(function(done) {
              const failCallback = error => {
                fail(JSON.stringify(error));
                done();
              };

              const modelProperties = [
                {
                  name: 'myName1',
                  status: 'myStatusWhereTest'
                },
                {
                  name: 'myName2',
                  status: 'myStatus'
                },
                {
                  name: 'myName3',
                  status: 'myStatusWhereTest'
                },
                {
                  name: 'myName4',
                  status: 'myStatus'
                },
                {
                  name: 'myName5',
                  status: 'Status'
                }
              ];

              modelProperties.forEach(attributes => {
                attributes.groupId = this.group.id;

                Agent.create(attributes).then(() => {
                  done();
                }).catch(failCallback);
              });
            });

            describe('w/ existing agents', function() {
              beforeEach(function(done) {
                this.url = `${this.url}/agents`;

                this.group.agents.then(agents => {
                  let expectedResponseBody = { agents: [] };

                  agents.forEach(agent => {
                    expectedResponseBody.agents.push(agent.serializeAttributes());
                  });

                  // Necessary to account for strange JSON-behaviour converting everything to strings
                  this.expectedResponseBody = JSON.parse(JSON.stringify(expectedResponseBody));

                  done();
                });
              });

              it('returns 200 and a JSON-object with all agents for this group', function(done) {
                this.server
                  .get(this.url)
                  .expect(200)
                  .expect(this.expectedResponseBody)
                  .end(finishSupertestCase(done));
              });
            });
          });
        });

        describe('on an non-existing group', function() {
          beforeEach(function(done) {
            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            Group.all().then(groups => {
              this.nonexistingGroupId = groups.length + 1;

              this.url = `${this.url}/${this.nonexistingGroupId}`;

              let expectedResponseBody = {
                errors: [
                  { title: `No Group found for id ${this.nonexistingGroupId}.` }
                ]
              };

              // Necessary to account for strange JSON-behaviour converting everything to strings
              this.expectedResponseBody = JSON.parse(JSON.stringify(expectedResponseBody));

              done();
            }).catch(failCallback);
          });

          describe('GET /api/groups/:id', function() {
            it('returns 404 and a JSON-object w/ an error-object', function(done) {
              this.server
                .get(this.url)
                .expect(404)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('PATCH /api/groups/:id', function() {
            it('returns 404 and a JSON-object w/ an error-object', function(done) {
              this.server
                .patch(this.url)
                .expect(404)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });

          describe('DELETE /api/groups/:id', function() {
            it('returns 404 and a JSON-object w/ an error-object', function(done) {
              this.server
                .delete(this.url)
                .expect(404)
                .expect(this.expectedResponseBody)
                .end(finishSupertestCase(done));
            });
          });
        });
      });
    });

    describe('/api/indicator_names', function() {
      beforeEach(function() {
        this.url = `${this.baseUrl}/indicator_names`;
      });

      it('GET returns 200 and a JSON-object providing all possible indicator-names for groups', function(done) {
        this.server
          .get(this.url)
          .expect(200)
          .expect({ indicator_names: IndicatorNames })
          .end(finishSupertestCase(done));
      })
    });

    describe('/api/indicators', function() {
      beforeEach(function () {
        this.url = `${this.baseUrl}/indicators`;
      });

      describe('w/ existing groups', function () {
        beforeEach(function (done) {
          const failCallback = error => {
            fail(JSON.stringify(error));
            done();
          };

          const modelProperties = [
            {
              name: 'myName1'
            },
            {
              name: 'myName2'
            },
            {
              name: 'myName3'
            },
            {
              name: 'myName4'
            },
            {
              name: 'myName5'
            }
          ];

          modelProperties.forEach(attributes => {
            Group.create(attributes).then(() => {
              done();
            }).catch(failCallback);
          });
        });

        describe('GET /api/indicators', function () {
          beforeEach(function (done) {
            this.expectedResponseBody = {indicators: []};
            let promiseArray = [];

            const failCallback = error => {
              fail(JSON.stringify(error));
              done();
            };

            const indicatorsPromise = Indicator.all();
            promiseArray.push(indicatorsPromise);

            indicatorsPromise.then(indicators => {
              indicators.forEach(indicator => {
                let jsonObject = indicator.serializeAttributes();

                this.expectedResponseBody.indicators.push(JSON.parse(JSON.stringify(jsonObject)));
              });
            });

            Promise.all(promiseArray).then(() => {
              done();
            }).catch(failCallback);
          });

          it('returns 200 and a JSON-object with all indicators', function (done) {
            this.server
              .get(this.url)
              .expect(200)
              .expect(this.expectedResponseBody)
              .end(finishSupertestCase(done));
          });
        });
      });
    });
  });
});
