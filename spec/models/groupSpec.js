const Group = require('../../server/models/group');
const Agent = require('../../server/models/agent');
const Indicator = require('../../server/models/indicator');
const IndicatorNames = require('../../server/models/indicatorNames');

describe('Group', function() {
  describe('as an instance', function() {
    beforeEach(function() {
      this.createdAt = new Date(Date.now());
      jasmine.clock().install();
      jasmine.clock().mockDate(this.createdAt);

      this.args = {
        id: 1,
        name: 'foo',
        createdAt: this.createdAt,
        updatedAt: this.createdAt
      };
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    describe('has attributes set to given values', function() {
      beforeEach(function() {
        this.group = new Group(this.args);
      });

      it('returning an instance', function() {
        expect(this.group).toEqual(jasmine.any(Group));
      });

      it('providing a method to serialize all attributes', function() {
        this.args.id = void(0);
        this.args.createdAt = void(0);
        this.args.updatedAt = void(0);

        expect(this.group.serializeAttributes()).toEqual(this.args);
      });

      describe('providing a getter to', function() {
        it('an array of its attributes', function() {
          expect(this.group.attributes).toEqual(Object.keys(this.args));
        });

        it('id which is private thus not set, yet', function() {
          expect(this.group.id).not.toBeDefined();
        });

        it('name', function() {
          expect(this.group.name).toEqual(this.args.name);
        });

        it('createdAt which is private thus not set, yet', function() {
          expect(this.group.createdAt).not.toBeDefined();
        });

        it('updatedAt which is private thus not set, yet', function() {
          expect(this.group.updatedAt).not.toBeDefined();
        });
      });

      describe('providing a setter to', function() {
        it('name', function() {
          const newName = 'myTest';
          this.group.name = newName;
          expect(this.group.name).toEqual(newName);
        });
      });

      describe('because they\'re tagged private providing no setter to', function() {
        it('id' , function() {
          this.group.id = 2;
          expect(this.group.id).not.toBeDefined();
        });

        it('createdAt' , function() {
          this.group.createdAt = 2;
          expect(this.group.createdAt).not.toBeDefined();
        });

        it('updatedAt' , function() {
          this.group.updatedAt = 2;
          expect(this.group.updatedAt).not.toBeDefined();
        });
      });

      describe('to indicate a state providing a getter for', function() {
        it('isNew', function() {
          expect(this.group.isNew).toBeDefined();
          expect(this.group.isNew).toBeTruthy();
        });

        describe('isDirty returning', function() {
          it('false if nothing has changed', function() {
            expect(this.group.isDirty).toBeFalsy();
            this.group.name = this.args.name;
            expect(this.group.isDirty).toBeFalsy();
          });

          it('true if attributes are changed', function() {
            this.group.name = 'test';
            expect(this.group.isDirty).toBeTruthy();
          });
        });

        describe('attributeChanges returning', function() {
          it('an empty array if nothing has changed', function() {
            expect(this.group.attributeChanges).toEqual([]);
          });

          it('an array of changes for attributes changed', function() {
            const newName = 'newName';

            const expectedChanges = [
              {
                key: 'name',
                oldValue: this.args.name,
                currentValue: newName
              }
            ];

            this.group.name = newName;

            expect(this.group.attributeChanges).toEqual(expectedChanges);
          });
        });
      });
    });

    describe('can validate itself', function() {
      beforeEach(function() {
        this.args = {};
        this.group = new Group(this.args);
      });

      it('returning an error if no name is set', function(done) {
        this.group.validate().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(this.group.isValid).toBeFalsy();
          expect(this.group.errors.name).toContain('Name is required!');
          done();
        });
      });

      it('providing a getter to validation-errors', function(done) {
        expect(this.group.errors).toBeDefined();
        expect(this.group.errors).toEqual([]);

        this.group.validate().catch(() => {
          expect(this.group.errors.length).not.toBeNull();
          expect(Object.keys(this.group.errors)).toEqual([ 'name' ]);
          done();
        });
      });
    });

    describe('can save itself', function() {
      beforeEach(function() {
        this.args = {};
        this.group = new Group(this.args);
      });

      it('returning a Promise', function(done) {
        const promise = this.group.save();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if validations fail', function(done) {
        spyOn(this.group, 'validate').and.callThrough();
        this.group.save().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(error).toContain({
            name: [ 'Name is required!' ]
          });
          expect(this.group.validate).toHaveBeenCalled();
          expect(this.group.isValid).toBeFalsy();
          done();
        });
      });

      describe('successfully', function() {
        beforeEach(function() {
          this.myName = 'myName';
          this.myGroupId = '42';

          this.group.name = this.myName;
          this.group.groupId = this.myGroupId;

          this.promise = this.group.save();
        });

        describe('returning an instance that', function() {
          it('is not new nor dirty', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = function (group) {
              expect(group.isNew).toBeFalsy();
              expect(group.isDirty).toBeFalsy();
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });

          it('has an id set as attribute', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = function (group) {
              expect(group.id).toBeDefined();
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });

          it('has timestamps set as attributes', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = group => {
              expect(group.createdAt).toEqual(this.createdAt);
              expect(group.updatedAt).toEqual(this.createdAt);
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
        const promise = Group.create();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if arguments are not valid, returning a message containing all errors', function(done) {
        const promise = Group.create();

        promise.catch( error => {
          const expectedErrorObj = [
            {
              title: 'Validation failed.'
            },
            {
              name: [ 'Name is required!' ]
            }
          ];
          expect(error).toEqual(expectedErrorObj);
          done();
        });
      });

      describe('resolving if arguments are valid', function() {
        beforeEach(function(done) {
          this.args = {
            name: 'myName'
          };
          Group.create(this.args).then( group => {
            this.group = group;
            done();
          }).catch( msg => {
            fail(msg);
            done();
          });
        });

        it('returning an instance of group', function() {
          expect(this.group).toEqual(jasmine.any(Group));
          expect(this.group.isNew).toBeFalsy();
          expect(this.group.isDirty).toBeFalsy();
          expect(this.group.id).toBeDefined();
          expect(this.group.createdAt).toBeDefined();

          Object.keys(this.args).forEach(property => {
            expect(this.group[property]).toEqual(this.args[property]);
          });
        });

        it('creating all indicators for this group', function(done) {
          this.group.indicators.then(indicators => {
            expect(indicators.length).toEqual(IndicatorNames.length);
            indicators.forEach(indicator => {
              expect(IndicatorNames.includes(indicator.name)).toBeTruthy();
            });
            done();
          });
        });
      });
    });

    describe('can find all groups with attributes of given values', function() {
      beforeEach(function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        const modelProperties = [
          {
            name: 'myNameTest'
          },
          {
            name: 'myNameTest'
          },
          {
            name: 'myNameTest2'
          },
          {
            name: 'myNameTest2'
          },
          {
            name: 'myNameTest2'
          }
        ];

        modelProperties.forEach(attributes => {
          Group.create(attributes).then(() => {
            done();
          }).catch(failCallback);
        });
      });

      it('returning a promise', function(done) {
        const callback = () => { done(); };

        const promise = Group.where();

        expect(promise).toEqual(jasmine.any(Promise));

        promise.then(callback).catch(callback);
      });

      it('rejecting if no arguments are given', function(done) {
        Group.where().then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(error => {
          expect(error).toEqual([
            {
              title: 'No params given to find instances of Group.'
            }
          ]);
          done();
        });
      });

      it('rejecting if given query-parameters are not a valid JSON-object', function(done) {
        [[], 1223, 'asdfg', Date.now].forEach(invalidParams => {
          Group.where(invalidParams).then(() => {
            fail('expected this promise to reject.');
            done();
          }).catch(error => {
            expect(error).toEqual([
              {
                title: 'Params given to find instances of Group are not a valid JSON-object.'
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

        Group.where(queryParams).then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(error => {
          expect(error).toEqual([
            {
              title: 'Parameters given are not valid attributes of Group: zip, city.'
            }
          ]);
          done();
        });
      });

      it('resolving to an array of instances of Group if valid query-params are given', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        const validQueryParams = [
          {
            params: {
              name: 'myNameTest'
            },
            resultCount: 2
          },
          {
            params: {
              name: 'myNameTest2'
            },
            resultCount: 3
          }
        ];

        validQueryParams.forEach(validQueryParam => {
          Group.where(validQueryParam.params).then(resultSet => {
            expect(resultSet).toEqual(jasmine.any(Array));
            resultSet.forEach(result => {
              expect(result).toEqual(jasmine.any(Group));
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
      };

      const failCallback = msg => {
        fail(msg);
        done();
      };

      Group.create(this.args)
        .then(group => {
          this.group = group;
          done();
        })
        .catch(failCallback);
    });

    it('returning a promise', function(done) {
      const promise = this.group.update();
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
        this.group.update(args).then(group => {
          const currentAttributes = group.serializeAttributes();
          Object.keys(this.args).forEach(property => {
            expect(currentAttributes[property]).toEqual(this.args[property]);
          });
          done();
        }).catch(failCallback);
      });
    });

    it('rejecting if given arguments are not a valid JSON-object.', function(done) {
      [[],'abcdefgh',123].forEach(args => {
        this.group.update(args).then(() => {
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
        jasmine.clock().mockDate(this.group.createdAt);
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });

      it('rejecting, if timestamp for last update of model in data-store is newer than timestamp of attributes given to update', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        let argumentsForRejectingUpdate = this.group.serializeAttributes();
        argumentsForRejectingUpdate.name = 'myUpdatedName';

        const newArgs = {
          name: 'myNewName'
        };

        jasmine.clock().tick(10000);

        this.group.update(newArgs).then(group => {
          group.update(argumentsForRejectingUpdate).then(() => {
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
        name: 'myNewName'
      };


      this.group.update(newArgs).then(group => {
        expect(group.id).toEqual(this.group.id);
        expect(group.name).toEqual(newArgs.name);

        done();
      }).catch(msg => {
        fail(msg);
        done();
      });

    });

    it('really updating the instance if valid arguments are given', function(done) {
      const newArgs = {
        name: 'myNewName'
      };

      const failCallback = msg => {
        fail(msg);
        done();
      };

      this.group.update(newArgs).then(() => {
        Group.find(this.group.id).then(group => {
          expect(group.id).toEqual(this.group.id);
          expect(group.name).toEqual(newArgs.name);

          done();
        }).catch(failCallback);
      }).catch(failCallback);

    });
  });

  describe('given an id', function() {
    beforeEach(function(done) {
      this.args = {
        name: 'myName',
        groupId: '42'
      };

      Group.create(this.args).then(group => {
        this.group = group;
        this.id = this.group.id;
        done();
      });
    });

    describe('finds the existing object in db', function() {
      it('returning a promise', function(done) {
        const promise = Group.find();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if id given is not a positive integer', function(done) {
        [void(0),'a','','-1','0',-1,0].forEach( id => {
          Group.find(id).catch((error) => {
            expect(error).toEqual([
              {
                title: 'No valid id given to find Group.'
              }
            ]);
            done();
          });
        });
      });

      it('rejecting if no object w/ given id is found in store', function(done) {
        const id = this.id + 1;
        Group.find(id).catch(error => {
          expect(error).toEqual([
            {
              title: `No Group found for id ${id}.`
            }
          ]);
          done();
        });
      });

      it('resolving to an instance of group if an object is found in store', function(done) {
        Group.find(this.id).then((group) => {
          expect(group).toEqual(jasmine.any(Group));
          expect(group.serializeAttributes()).toEqual(this.group.serializeAttributes());
          done();
        }).catch(msg => {
          fail(msg);
          done();
        });
      });
    });

    describe('removes the existing object from store', function() {
      it('returning a promise', function(done) {
        const promise = this.group.destroy();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.then(() => {
          done();
        }).catch(() => {
          done();
        });
      });

      it('resolving if group was successfully removed from store', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.group.destroy().then(() => {
          Group.find(this.id).then(() => {
            fail('Expected group to be removed from store.');
            done();
          }).catch(() => {
            done();
          });
        }).catch(failCallback);
      });

      it('resolving removes all depending indicators from store, too', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.group.destroy().then(() => {
          Indicator.where({ groupId: this.id.toString() }).then(indicators => {
            expect(indicators.length).toEqual(0);
            done();
          }).catch(failCallback);
        }).catch(failCallback);
      });

      it('rejecting if group was already removed from store', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.group.destroy().then(() => {
          this.group.destroy().then(() => {
            fail('Didn\'t expect promise to resolve.');
            done();
          }).catch(error => {
            expect(error).toEqual([{ title: 'Group doesn\'t exist in store anymore.' }]);
            done();
          });
        }).catch(failCallback);
      });
    });
  });

  describe('can find all instances', function() {
    it('returning a promise', function(done) {
      const promise = Group.all();

      expect(promise).toEqual(jasmine.any(Promise));

      promise.then(() => {
        done();
      }).catch(() => {
        done();
      });
    });

    it('resolving to an empty array if there are no instances in data-store', function(done) {
      Group.all().then(results => {
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

      it('resolving to an array of instances', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        Group.all().then(results => {
          expect(results).toEqual(jasmine.any(Array));
          expect(results.length).toEqual(5);

          results.forEach(result => {
            expect(result).toEqual(jasmine.any(Group));
          });

          done();
        }).catch(failCallback);
      });
    });
  });

  describe('provides a method to get all agents for this group', function() {
    beforeEach(function(done) {
      const failCallback = msg => {
        fail(msg);
        done();
      };

      const args = {
        name: 'myName',
      };

      Group.create(args).then(group => {
        this.group = group;
        done();
      }).catch(failCallback);
    });

    it('returning a promise', function(done) {
      const promise = this.group.agents;

      expect(promise).toEqual(jasmine.any(Promise));

      promise.then(() => {
        done();
      }).catch(() => {
        done();
      });
    });

    describe('w/ existing agents', function() {
      beforeEach(function(done) {
        const failCallback = msg => {
          fail(msg);
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
          Agent.create(attributes).then(agent => {
            done();
          }).catch(failCallback);
        });
      });

      it('resolving to an array of instances of Agent', function(done) {
        this.group.agents.then(agents => {
          expect(agents).toEqual(jasmine.any(Array));
          expect(agents.length).toEqual(5);
          done();
        }).catch(msg => {
          fail(msg);
          done();
        });
      });
    });
  });

  describe('provides a method to get all indicators for this group', function() {
    beforeEach(function(done) {
      const failCallback = msg => {
        fail(msg);
        done();
      };

      const args = {
        name: 'myName',
      };

      Group.create(args).then(group => {
        this.group = group;
        done();
      }).catch(failCallback);
    });

    it('returning a promise', function(done) {
      const promise = this.group.indicators;

      expect(promise).toEqual(jasmine.any(Promise));

      promise.then(() => {
        done();
      }).catch(() => {
        done();
      });
    });

    it('resolving to an array of instances of Indicator', function(done) {
      this.group.indicators.then(indicators => {
        expect(indicators).toEqual(jasmine.any(Array));
        expect(indicators.length).toEqual(IndicatorNames.length);
        done();
      }).catch(msg => {
        fail(msg);
        done();
      });
    });
  });
});
