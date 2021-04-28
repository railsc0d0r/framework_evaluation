const loki = require('lokijs');
const initDb = require('../server/initDb');
const config = require('../config');

describe('initDb()', function() {
  afterEach(function() {
    //noinspection ES6ModulesDependencies,ES6ModulesDependencies
    process.env.NODE_ENV = 'test';
  });

  beforeEach(function() {
    this.promise = initDb();
  });

  it('returns a promise', function(done) {
    expect(this.promise).toEqual(jasmine.any(Promise));

    this.promise.then(() => {
      done();
    }).catch(() => {
      done();
    });
  });

  describe('resolving', function() {
    beforeEach(function(done) {
      this.promise.then(() => {
        done();
      }).catch(msg => {
        fail(msg);
        done();
      });
    });

    it('puts the dbConnection into the global namespace', function() {
      expect(global.db).toEqual(jasmine.any(loki));
    });
  });

  it('takes the NODE_ENV env-var and gives it as argument to dbConnection() thus creating the right db', function(done) {
    const envs = ['test', 'development'];

    envs.forEach(env => {
      global.db = void 0;
      process.env.NODE_ENV = env;
      initDb().then(() => {
        expect(global.db.filename).toEqual(config[env].db);
        done();
      }).catch(msg => {
        fail(msg);
        done();
      });
    });
  });
});
