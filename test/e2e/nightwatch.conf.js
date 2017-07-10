/* eslint-disable global-require */

require('babel-register');

module.exports = {
  src_folders: ['test/e2e/specs'],
  output_folder: 'test/e2e/reports',
  custom_commands_path: [],

  selenium: {
    start_process: true,
    server_path: require('selenium-server').path,
    host: '127.0.0.1',
    port: 4444,
    log_path: 'test/e2e/logs',
    cli_args: {
      'webdriver.chrome.driver': require('chromedriver').path,
    },
  },

  test_settings: {
    default: {
      launch_url: 'http://localhost:3001',
      skip_testcases_on_fail: false,
      selenium_port: 4444,
      selenium_host: 'localhost',
      desiredCapabilities: {
        javascriptEnabled: true,
        acceptSslCerts: true,
      },
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
  },
};
