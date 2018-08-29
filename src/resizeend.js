// @flow
const debounce = require('./debounce');

const $ = window.jQuery;
if (!$) {
  throw new Error('resizeend require jQuery');
}

$.event.special.resizeend = {
  setup() {
    const $ctx = $(this);

    function callback(e) {
      e.type = 'resizeend';
      $ctx.trigger('resizeend', e);
    }

    $ctx.on('resize.resizeend', debounce(callback, 250));
  },
  teardown() {
    $(this).off('resize.resizeend');
  },
};
