const Agent = require('../../server/models/agent');

describe('Agent', function() {
  describe('as an instance', function() {
    beforeEach(function() {
      this.createdAt = new Date(Date.now());
      jasmine.clock().install();
      jasmine.clock().mockDate(this.createdAt);

      this.args = {
        id: 1,
        name: 'foo',
        status: 'bar',
        groupId: 1,
        createdAt: this.createdAt,
        updatedAt: this.createdAt
      };
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    describe('has attributes set to given values', function() {
      beforeEach(function() {
        this.agent = new Agent(this.args);
      });

      it('returning an instance', function() {
        expect(this.agent).toEqual(jasmine.any(Agent));
      });

      it('providing a method to serialize all attributes', function() {
        this.args.id = void(0);
        this.args.createdAt = void(0);
        this.args.updatedAt = void(0);

        expect(this.agent.serializeAttributes()).toEqual(this.args);
      });

      describe('providing a getter to', function() {
        it('an array of its attributes', function() {
          expect(this.agent.attributes).toEqual(Object.keys(this.args));
        });

        it('id which is private thus not set, yet', function() {
          expect(this.agent.id).not.toBeDefined();
        });

        it('name', function() {
          expect(this.agent.name).toEqual(this.args.name);
        });

        it('status', function() {
          expect(this.agent.value).toEqual(this.args.value);
        });

        it('group_id', function() {
          expect(this.agent.groupId).toEqual(this.args.groupId);
        });

        it('createdAt which is private thus not set, yet', function() {
          expect(this.agent.createdAt).not.toBeDefined();
        });

        it('updatedAt which is private thus not set, yet', function() {
          expect(this.agent.updatedAt).not.toBeDefined();
        });
      });

      describe('providing a setter to', function() {
        it('name', function() {
          const newName = 'myTest';
          this.agent.name = newName;
          expect(this.agent.name).toEqual(newName);
        });

        it('status', function() {
          const newStatus = 'myTest';
          this.agent.status = newStatus;
          expect(this.agent.status).toEqual(newStatus);
        });

        it('groupId', function() {
          const newGroupId = 'myTest';
          this.agent.groupId = newGroupId;
          expect(this.agent.groupId).toEqual(newGroupId);
        });
      });

      describe('because they\'re tagged private providing no setter to', function() {
        it('id' , function() {
          this.agent.id = 2;
          expect(this.agent.id).not.toBeDefined();
        });

        it('createdAt' , function() {
          this.agent.createdAt = 2;
          expect(this.agent.createdAt).not.toBeDefined();
        });

        it('updatedAt' , function() {
          this.agent.updatedAt = 2;
          expect(this.agent.updatedAt).not.toBeDefined();
        });
      });

      describe('to indicate a state providing a getter for', function() {
        it('isNew', function() {
          expect(this.agent.isNew).toBeDefined();
          expect(this.agent.isNew).toBeTruthy();
        });

        describe('isDirty returning', function() {
          it('false if nothing has changed', function() {
            expect(this.agent.isDirty).toBeFalsy();
            this.agent.name = this.args.name;
            expect(this.agent.isDirty).toBeFalsy();
          });

          it('true if attributes are changed', function() {
            this.agent.name = 'test';
            expect(this.agent.isDirty).toBeTruthy();
          });
        });

        describe('attributeChanges returning', function() {
          it('an empty array if nothing has changed', function() {
            expect(this.agent.attributeChanges).toEqual([]);
          });

          it('an array of changes for attributes changed', function() {
            const newName = 'newName';
            const newStatus = 'newStatus';

            const expectedChanges = [
              {
                key: 'name',
                oldValue: this.args.name,
                currentValue: newName
              }, {
                key: 'status',
                oldValue: this.args.status,
                currentValue: newStatus
              }
            ];

            this.agent.name = newName;
            this.agent.status = newStatus;

            expect(this.agent.attributeChanges).toEqual(expectedChanges);
          });
        });
      });
    });

    describe('can validate itself', function() {
      beforeEach(function() {
        this.args = {};
        this.agent = new Agent(this.args);
      });

      it('returning an error if no name is set', function(done) {
        this.agent.validate().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(this.agent.isValid).toBeFalsy();
          expect(this.agent.errors.name).toContain('Name is required!');
          done();
        });
      });

      it('returning an error if no group_id is set', function(done) {
        this.agent.validate().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(this.agent.isValid).toBeFalsy();
          expect(this.agent.errors.groupId).toContain('Group-Id is required!');
          done();
        });
      });

      it('providing a getter to validation-errors', function(done) {
        expect(this.agent.errors).toBeDefined();
        expect(this.agent.errors).toEqual([]);

        this.agent.validate().catch(() => {
          expect(this.agent.errors.length).not.toBeNull();
          expect(Object.keys(this.agent.errors)).toEqual([ 'name', 'groupId' ]);
          done();
        });
      });
    });

    describe('can save itself', function() {
      beforeEach(function() {
        this.args = {};
        this.agent = new Agent(this.args);
      });

      it('returning a Promise', function(done) {
        const promise = this.agent.save();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if validations fail', function(done) {
        spyOn(this.agent, 'validate').and.callThrough();
        this.agent.save().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(error).toContain({
            name: [ 'Name is required!' ],
            groupId: [ 'Group-Id is required!' ]
          });
          expect(this.agent.validate).toHaveBeenCalled();
          expect(this.agent.isValid).toBeFalsy();
          done();
        });
      });

      describe('successfully', function() {
        beforeEach(function() {
          this.myName = 'myName';
          this.myStatus = 'myStatus';
          this.myGroupId = '42';

          this.agent.name = this.myName;
          this.agent.status = this.myStatus;
          this.agent.groupId = this.myGroupId;

          this.promise = this.agent.save();
        });

        describe('returning an instance that', function() {
          it('is not new nor dirty', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = function (agent) {
              expect(agent.isNew).toBeFalsy();
              expect(agent.isDirty).toBeFalsy();
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });

          it('has an id set as attribute', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = function (agent) {
              expect(agent.id).toBeDefined();
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });

          it('has timestamps set as attributes', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = agent => {
              expect(agent.createdAt).toEqual(this.createdAt);
              expect(agent.updatedAt).toEqual(this.createdAt);
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });
        });
      });
    });
  });

  describe('given certain arguments', function() {
    describe('can create an instance', function() {
      it('returning a promise', function(done) {
        const promise = Agent.create();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if arguments are not valid, returning a message containing all errors', function(done) {
        const promise = Agent.create();

        promise.catch( error => {
          const expectedErrorObj = [
            {
              title: 'Validation failed.'
            },
            {
              name: [ 'Name is required!' ],
              groupId: [ 'Group-Id is required!' ]
            }
          ];
          expect(error).toEqual(expectedErrorObj);
          done();
        });
      });

      it('resolving if arguments are valid, returning an instance of agent', function(done) {
        const args = {
          name: 'myName',
          status: 'myStatus',
          groupId: '42'
        };
        const promise = Agent.create(args);

        promise.then( agent => {
          expect(agent).toEqual(jasmine.any(Agent));
          expect(agent.isNew).toBeFalsy();
          expect(agent.isDirty).toBeFalsy();
          expect(agent.id).toBeDefined();
          expect(agent.createdAt).toBeDefined();

          Object.keys(args).forEach(property => {
            expect(agent[property]).toEqual(args[property]);
          });

          done();
        })
          .catch( msg => {
            fail(msg);
            done();
          });
      });
    });

    describe('can find all agents with attributes of given values', function() {
      beforeEach(function(done) {
        const failCallback = msg => {
          fail(msg);
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
            status: 'myStatus',
            groupId: '2342'
          }
        ];

        modelProperties.forEach(attributes => {
          Agent.create(attributes).then(() => {
            done();
          }).catch(failCallback);
        });
      });

      it('returning a promise', function(done) {
        const callback = () => { done(); };

        const promise = Agent.where();

        expect(promise).toEqual(jasmine.any(Promise));

        promise.then(callback).catch(callback);
      });

      it('rejecting if no arguments are given', function(done) {
        Agent.where().then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(error => {
          expect(error).toEqual([
            {
              title: 'No params given to find instances of Agent.'
            }
          ]);
          done();
        });
      });

      it('rejecting if given query-parameters are not a valid JSON-object', function(done) {
        [[], 1223, 'asdfg', Date.now].forEach(invalidParams => {
          Agent.where(invalidParams).then(() => {
            fail('expected this promise to reject.');
            done();
          }).catch(error => {
            expect(error).toEqual([
              {
                title: 'Params given to find instances of Agent are not a valid JSON-object.'
              }
            ]);
            done();
          });
        });
      });

      it('rejecting if parameters given are not attributes of the model', function(done) {
        const queryParams = {
          zip: 12345,
          city: 'Hanover'
        };

        Agent.where(queryParams).then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(error => {
          expect(error).toEqual([
            {
              title: 'Parameters given are not valid attributes of Agent: zip, city.'
            }
          ]);
          done();
        });
      });

      it('resolving to an array of instances of Agent if valid query-params are given', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        const validQueryParams = [
          {
            params: {
              status: 'myStatusWhereTest'
            },
            resultCount: 2
          },
          {
            params: {
              groupId: 2342
            },
            resultCount: 3
          },
          {
            params: {
              status: 'myStatusWhereTest',
              groupId: '2342'
            },
            resultCount: 1
          }
        ];

        validQueryParams.forEach(validQueryParam => {
          Agent.where(validQueryParam.params).then(resultSet => {
            expect(resultSet).toEqual(jasmine.any(Array));
            resultSet.forEach(result => {
              expect(result).toEqual(jasmine.any(Agent));
            });
            expect(resultSet.length).toEqual(validQueryParam.resultCount);
            done();
          }).catch(failCallback);
        });
      });
    });
  });

  describe('can update an existing instance', function() {
    beforeEach(function(done) {
      this.args = {
        name: 'myName',
        status: 'myStatus',
        groupId: '42'
      };

      const failCallback = msg => {
        fail(msg);
        done();
      };

      Agent.create(this.args)
        .then(agent => {
          this.agent = agent;
          done();
        })
        .catch(failCallback);
    });

    it('returning a promise', function(done) {
      const promise = this.agent.update();
      expect(promise).toEqual(jasmine.any(Promise));

      promise.then(() => {
        done();
      });
    });

    it('resolving to the unaltered instance if no arguments or an empty object is given', function(done) {
      const failCallback = msg => {
        fail(msg);
        done();
      };

      [void(0),{}].forEach(args => {
        this.agent.update(args).then(agent => {
          const currentAttributes = agent.serializeAttributes();
          Object.keys(this.args).forEach(property => {
            expect(currentAttributes[property]).toEqual(this.args[property]);
          });
          done();
        }).catch(failCallback);
      });
    });

    it('rejecting if given arguments are not a valid JSON-object.', function(done) {
      [[],'abcdefgh',123].forEach(args => {
        this.agent.update(args).then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(msg => {
          expect(msg).toEqual('Arguments given to update model are not a valid JSON-object');
          done();
        });
      });
    });

    describe('w/ manipulated time', function() {
      beforeEach(function() {
        jasmine.clock().install();
        jasmine.clock().mockDate(this.agent.createdAt);
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });

      it('rejecting, if timestamp for last update of model in data-store is newer than timestamp of attributes given to update', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        let argumentsForRejectingUpdate = this.agent.serializeAttributes();
        argumentsForRejectingUpdate.status = 'myUpdatedStatus';

        const newArgs = {
          status: 'myNewStatus',
          groupId: '23'
        };

        jasmine.clock().tick(10000);

        this.agent.update(newArgs).then(agent => {
          agent.update(argumentsForRejectingUpdate).then(() => {
            fail('Didn\'t expect promise to resolve.');
            done();
          }).catch(msg => {
            expect(msg).toEqual('Model in store was updated meanwhile. Please reload model and try again.');
            done();
          });
        }).catch(failCallback);
      });
    });

    it('resolving to an updated instance if valid arguments are given', function(done) {
      const newArgs = {
        status: 'myNewStatus',
        groupId: '23'
      };

      this.agent.update(newArgs).then(agent => {
        expect(agent.id).toEqual(this.agent.id);
        expect(agent.name).toEqual(this.args.name);
        expect(agent.status).toEqual(newArgs.status);
        expect(agent.groupId).toEqual(newArgs.groupId);

        done();
      }).catch(msg => {
        fail(msg);
        done();
      });

    });

    it('really updating the instance if valid arguments are given', function(done) {
      const newArgs = {
        status: 'myNewStatus',
        groupId: '23'
      };

      const failCallback = msg => {
        fail(msg);
        done();
      };

      this.agent.update(newArgs).then(() => {
        Agent.find(this.agent.id).then(agent => {
          expect(agent.id).toEqual(this.agent.id);
          expect(agent.name).toEqual(this.args.name);
          expect(agent.status).toEqual(newArgs.status);
          expect(agent.groupId).toEqual(newArgs.groupId);

          done();
        }).catch(failCallback);
      }).catch(failCallback);

    });
  });

  describe('given an id', function() {
    beforeEach(function(done) {
      this.args = {
        name: 'myName',
        status: 'myStatus',
        groupId: '23'
      };

      Agent.create(this.args).then(agent => {
        this.agent = agent;
        this.id = this.agent.id;
        done();
      });
    });

    describe('finds the existing object in db', function() {
      it('returning a promise', function(done) {
        const promise = Agent.find();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if id given is not a positive integer', function(done) {
        [void(0),'a','','-1','0',-1,0].forEach( id => {
          Agent.find(id).catch((error) => {
            expect(error).toEqual([
              {
                title: 'No valid id given to find Agent.'
              }
            ]);
            done();
          });
        });
      });

      it('rejecting if no object w/ given id is found in store', function(done) {
        const id = this.id + 1;
        Agent.find(id).catch(error => {
          expect(error).toEqual([
            {
              title: `No Agent found for id ${id}.`
            }
          ]);
          done();
        });
      });

      it('resolving to an instance of agent if an object is found in store', function(done) {
        Agent.find(this.id).then((agent) => {
          expect(agent).toEqual(jasmine.any(Agent));
          expect(agent.serializeAttributes()).toEqual(this.agent.serializeAttributes());
          done();
        }).catch(msg => {
          fail(msg);
          done();
        });
      });
    });

    describe('removes the existing object from store', function() {
      it('returning a promise', function(done) {
        const promise = this.agent.destroy();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.then(() => {
          done();
        }).catch(() => {
          done();
        });
      });

      it('resolving if agent was successfully removed from store', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.agent.destroy().then(() => {
          Agent.find(this.id).then(() => {
            fail('Expected agent to be removed from store.');
            done();
          }).catch(() => {
            done();
          });
        }).catch(failCallback);
      });

      it('rejecting if agent was already removed from store', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.agent.destroy().then(() => {
          this.agent.destroy().then(() => {
            fail('Didn\'t expect promise to resolve.');
            done();
          }).catch(error => {
            expect(error).toEqual([{ title: 'Agent doesn\'t exist in store anymore.' }]);
            done();
          });
        }).catch(failCallback);
      });
    });
  });

  describe('can find all instances', function() {
    it('returning a promise', function(done) {
      const promise = Agent.all();

      expect(promise).toEqual(jasmine.any(Promise));

      promise.then(() => {
        done();
      }).catch(() => {
        done();
      });
    });

    it('resolving to an empty array if there are no instances in data-store', function(done) {
      Agent.all().then(results => {
        expect(results).toEqual(jasmine.any(Array));
        expect(results.length).toEqual(0);
        done();
      }).catch(msg => {
        fail(msg);
        done();
      });
    });

    describe('with instances in data-store', function() {
      beforeEach(function(done) {
        const failCallback = msg => {
          fail(msg);
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

      it('resolving to an array of instances', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        Agent.all().then(results => {
          expect(results).toEqual(jasmine.any(Array));
          expect(results.length).toEqual(5);

          results.forEach(result => {
            expect(result).toEqual(jasmine.any(Agent));
          });

          done();
        }).catch(failCallback);
      });
    });
  });
});
