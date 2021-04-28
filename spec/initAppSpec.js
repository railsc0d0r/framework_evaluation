const loki = require('lokijs');
const initApp = require('../server/initApp');

describe('initApp()', function() {
  beforeEach(function() {
    this.promise = initApp();
  });

  it('returns a promise', function(done) {
    expect(this.promise).toEqual(jasmine.any(Promise));

    this.promise.then(() => {
      done();
    }).catch(() => {
      done();
    });
  });

  it('resolving to an app as initialized instance of express', function(done) {
    this.promise.then(initializedApp => {
      expect(initializedApp).toBeDefined();
      done();
    }).catch(msg => {
      fail(msg);
      done();
    });
  });

  it('puts the initialized db into the global namespace', function(done) {
    global.db = void 0;
    initApp().then(() => {
      expect(global.db).toEqual(jasmine.any(loki));
      done();
    }).catch(msg => {
      fail(msg);
      done();
    });
  });
});
