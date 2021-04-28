"use strict";

const _ = require('lodash');
const isJSON = require('is-valid-json');

const defineSchema = require('./defineSchema');
const ErrorHandler = require('../../errorHandler');

/**
 * The base-model to be extended.
 *
 * Provides methods to create an instance, validate the given attributes and create getter and setter for them.
 * Facilitates queries to the data-store, saves, updates and destroys the model-instances.
 *
 * @type {Base}
 */
const Base = class {
  constructor(schemaDefinition, args, usePrivate) {
    // provide default values
    schemaDefinition = (typeof schemaDefinition === 'undefined') ? [] : schemaDefinition;
    args = (typeof args === 'undefined') ? {} : args;

    // add id and timestamps to schemaDefinition
    Base._addIdAndTimeStampsToSchemaDefinition(schemaDefinition);

    // define the modelName
    this.modelName = this.constructor.name;

    // create the schema of nodejs-model using the name of the child and the defined attributes
    let schema = defineSchema(this.modelName);

    schemaDefinition.forEach(attribute => {
      schema.attr(attribute[0], attribute[1]);
    });

    // get the defined attributes
    const attrsDefs = schema.attrsDefs();
    this.attributes = Object.keys(attrsDefs);

    // create the instance of nodejs-model to describe our data-structure
    this.instance = schema.create();


    this.deserializeAttributes(args, usePrivate);

    // provide getter and setter for all attributes of this.instance to outer model-instance
    this.attributes.forEach((attribute) => {
      let options = {};

      options.get = function() {
        return this.instance[attribute]();
      };

      // only provide a setter for non-private attributes
      if (!attrsDefs[attribute].tags.includes('private')) {
        options.set = function (value) {
          this.instance[attribute](value);
        };
      }

      Object.defineProperty(this, attribute, options);
    });

    this.collection = Base._evaluateCollection(this.modelName);
  }

  /**
   * A getter to validation-errors as provided by nodejs-model
   *
   * @return {Object} errors
   */
  get errors() {
    return this.instance.errors;
  }

  /**
   * A getter to check if an id is set thus inferring if the model is already saved in the data-store
   *
   * @return {boolean}
   */
  get isNew() {
    return !this.id;
  }

  /**
   * A getter to check if there are pending changes on model-attributes not saved already
   *
   * @return {boolean}
   */
  get isDirty() {
    let currentValues = this.serializeAttributes();
    return !(_.isEqual(currentValues, this.oldValues));
  }

  /**
   * A getter to the changes on model-attributes not saved already
   *
   * @return {Array} attribueChanges - an array of changed attributes as objects like { key: <name>, oldValue: <value>, newValue: <value> }
   */
  get attributeChanges() {
    let currentValues = this.serializeAttributes();
    return _.reduce(currentValues, (result, value, key) => {
      return _.isEqual(value, this.oldValues[key]) ?
        result : result.concat({key: key, oldValue: this.oldValues[key], currentValue: value});
    }, []);
  }

  /**
   * Returns a JSON-object w/ serialized attributes to be send as response
   *
   * @param {boolean} withoutPrivateAttributes
   * @return {Object}
   */
  serializeAttributes(withoutPrivateAttributes) {
    let values = {};
    this.attributes.forEach(attribute => {
      values[attribute] = this.instance[attribute]();
    });

    if (withoutPrivateAttributes) {
      ['id', 'createdAt', 'updatedAt'].forEach((attribute) => {
        delete values[attribute];
      });
    }

    return values;
  }

  /**
   * A method to set attributes on a model-instance from given JSON-object
   *
   * @param {Object} attributes
   * @param {boolean} usePrivate
   */
  deserializeAttributes(attributes, usePrivate) {
    // set attributes of nodejs-model with given arguments, conditionally leaving out attributes tagged private
    this.instance.update(attributes);

    if (usePrivate) {
      this.instance.update(attributes, 'private');
    }

    // store the current attribute-values
    this.oldValues = this.serializeAttributes();
  }

  /**
   * A method to validate a model-instance
   *
   * @return {Promise}
   */
  validate() {
    return new Promise((res, rej) => {
      this.instance.validate().then(() => {
        this.isValid = this.instance.isValid;
        if (this.instance.isValid) {
          return res(this);
        } else {
          const title = 'Validation failed.';
          const msg = new ErrorHandler(title, this.errors).serializeErrors();
          return rej(msg);
        }
      });
    });
  }

  /**
   * A method to store a model-instance in the data-store
   *
   * @return {Promise}
   */
  save() {
    return new Promise((res, rej) => {
      this.validate().then((model) => {
        let collectionObj = {};
        const timeStamp = new Date(Date.now());

        let attributesToStore = model.serializeAttributes(true);
        attributesToStore.updatedAt = timeStamp;

        if(model.isNew) {
          attributesToStore.createdAt = timeStamp;
          collectionObj = model.collection.insert(attributesToStore);
        } else {
          collectionObj = model.collection.get(model.id);
          Object.keys(attributesToStore).forEach(property => {
            collectionObj[property] = attributesToStore[property];
          });
          model.collection.update(collectionObj);
        }

        Base._mapMetaData(collectionObj);
        model.deserializeAttributes(collectionObj, true);

        if (model.isNew || model.isDirty) {
          let error = new ErrorHandler('Saving failed.').serializeErrors();
          return rej(error);
        } else {
          return res(model);
        }
      }).catch((error) => {
        return rej(error);
      });
    });
  }

  /**
   * A method to update a model-instance w/ given attributes and store it in the data-store
   *
   * @param {Object} args
   * @return {Promise}
   */
  update(args) {
    return new Promise((res, rej) => {
      if (args && (!isJSON(args) || args.constructor === Array)) {
        return rej('Arguments given to update model are not a valid JSON-object');
      }

      if (!args || args === {}) {
        return res(this);
      }

      if (args.updatedAt && new Date(args.updatedAt).getTime() < this.updatedAt.getTime()) {
        return rej('Model in store was updated meanwhile. Please reload model and try again.');
      }

      this.attributes.forEach(attr => {
        if (Object.getOwnPropertyDescriptor(this, attr).set && args[attr]) {
          this[attr] = args[attr];
        }
      });

      this.save().then(indicator => {
        return res(indicator);
      }).catch(error => {
        return rej(error);
      });
    });
  }

  /**
   * A method to remove a model-instance from the data-store
   *
   * @return {Promise}
   */
  destroy() {
    return new Promise((res, rej) => {
      const collectionObj = this.collection.get(this.id);

      if (collectionObj) {
        this.collection.remove(collectionObj);
        return res();
      } else {
        const msg = `${this.constructor.name} doesn\'t exist in store anymore.`;
        const error = new ErrorHandler(msg).serializeErrors();
        return rej(error);
      }
    });
  }

  /**
   * A method to create a model-instance w/ given attributes
   *
   * @param {Object} args
   * @return {Promise}
   */
  static create(args) {
    return new Promise((res, rej) => {
      let modelInstance = new this(args);
      modelInstance.save()
                   .then( obj => {
                     return res(obj);
                   })
                   .catch( error => {
                     return rej(error);
                   });
    });
  }

  /**
   * A method to fetch a record in the data-store by given ID
   * Resolves to an instance of the model
   *
   * @param id
   * @return {Promise}
   */
  static find(id) {
    return new Promise((res, rej) => {
      if (!Base._isPositiveInteger(id)) {
        const error = new ErrorHandler(`No valid id given to find ${this.name}.`).serializeErrors();
        return rej(error);
      }

      let result = Base._evaluateCollection(this.name).get(id);

      if (!result) {
        const error = new ErrorHandler(`No ${this.name} found for id ${id}.`).serializeErrors();
        return rej(error);
      }

      const modelInstance = new this(result, true);

      return res(modelInstance);
    });
  }

  /**
   * A method to fetch all records of a type from the data-store.
   * Resolves to an Array of model-instances
   *
   * @return {Promise}
   */
  static all() {
    return new Promise((res, rej) => {
      const whereCallback = obj => {
        return true;
      };

      let resultObjects = Base._evaluateCollection(this.name).where(whereCallback);

      let resultSet = [];
      resultObjects.forEach(resultObject => {
        resultSet.push(new this(resultObject, true));
      });

      return res(resultSet);
    });
  }

  /**
   * A method to fetch all records of a type and certain attributes by given query-params from the data-store.
   * Resolves to an Array of model-instances
   *
   * @return {Promise}
   */
  static where(queryParams) {
    return new Promise((res, rej) => {
      if (!queryParams) {
        const error = new ErrorHandler(`No params given to find instances of ${this.name}.`).serializeErrors();
        return rej(error);
      }

      if (queryParams && (!isJSON(queryParams) || queryParams.constructor === Array)) {
        const error = new ErrorHandler(`Params given to find instances of ${this.name} are not a valid JSON-object.`).serializeErrors();
        return rej(error);
      }

      const instanceAttributes = new this().attributes;

      let invalidAttributes = [];

      Object.keys(queryParams).forEach(key => {
        if (!instanceAttributes.includes(key)) {
          invalidAttributes.push(key);
        }
      });

      if (invalidAttributes.length > 0) {
        const error = new ErrorHandler(`Parameters given are not valid attributes of ${this.name}: ${invalidAttributes.join(', ')}.`).serializeErrors();
        return rej(error);
      }

      const whereCallback = obj => {
        let valid = true;

        Object.keys(queryParams).forEach(key => {
          valid = valid && obj[key] == queryParams[key];
        });

        return valid;
      };

      let resultObjects = Base._evaluateCollection(this.name).where(whereCallback);

      let resultSet = [];
      resultObjects.forEach(resultObject => {
        resultSet.push(new this(resultObject, true));
      });

      return res(resultSet);
    });
  }

  /**
   * A method to get the collection used for this model
   *
   * @param {string} modelName
   * @return {Collection|*}
   * @private
   */
  static _evaluateCollection(modelName) {
    let collection = global.db.getCollection(modelName);

    if (!collection) {
      collection = global.db.addCollection(modelName);
    }

    return collection;
  }

  /**
   * A method to ad id and timestamps to the schemadefinition of a model
   *
   * @param schemaDefinition
   * @private
   */
  static _addIdAndTimeStampsToSchemaDefinition(schemaDefinition) {
    // add id at the beginning
    schemaDefinition.unshift(['id', { tags: ['private'] }]);

    // add timestamps at the end
    schemaDefinition.push(['createdAt', { tags: ['private'] }]);
    schemaDefinition.push(['updatedAt', { tags: ['private'] }]);
  }

  /**
   * A method to check if a given argument is a positive integer
   * Used to check if a given id is valid
   *
   * @param str
   * @return {boolean}
   * @private
   */
  static _isPositiveInteger(str) {
    str = String(str);
    const n = Math.floor(Number(str));
    return String(n) === str && n > 0;
  }

  /**
   * Maps metadata from collection-objects like id and timestamps to model-attributes
   *
   * @param collectionObj
   * @private
   */
  static _mapMetaData(collectionObj) {
    collectionObj.id = collectionObj['$loki'];
    collectionObj.createdAt = new Date(collectionObj.meta.created);
    if (collectionObj.meta.updated) {
      collectionObj.updatedAt = new Date(collectionObj.meta.updated);
    } else {
      collectionObj.updatedAt = new Date(collectionObj.meta.created);
    }
  }

};

module.exports = Base;
