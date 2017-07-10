
const size = {
  width: 0,
  height: 0,
};

module.exports = {
  before(browser, done) {
    browser.url(browser.launch_url, () => {
      browser.waitForElementVisible('.main-wrapper', 1000);
      done();
    });
  },
  after(browser, done) {
    browser.end(() => {
      done();
    });
  },
  General(browser) {
    browser.assert.title('Resize End Test');
    browser.assert.containsText('.site-title', 'jQuery resizeend event');
  },
  OnLoad(browser) {
    browser.assert.visible('.window');
    browser.assert.containsText('.window', 'load fired');
    browser.windowHandle((handle) => {
      browser.windowSize(handle.value, (object) => {
        size.width = object.value.width;
        size.height = object.value.height;
      });
    });
  },
  OnResizeEnd(browser) {
    browser.resizeWindow((size.width / 2), (size.height / 2), () => {
      browser.assert.containsText('.window', 'resize fired');
      browser.pause(250);
      browser.assert.containsText('.window', 'resizeend fired');
    });
  },
};
