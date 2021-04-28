"use strict";

const Base = require('./model/base');

/**
 * A model describing an agent. Extends base.
 *
 * Provides attributes for name, status and groupId
 *
 * @type {Agent}
 */
const Agent = class extends Base {
  constructor(args, usePrivate) {
    const schemaDefinition = [
      ['name', { validations: { presence: { message: 'Name is required!' } } }],
      ['status'],
      ['groupId', { validations: { presence: { message: 'Group-Id is required!' } } }]
    ];
    super(schemaDefinition, args, usePrivate);
  }
};

module.exports = Agent;
