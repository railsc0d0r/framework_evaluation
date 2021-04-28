const initDb = require('../../server/initDb');
const config = require('../../config');
const fs  = require('fs');

beforeEach(function(done) {
  // Remove the test-db before every spec
  const initializeDatabase = () => {
    initDb().then(() => {
      done();
    }).catch(msg => {
      fail(msg);
      done();
    });
  };

  fs.stat(config.test.db, (err, stats) => {
    if (!err) {
      fs.unlink(config.test.db, () => {
        initializeDatabase();
      });
    } else {
      initializeDatabase();
    }
  });
});
