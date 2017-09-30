

// Add .resolves to sinon stubs
require('sinon-as-promised');

// Mock sequelize
const path = require('path');
const mockRequire = require('mock-require');

// Default all used methods to no-ops that resolve
// an empty promise.  Tests that rely on other
// behavior should stub these methods individually.
mockRequire('sequelize', () => {
  const noop = function () { return Promise.resolve(); };
  return {
    import(filepath) {
      return {
        name: path.basename(filepath),
        findOrCreate: noop,
        update: noop,
        findAll: noop,
        findOne: noop,
        upsert: noop,
        destroy: noop
      };
    }
  };
});
