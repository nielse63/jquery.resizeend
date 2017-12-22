// Const chalk = require('chalk')
// const puppeteer = require('puppeteer');
const path = require('path');
const rimraf = require('rimraf');
const os = require('os');
const server = require('./server');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function teardown() {
  console.log('Teardown Puppeteer Environment.');
  await global.__BROWSER__.close();
  rimraf.sync(DIR);

  console.log('Shutting down server');
  server.teardown(global.__SERVER__);
};
