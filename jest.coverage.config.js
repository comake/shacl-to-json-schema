const jestConfig = require('./jest.config');

module.exports = {
  ...jestConfig,
  coverageThreshold: {
    './src': {
      branches: 90,
      functions: 100,
      lines: 98,
      statements: 98,
    },
  },
};
