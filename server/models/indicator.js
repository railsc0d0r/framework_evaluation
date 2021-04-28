"use strict";

const Base = require('./model/base');

/**
 * A model describing an indicator. Extends base.
 *
 * Provides attributes for name, value and groupId.
 *
 * @type {Indicator}
 */
const Indicator = class extends Base {
  constructor(args, usePrivate) {
    const schemaDefinition = [
      ['name', { validations: { presence: { message: 'Name is required!' } } }],
      ['value'],
      ['groupId', { validations: { presence: { message: 'Group-Id is required!' } } }]
    ];
    super(schemaDefinition, args, usePrivate);
  }
};

module.exports = Indicator;
