const Indicator = require('../../server/models/indicator');

describe('Indicator', function() {
  describe('as an instance', function() {
    beforeEach(function() {
      this.createdAt = new Date(Date.now());
      jasmine.clock().install();
      jasmine.clock().mockDate(this.createdAt);

      this.args = {
        id: 1,
        name: 'foo',
        value: 'bar',
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
        this.indicator = new Indicator(this.args);
      });

      it('returning an instance', function() {
        expect(this.indicator).toEqual(jasmine.any(Indicator));
      });

      it('providing a method to serialize all attributes', function() {
        this.args.id = void(0);
        this.args.createdAt = void(0);
        this.args.updatedAt = void(0);

        expect(this.indicator.serializeAttributes()).toEqual(this.args);
      });

      describe('providing a getter to', function() {
        it('an array of its attributes', function() {
          expect(this.indicator.attributes).toEqual(Object.keys(this.args));
        });

        it('id which is private thus not set, yet', function() {
          expect(this.indicator.id).not.toBeDefined();
        });

        it('name', function() {
          expect(this.indicator.name).toEqual(this.args.name);
        });

        it('value', function() {
          expect(this.indicator.value).toEqual(this.args.value);
        });

        it('groupId', function() {
          expect(this.indicator.groupId).toEqual(this.args.groupId);
        });

        it('createdAt which is private thus not set, yet', function() {
          expect(this.indicator.createdAt).not.toBeDefined();
        });

        it('updatedAt which is private thus not set, yet', function() {
          expect(this.indicator.updatedAt).not.toBeDefined();
        });
      });

      describe('providing a setter to', function() {
        it('name', function() {
          const newName = 'myTest';
          this.indicator.name = newName;
          expect(this.indicator.name).toEqual(newName);
        });

        it('value', function() {
          const newValue = 'myTest';
          this.indicator.value = newValue;
          expect(this.indicator.value).toEqual(newValue);
        });

        it('groupId', function() {
          const newGroupId = 'myTest';
          this.indicator.groupId = newGroupId;
          expect(this.indicator.groupId).toEqual(newGroupId);
        });
      });

      describe('because they\'re tagged private providing no setter to', function() {
        it('id' , function() {
          this.indicator.id = 2;
          expect(this.indicator.id).not.toBeDefined();
        });

        it('createdAt' , function() {
          this.indicator.createdAt = 2;
          expect(this.indicator.createdAt).not.toBeDefined();
        });

        it('updatedAt' , function() {
          this.indicator.updatedAt = 2;
          expect(this.indicator.updatedAt).not.toBeDefined();
        });
      });

      describe('to indicate a state providing a getter for', function() {
        it('isNew', function() {
          expect(this.indicator.isNew).toBeDefined();
          expect(this.indicator.isNew).toBeTruthy();
        });

        describe('isDirty returning', function() {
          it('false if nothing has changed', function() {
            expect(this.indicator.isDirty).toBeFalsy();
            this.indicator.name = this.args.name;
            expect(this.indicator.isDirty).toBeFalsy();
          });

          it('true if attributes are changed', function() {
            this.indicator.name = 'test';
            expect(this.indicator.isDirty).toBeTruthy();
          });
        });

        describe('attributeChanges returning', function() {
          it('an empty array if nothing has changed', function() {
            expect(this.indicator.attributeChanges).toEqual([]);
          });

          it('an array of changes for attributes changed', function() {
            const newName = 'newName';
            const newValue = 'newValue';

            const expectedChanges = [
              {
                key: 'name',
                oldValue: this.args.name,
                currentValue: newName
              }, {
                key: 'value',
                oldValue: this.args.value,
                currentValue: newValue
              }
            ];

            this.indicator.name = newName;
            this.indicator.value = newValue;

            expect(this.indicator.attributeChanges).toEqual(expectedChanges);
          });
        });
      });
    });

    describe('can validate itself', function() {
      beforeEach(function() {
        this.args = {};
        this.indicator = new Indicator(this.args);
      });

      it('returning an error if no name is set', function(done) {
        this.indicator.validate().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(this.indicator.isValid).toBeFalsy();
          expect(this.indicator.errors.name).toContain('Name is required!');
          done();
        });
      });

      it('returning an error if no group_id is set', function(done) {
        this.indicator.validate().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(this.indicator.isValid).toBeFalsy();
          expect(this.indicator.errors.groupId).toContain('Group-Id is required!');
          done();
        });
      });

      it('providing a getter to validation-errors', function(done) {
        expect(this.indicator.errors).toBeDefined();
        expect(this.indicator.errors).toEqual([]);

        this.indicator.validate().catch(() => {
          expect(this.indicator.errors.length).not.toBeNull();
          expect(Object.keys(this.indicator.errors)).toEqual([ 'name', 'groupId' ]);
          done();
        });
      });
    });

    describe('can save itself', function() {
      beforeEach(function() {
        this.args = {};
        this.indicator = new Indicator(this.args);
      });

      it('returning a Promise', function(done) {
        const promise = this.indicator.save();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if validations fail', function(done) {
        spyOn(this.indicator, 'validate').and.callThrough();
        this.indicator.save().catch((error) => {
          expect(error).toContain({ title: 'Validation failed.' });
          expect(error).toContain({
            name: [ 'Name is required!' ],
            groupId: [ 'Group-Id is required!' ]
          });
          expect(this.indicator.validate).toHaveBeenCalled();
          expect(this.indicator.isValid).toBeFalsy();
          done();
        });
      });

      describe('successfully', function() {
        beforeEach(function() {
          this.myName = 'myName';
          this.myValue = 'myValue';
          this.myGroupId = '42';

          this.indicator.name = this.myName;
          this.indicator.value = this.myValue;
          this.indicator.groupId = this.myGroupId;

          this.promise = this.indicator.save();
        });

        describe('returning an instance that', function() {
          it('is not new nor dirty', function(done) {
            const failCallback = msg => {
              fail(msg);
              done();
            };

            const expectationCallBack = indicator => {
              expect(indicator.isNew).toBeFalsy();
              expect(indicator.isDirty).toBeFalsy();
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });

          it('has an id set as attribute', function(done) {
            const failCallback = msg => {
              fail(msg);
              done();
            };

            const expectationCallBack = indicator => {
              expect(indicator.id).toBeDefined();
              done();
            };

            this.promise.then(expectationCallBack).catch(failCallback);
          });

          it('has timestamps set as attributes', function(done) {
            const failCallback = (msg) => {
              fail(msg);
              done();
            };

            const expectationCallBack = indicator => {
              expect(indicator.createdAt).toEqual(this.createdAt);
              expect(indicator.updatedAt).toEqual(this.createdAt);
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
        const promise = Indicator.create();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if arguments are not valid, returning a message containing all errors', function(done) {
        const promise = Indicator.create();

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

      it('resolving if arguments are valid, returning an instance of indicator', function(done) {
        const args = {
          name: 'myName',
          value: 'myValue',
          groupId: '42'
        };
        const promise = Indicator.create(args);

        const failCallback = msg => {
          fail(msg);
          done();
        };

        promise.then( indicator => {
          expect(indicator).toEqual(jasmine.any(Indicator));
          expect(indicator.isNew).toBeFalsy();
          expect(indicator.isDirty).toBeFalsy();
          expect(indicator.id).toBeDefined();
          expect(indicator.createdAt).toBeDefined();

          Object.keys(args).forEach(property => {
            expect(indicator[property]).toEqual(args[property]);
          });

          done();
        })
        .catch(failCallback);
      });
    });

    describe('can find all indicators with attributes of given values', function() {
      beforeEach(function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        const modelProperties = [
          {
            name: 'myName1',
            value: 'myValueWhereTest',
            groupId: '4711'
          },
          {
            name: 'myName2',
            value: 'myValue',
            groupId: '4711'
          },
          {
            name: 'myName3',
            value: 'myValueWhereTest',
            groupId: '2342'
          },
          {
            name: 'myName4',
            value: 'myValue',
            groupId: '2342'
          },
          {
            name: 'myName5',
            value: 'myValue',
            groupId: '2342'
          }
        ];

        modelProperties.forEach(attributes => {
          Indicator.create(attributes).then(() => {
            done();
          }).catch(failCallback);
        });
      });

      it('returning a promise', function(done) {
        const callback = () => { done(); };

        const promise = Indicator.where();

        expect(promise).toEqual(jasmine.any(Promise));

        promise.then(callback).catch(callback);
      });

      it('rejecting if no arguments are given', function(done) {
        Indicator.where().then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(error => {
          expect(error).toEqual([
            {
              title: 'No params given to find instances of Indicator.'
            }
          ]);
          done();
        });
      });

      it('rejecting if given query-parameters are not a valid JSON-object', function(done) {
        [[], 1223, 'asdfg', Date.now].forEach(invalidParams => {
          Indicator.where(invalidParams).then(() => {
            fail('expected this promise to reject.');
            done();
          }).catch(error => {
            expect(error).toEqual([
              {
                title: 'Params given to find instances of Indicator are not a valid JSON-object.'
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

        Indicator.where(queryParams).then(() => {
          fail('expected this promise to reject.');
          done();
        }).catch(error => {
          expect(error).toEqual([
            {
              title: 'Parameters given are not valid attributes of Indicator: zip, city.'
            }
          ]);
          done();
        });
      });

      it('resolving to an array of instances of Indicator if valid query-params are given', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        const validQueryParams = [
          {
            params: {
              value: 'myValueWhereTest'
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
              value: 'myValueWhereTest',
              groupId: '2342'
            },
            resultCount: 1
          }
        ];

        validQueryParams.forEach(validQueryParam => {
          Indicator.where(validQueryParam.params).then(resultSet => {
            expect(resultSet).toEqual(jasmine.any(Array));
            resultSet.forEach(result => {
              expect(result).toEqual(jasmine.any(Indicator));
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
        value: 'myValue',
        groupId: '42'
      };

      const failCallback = msg => {
        fail(msg);
        done();
      };

      Indicator.create(this.args)
               .then(indicator => {
                 this.indicator = indicator;
                 done();
               })
               .catch(failCallback);
    });

    it('returning a promise', function(done) {
      const promise = this.indicator.update();
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
        this.indicator.update(args).then(indicator => {
          const currentAttributes = indicator.serializeAttributes();
          Object.keys(this.args).forEach(property => {
            expect(currentAttributes[property]).toEqual(this.args[property]);
          });
          done();
        }).catch(failCallback);
      });
    });

    it('rejecting if given arguments are not a valid JSON-object.', function(done) {
      [[],'abcdefgh',123].forEach(args => {
        this.indicator.update(args).then(() => {
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
        jasmine.clock().mockDate(this.indicator.createdAt);
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });

      it('rejecting, if timestamp for last update of model in data-store is newer than timestamp of attributes given to update', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        let argumentsForRejectingUpdate = this.indicator.serializeAttributes();
        argumentsForRejectingUpdate.value = 'myUpdatedValue';

        const newArgs = {
          value: 'myNewValue',
          groupId: '23'
        };

        jasmine.clock().tick(10000);

        this.indicator.update(newArgs).then(indicator => {
          indicator.update(argumentsForRejectingUpdate).then(() => {
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
        value: 'myNewValue',
        groupId: '23'
      };

      this.indicator.update(newArgs).then(indicator => {
        expect(indicator.id).toEqual(this.indicator.id);
        expect(indicator.name).toEqual(this.args.name);
        expect(indicator.value).toEqual(newArgs.value);
        expect(indicator.groupId).toEqual(newArgs.groupId);

        done();
      }).catch(msg => {
        fail(msg);
        done();
      });

    });

    it('really updating the instance if valid arguments are given', function(done) {
      const newArgs = {
        value: 'myNewValue',
        groupId: '23'
      };

      const failCallback = msg => {
        fail(msg);
        done();
      };

      this.indicator.update(newArgs).then(() => {
        Indicator.find(this.indicator.id).then(indicator => {
          expect(indicator.id).toEqual(this.indicator.id);
          expect(indicator.name).toEqual(this.args.name);
          expect(indicator.value).toEqual(newArgs.value);
          expect(indicator.groupId).toEqual(newArgs.groupId);

          done();
        }).catch(failCallback);
      }).catch(failCallback);

    });
  });

  describe('given an id', function() {
    beforeEach(function(done) {
      this.args = {
        name: 'myName',
        value: 'myValue',
        groupId: '42'
      };

      Indicator.create(this.args).then(indicator => {
        this.indicator = indicator;
        this.id = this.indicator.id;
        done();
      });
    });

    describe('finds the existing object in db', function() {
      it('returning a promise', function(done) {
        const promise = Indicator.find();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.catch(() => {
          done();
        });
      });

      it('rejecting if id given is not a positive integer', function(done) {
        [void(0),'a','','-1','0',-1,0].forEach( id => {
          Indicator.find(id).catch((error) => {
            expect(error).toEqual([
                {
                  title: 'No valid id given to find Indicator.'
                }
              ]);
            done();
          });
        });
      });

      it('rejecting if no object w/ given id is found in store', function(done) {
        const id = this.id + 1;
        Indicator.find(id).catch(error => {
          expect(error).toEqual([
            {
              title: `No Indicator found for id ${id}.`
            }
          ]);
          done();
        });
      });

      it('resolving to an instance of indicator if an object is found in store', function(done) {
        Indicator.find(this.id).then((indicator) => {
          expect(indicator).toEqual(jasmine.any(Indicator));
          expect(indicator.serializeAttributes()).toEqual(this.indicator.serializeAttributes());
          done();
        }).catch(msg => {
          fail(msg);
          done();
        });
      });
    });

    describe('removes the existing object from store', function() {
      it('returning a promise', function(done) {
        const promise = this.indicator.destroy();
        expect(promise).toEqual(jasmine.any(Promise));

        promise.then(() => {
          done();
        }).catch(() => {
          done();
        });
      });

      it('resolving if indicator was successfully removed from store', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.indicator.destroy().then(() => {
          Indicator.find(this.id).then(() => {
            fail('Expected indicator to be removed from store.');
            done();
          }).catch(() => {
            done();
          });
        }).catch(failCallback);
      });

      it('rejecting if indicator was already removed from store', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        this.indicator.destroy().then(() => {
          this.indicator.destroy().then(() => {
            fail('Didn\'t expect promise to resolve.');
            done();
          }).catch(error => {
            expect(error).toEqual([{ title: 'Indicator doesn\'t exist in store anymore.' }]);
            done();
          });
        }).catch(failCallback);
      });
    });
  });

  describe('can find all instances', function() {
    it('returning a promise', function(done) {
      const promise = Indicator.all();

      expect(promise).toEqual(jasmine.any(Promise));

      promise.then(() => {
        done();
      }).catch(() => {
        done();
      });
    });

    it('resolving to an empty array if there are no instances in data-store', function(done) {
      Indicator.all().then(results => {
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
            value: 'myValueWhereTest',
            groupId: '4711'
          },
          {
            name: 'myName2',
            value: 'myValue',
            groupId: '4711'
          },
          {
            name: 'myName3',
            value: 'myValueWhereTest',
            groupId: '2342'
          },
          {
            name: 'myName4',
            value: 'myValue',
            groupId: '2342'
          },
          {
            name: 'myName5',
            value: 'myValue',
            groupId: '2342'
          }
        ];

        modelProperties.forEach(attributes => {
          Indicator.create(attributes).then(() => {
            done();
          }).catch(failCallback);
        });
      });

      it('resolving to an array of instances', function(done) {
        const failCallback = msg => {
          fail(msg);
          done();
        };

        Indicator.all().then(results => {
          expect(results).toEqual(jasmine.any(Array));
          expect(results.length).toEqual(5);

          results.forEach(result => {
            expect(result).toEqual(jasmine.any(Indicator));
          });

          done();
        }).catch(failCallback);
      });
    });
  });
});
