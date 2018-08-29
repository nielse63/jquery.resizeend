// Const chalk = require('chalk')
const puppeteer = require('puppeteer');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const server = require('./server');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function setup() {
  console.log('\n');

  console.log('Starting server');
  global.__SERVER__ = await server.start();

  console.log('Setup Puppeteer Environment.');
  const browser = await puppeteer.launch();
  global.__BROWSER__ = browser;
  mkdirp.sync(DIR);
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
