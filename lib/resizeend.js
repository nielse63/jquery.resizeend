/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./src/resizeend.js ***!
  \**************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar debounce = __webpack_require__(/*! ./debounce */ 1);\n\nvar $ = window.jQuery;\nif (!$) {\n  throw new Error('resizeend require jQuery');\n}\n\n$.event.special.resizeend = {\n  setup: function setup() {\n    var $ctx = $(this);\n\n    function callback(e) {\n      e.type = 'resizeend';\n      $ctx.trigger('resizeend', e);\n    }\n\n    $ctx.on('resize.resizeend', debounce(callback, 250));\n  },\n  teardown: function teardown() {\n    $(this).off('resize.resizeend');\n  }\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvcmVzaXplZW5kLmpzP2Q4ODciXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyk7XG5cbmNvbnN0ICQgPSB3aW5kb3cualF1ZXJ5O1xuaWYgKCEkKSB7XG4gIHRocm93IG5ldyBFcnJvcigncmVzaXplZW5kIHJlcXVpcmUgalF1ZXJ5Jyk7XG59XG5cbiQuZXZlbnQuc3BlY2lhbC5yZXNpemVlbmQgPSB7XG4gIHNldHVwKCkge1xuICAgIGNvbnN0ICRjdHggPSAkKHRoaXMpO1xuXG4gICAgZnVuY3Rpb24gY2FsbGJhY2soZSkge1xuICAgICAgZS50eXBlID0gJ3Jlc2l6ZWVuZCc7XG4gICAgICAkY3R4LnRyaWdnZXIoJ3Jlc2l6ZWVuZCcsIGUpO1xuICAgIH1cblxuICAgICRjdHgub24oJ3Jlc2l6ZS5yZXNpemVlbmQnLCBkZWJvdW5jZShjYWxsYmFjaywgMjUwKSk7XG4gIH0sXG4gIHRlYXJkb3duKCkge1xuICAgICQodGhpcykub2ZmKCdyZXNpemUucmVzaXplZW5kJyk7XG4gIH0sXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9yZXNpemVlbmQuanMiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYkEiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///0\n");

/***/ }),
/* 1 */
/*!*************************!*\
  !*** ./src/debounce.js ***!
  \*************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function debounce(func) {\n  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;\n  var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;\n\n  var timeout = void 0;\n  var args = void 0;\n  var context = void 0;\n  var timestamp = void 0;\n  var result = void 0;\n\n  function later() {\n    var last = Date.now() - timestamp;\n\n    if (last < wait && last >= 0) {\n      timeout = setTimeout(later, wait - last);\n    } else {\n      timeout = null;\n      if (!immediate) {\n        result = func.apply(context, args);\n        context = null;\n        args = null;\n      }\n    }\n  }\n\n  var debounced = function debounced() {\n    context = this;\n\n    for (var _len = arguments.length, args1 = Array(_len), _key = 0; _key < _len; _key++) {\n      args1[_key] = arguments[_key];\n    }\n\n    args = args1;\n    timestamp = Date.now();\n    var callNow = immediate && !timeout;\n    if (!timeout) timeout = setTimeout(later, wait);\n    if (callNow) {\n      result = func.apply(context, args);\n      context = null;\n      args = null;\n    }\n    return result;\n  };\n\n  debounced.clear = function clear() {\n    if (timeout) {\n      clearTimeout(timeout);\n      timeout = null;\n    }\n  };\n\n  debounced.flush = function flush() {\n    if (timeout) {\n      result = func.apply(context, args);\n      context = null;\n      args = null;\n\n      clearTimeout(timeout);\n      timeout = null;\n    }\n  };\n\n  return debounced;\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvZGVib3VuY2UuanM/NjE1NiJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQgPSAxMDAsIGltbWVkaWF0ZSA9IGZhbHNlKSB7XG4gIGxldCB0aW1lb3V0O1xuICBsZXQgYXJncztcbiAgbGV0IGNvbnRleHQ7XG4gIGxldCB0aW1lc3RhbXA7XG4gIGxldCByZXN1bHQ7XG5cbiAgZnVuY3Rpb24gbGF0ZXIoKSB7XG4gICAgY29uc3QgbGFzdCA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG5cbiAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBudWxsO1xuICAgICAgICBhcmdzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBkZWJvdW5jZWQgPSBmdW5jdGlvbiBkZWJvdW5jZWQoLi4uYXJnczEpIHtcbiAgICBjb250ZXh0ID0gdGhpcztcbiAgICBhcmdzID0gYXJnczE7XG4gICAgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgIGlmIChjYWxsTm93KSB7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgICBhcmdzID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBkZWJvdW5jZWQuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICBpZiAodGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIGRlYm91bmNlZC5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgICBhcmdzID0gbnVsbDtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBkZWJvdW5jZWQ7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9kZWJvdW5jZS5qcyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///1\n");

/***/ })
/******/ ]);