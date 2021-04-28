const IndicatorNames = require('../../server/models/indicatorNames');

describe('IndicatorNames', function() {
  it('is an array', function() {
    expect(IndicatorNames).toEqual(jasmine.any(Array));
  });

  it('consists of names as strings', function() {
    expect(IndicatorNames.length).toEqual(30);
    IndicatorNames.forEach(name => {
      expect(name).toEqual(jasmine.any(String));
    });
  });
});
