const AgentStates = require('../../server/models/agentStates');

describe('AgentStates', function() {
  it('is an array', function() {
    expect(AgentStates).toEqual(jasmine.any(Array));
  });

  it('consists of names as strings', function() {
    expect(AgentStates.length).toEqual(7);
    AgentStates.forEach(name => {
      expect(name).toEqual(jasmine.any(String));
    });
  });
});
