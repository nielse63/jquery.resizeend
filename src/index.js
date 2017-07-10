
import debounce from './debounce';

const $ = window.jQuery;
if (!$) {
  throw new Error('resizeend require jQuery');
}

$.event.special.resizeend = {
  setup() {
    const context = this;
    const $context = $(context);

    function callback(event) {
      event.type = 'resizeend';
      $context.trigger('resizeend', event);
    }
    $context.on('resize.resizeend', debounce.call(null, callback, 250));
  },
  teardown() {
    $(this).off('resize.resizeend');
  },
};
