"use strict";
const loki = require('lokijs');
const config = require('../../../config');

/**
 * Instanciates Loki w/ options if resolving successfully
 *
 * @param {string} env - the environment used. is evaluated to get the db-path from config and set the autosaveInterval in options
 * @return {Promise}
 */
const dbConnection = function(env) {
  return new Promise((res, rej) => {
    // set default env if non is given
    env = (typeof env === 'undefined') ? 'development' : env;

    // check if env is configured
    if (!Object.keys(config).includes(env)) {
      rej('Environment given is not configured. See config.js.');
    }

    const autoloadCallback = () => {
      res(db);
    };

    // set default options for db
    const options = {
      autosave: true,
      autosaveInterval: 100,
      autoload: true,
      autoloadCallback: autoloadCallback
    };

    if (env === 'test') {
      options.autosaveInterval = 20000;
    }

    const db = new loki(config[env].db, options);
  });
};

module.exports = dbConnection;
