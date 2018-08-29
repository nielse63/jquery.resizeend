module.exports = {
  globalSetup: './test/setup.js',
  globalTeardown: './test/teardown.js',
  testEnvironment: './test/puppeteer-environment.js',
  testMatch: ['**/test/specs/*.test.js'],
};
