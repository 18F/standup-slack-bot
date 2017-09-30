

// Add .resolves to sinon stubs
require('sinon-as-promised');

// Mock sequelize
const path = require('path');
const mockRequire = require('mock-require');

// Default all used methods to no-ops that resolve
// an empty promise.  Tests that rely on other
// behavior should stub these methods individually.
const noop = () => Promise.resolve();
class SequelizeMock {
  constructor() {
    this.import = SequelizeMock.import;
  }

  static import(filepath) {
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
}

mockRequire('sequelize', SequelizeMock);
