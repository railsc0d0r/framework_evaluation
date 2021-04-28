const ErrorHandler = require('../server/errorHandler');

describe('ErrorHandler', function() {
  describe('to be created', function() {
    it('takes at least a title as argument', function() {
      [void(0),{},[]].forEach(invalidTitle => {
        const throwsAnException = () => {
          new ErrorHandler(invalidTitle);
        };

        expect(throwsAnException).toThrow('ErrorHandler requires at least a title given as string.');
      });
    });

    it('validates errors to be a JSON-object if given', function() {
      ['123', 567, []].forEach(invalidErrors => {
        const throwsAnException = () => {
          new ErrorHandler('myError', invalidErrors);
        };

        expect(throwsAnException).toThrow('ErrorHandler expects errors given to be a JSON-object.');
      });
    });
  });

  describe('as instance', function() {
    beforeEach(function() {
      this.title = 'myError';
      this.errors = {
        name: [ 'Name is required!' ],
        groupId: [ 'Group-Id is required!' ]
      };
      this.errorHandler = new ErrorHandler(this.title, this.errors);
    });

    it('stores the title given and provides a getter to it', function() {
      expect(this.errorHandler.title).toEqual(this.title);
    });

    it('stores the errors given and provides a getter to them', function() {
      expect(this.errorHandler.errors).toEqual(this.errors);
    });

    describe('provides a method formatting an error-object to be used in model-methods', function() {
      it('returning an array', function() {
        expect(this.errorHandler.serializeErrors()).toEqual(jasmine.any(Array));
      });

      it('containing the title as object', function() {
        expect(this.errorHandler.serializeErrors()).toContain({ title: this.title });
      });

      it('containing the errors as object', function() {
        expect(this.errorHandler.serializeErrors()).toContain(this.errors);
      });
    });
  });
});
