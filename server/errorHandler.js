"use-strict";
const isJSON = require('is-valid-json');

/**
 * ErrorHandler is a parser to format an error-object as required by rest
 * @param {string} title - describes the error
 * @param {Object} errors - has to be a valid JSON-object
 */
const ErrorHandler = class {
  constructor(title, errors) {
    if (!title || title.constructor !== String) {
      throw 'ErrorHandler requires at least a title given as string.';
    }

    if (errors && (!isJSON(errors) || errors.constructor === Array)) {
      throw 'ErrorHandler expects errors given to be a JSON-object.';
    }

    this._title = title;
    this._errors = errors;
  }

  /**
   * Returns the error-description given to constructor
   * Implemented just for testing-purposes
   * Returns {string}
   */
  get title() {
    return this._title;
  }

  /**
   * Returns the errors given to constructor
   * Implemented just for testing-purposes
   * Returns {Object}
   */
  get errors() {
    return this._errors;
  }

  /**
   * Returns an array of JSON-objects as send as response to invalid requests to the API
   * @return {Array}
   */
  serializeErrors() {
    let result = [];
    result.push({ title: this._title });

    if (this._errors) {
      result.push(this._errors);
    }

    return result;
  }
};

module.exports = ErrorHandler;