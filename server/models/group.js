"use strict";

const Base = require('./model/base');
const Agent = require('./agent');
const Indicator = require('./indicator');
const IndicatorNames = require('./indicatorNames');

/**
 * A model describing a group. Extends base.
 *
 * Provides name as attribute.
 *
 * @type {Group}
 */
const Group = class extends Base {
  constructor(args, usePrivate) {
    const schemaDefinition = [
      ['name', { validations: { presence: { message: 'Name is required!' } } }]
    ];
    super(schemaDefinition, args, usePrivate);
  }

  /**
   * A getter to fetch all agents belonging to this group from the data-store. Returns a Promise.
   * Resolves to an array of agents.
   *
   * @return {*}
   */
  get agents() {
    return Agent.where({groupId: this.id});
  }

  /**
   * A getter to fetch all indicators belonging to this group from the data-store. Returns a Promise.
   * Resolves to an array of indicators.
   *
   * @return {*}
   */
  get indicators() {
    return Indicator.where({groupId: this.id});
  }

  /**
   * Extends the destroy-method of the base-model to destroy all indicators belonging to a group, too.
   *
   * @return {Promise}
   */
  destroy() {
    return new Promise((res, rej) => {
      const catchCallback = error => {
        rej(error);
      };

      let promises = [];

      const groupId = this.id;

      const destroyGroupPromise = super.destroy();
      promises.push(destroyGroupPromise);

      destroyGroupPromise.then(() => {
        Indicator.where({ groupId: groupId }).then(indicators => {
          indicators.forEach(indicator => {
            const destroyIndicatorPromise = indicator.destroy();
            promises.push(destroyIndicatorPromise);
          });
          Promise.all(promises).then(() => {
            res();
          }).catch(catchCallback);
        }).catch(catchCallback);
      }).catch(catchCallback);
    });
  }

  /**
   * Extends the create-method of the base-model to create all indicators belonging to a group as defined by IndicatorNmaes, too.
   *
   * @return {Promise}
   */
  static create(args) {
    return new Promise((res, rej) => {
      const catchCallback = error => {
        rej(error);
      };

      let promises = [];

      const createGroupPromise = super.create(args);
      promises.push(createGroupPromise);

      createGroupPromise.then(group => {
        IndicatorNames.forEach(indicatorName => {
          let indicatorArgs = {
            name: indicatorName,
            value: Math.floor(Math.random() * 1000),
            groupId: group.id
          };

          const createIndicatorPromise = Indicator.create(indicatorArgs);
          promises.push(createIndicatorPromise);
        });

        Promise.all(promises).then(() => {
          res(group);
        }).catch(catchCallback);
      }).catch(catchCallback);
    });
  }
};

module.exports = Group;
