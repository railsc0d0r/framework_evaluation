const dbConnection = require('./models/model/dbConnection');

/**
 * Creates an instance of the data-store and puts it into the global name-space if successful
 * @return {Promise}
 */
const initDb = function() {
  return new Promise((res, rej) => {
    //noinspection ES6ModulesDependencies,ES6ModulesDependencies
    const env = process.env.NODE_ENV;
    dbConnection(env).then(db => {
      global.db = db;
      res();
    }).catch(msg => {
      rej(msg);
    });
  });
};

module.exports = initDb;
