const Loki = require('lokijs');
const dbConnection = require('../../../server/models/model/dbConnection');
const config = require('../../../config');

describe('dbConnection()', function() {
  describe('creates a new db-connection', function() {
    beforeEach(function() {
      this.promise = dbConnection();
    });

    it('returning a promise', function(done) {
      expect(this.promise).toEqual(jasmine.any(Promise));

      this.promise.then(() => {
        done();
      }).catch(() => {
        done();
      });
    });

    describe('resolving', function() {
      beforeEach(function(done) {
        this.promise.then(db => {
          this.db = db;
          done();
        }).catch(msg => {
          fail(msg);
          done()
        });
      });

      it('resolving to an instance of LokiJs', function() {
        expect(this.db).toEqual(jasmine.any(Loki));
      });

      it('with autosave enabled', function() {
        expect(this.db.autosave).toBeTruthy();
      });

      it('with autosaveInterval set to 100ms as default', function() {
        expect(this.db.autosaveInterval).toEqual(100);
      });

      it('using the development-db as default, if no env is given', function() {
        expect(this.db.filename).toEqual(config['development'].db);
      });
    });
  });

  it('changes the db depending on the environment set', function(done) {
    const envs = ['test', 'development'];

    envs.forEach(env => {
      dbConnection(env).then(db => {
        expect(db.filename).toEqual(config[env].db);
        done();
      });
    });
  });

  it('rejects the promise w/ an error if an unconfigured environment is given', function(done) {
    dbConnection('myEnv').then(() => {
      fail('Didn\'t expect to resolve this promise.');
      done();
    }).catch(msg => {
      expect(msg).toEqual('Environment given is not configured. See config.js.');
      done();
    });
  });
});
