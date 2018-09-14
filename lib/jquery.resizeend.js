(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  function debounce(func) {
    var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    var immediate = arguments[2];

    var timeout = void 0;
    var args = void 0;
    var context = void 0;
    var timestamp = void 0;
    var result = void 0;

    function later() {
      var last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = null;
          args = null;
        }
      }
    }

    var debounced = function debounced() {
      context = this;

      for (var _len = arguments.length, args1 = Array(_len), _key = 0; _key < _len; _key++) {
        args1[_key] = arguments[_key];
      }

      args = args1;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = null;
        args = null;
      }
      return result;
    };

    debounced.clear = function clear() {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    debounced.flush = function flush() {
      if (timeout) {
        result = func.apply(context, args);
        context = null;
        args = null;

        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced;
  }

  var $ = window.jQuery;
  if (!$) {
    throw new Error('resizeend require jQuery');
  }

  $.event.special.resizeend = {
    setup: function setup() {
      var context = this;
      var $context = $(context);

      function callback(event) {
        event.type = 'resizeend';
        $context.trigger('resizeend', event);
      }
      $context.on('resize.resizeend', debounce.call(null, callback, 250));
    },
    teardown: function teardown() {
      $(this).off('resize.resizeend');
    }
  };

})));
