module.exports = {
  globalSetup: './test/setup.js',
  globalTeardown: './test/teardown.js',
  testEnvironment: './test/puppeteer-environment.js',
  // "testEnvironment": "node",
  // "collectCoverage": true,
  // "collectThreshold": {
  // },
  // "mapCoverage": true,
  testMatch: [
    // "**/__tests__/**/*.js?(x)",
    // "**/?(*.)(spec|test).js?(x)"
    '**/test/specs/*.test.js',
  ],
};
