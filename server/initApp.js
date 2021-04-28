"use strict";

// call the packages we need
const express    = require('express');        // call express
const app        = express();                 // define our app using express
const cors       = require('cors');           // define cors as middleware for express
const bodyParser = require('body-parser');    // define bodyParser as middleware for express

const apiRoutes  = require('./routes');
const initDb     = require('./initDb');

/**
 * Calls initDb() and initializes an instance of express if resolving successfully
 * @return {Promise}
 */
const initApp = function() {
  return new Promise((res, rej) => {
    // initialize the db
    initDb().then(() => {
      // configure app to use bodyParser()
      // this will let us get the data from a POST
      app.use(bodyParser.json());

      // configure app to set CORS-headers for all responses
      //
      // {
      //   "origin": "*",
      //     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      //     "preflightContinue": false,
      //     "optionsSuccessStatus": 204
      // }
      app.use(cors());

      const router = express.Router();
      apiRoutes(router);

      //noinspection ES6ModulesDependencies,ES6ModulesDependencies
      if (!(process.env.NODE_ENV === 'test')) {
        app.all('*', function (req, res, next) {
          let msg = '';
          msg += '[';
          msg += new Date(Date.now()).toISOString();
          msg += '] [';
          msg += req.headers.host;
          msg += '] ';
          msg += req.method;
          msg += ' \'';
          msg += req.url;
          msg += '\'';
          if (!(req.body instanceof Object)) {
            msg += ' - ';
            msg += JSON.stringify(req.body);
          }

          console.log(msg);

          next(); // pass control to the next handler
        });
      }

      app.get('/', function(req, res) {
        res.send('Success');
      });

      app.use('/api', router);

      res(app);
    }).catch(msg => {
      rej(msg);
    });

  });
};

module.exports = initApp;
