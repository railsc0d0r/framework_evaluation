"use strict";

const Promise = require("bluebird");
const Model = Promise.promisifyAll( require('nodejs-model'));

module.exports = Model;
