(function(core) {
	if(typeof define === "function" && define.amd) {
		define("clique", function() {
			var clique = window.Clique || core(window, window.jQuery, window.document);
			clique.load = function(res, req, onload, config) {
				var resources = res.split(","),
					load = [];
				var base = (config.config && config.config.clique && config.config.clique.base ? config.config.clique.base : "").replace(/\/+$/g, "");
				if(!base) {
					throw new Error("Please define base path to Clique in the requirejs config.");
				}
				var i = 0;
				while(i < resources.length) {
					var resource = resources[i].replace(/\./g, "/");
					load.push(base + "/components/" + resource);
					i += 1;
				}
				req(load, function() {
					onload(clique);
				});
			};
			return clique;
		});
	}
	if(!window.jQuery) {
		throw new Error("Clique requires jQuery");
	}
	if(window && window.jQuery) {
		core(window, window.jQuery, window.document);
	}
})(function(global, $, doc) {
	var _c = {};
	var _cTEMP = window.Clique;
	_c.version = "1.0.4";
	_c.noConflict = function() {
		if(_cTEMP) {
			window.Clique = _cTEMP;
			$.Clique = _cTEMP;
			$.fn.clique = _cTEMP.fn;
		}
		return _c;
	};
	_c.prefix = function(str) {
		return str;
	};
	_c.$ = $;
	_c.$doc = _c.$(document);
	_c.$win = _c.$(window);
	_c.$html = _c.$("html");
	_c.fn = function(command, options) {
		var args = arguments;
		var cmd = command.match(/^([a-z\-]+)(?:\.([a-z]+))?/i);
		var component = cmd[1];
		var method = cmd[2];
		if(!method && typeof options === "string") {
			method = options;
		}
		if(!_c[component]) {
			$.error("Clique component [" + component + "] does not exist.");
			return this;
		}
		return this.each(function() {
			var $this = _c.$(this);
			var data = $this.data(component);
			if(!data) {
				$this.data(component, data = _c[component](this, method ? void 0 : options));
			}
			if(method) {
				data[method].apply(data, Array.prototype.slice.call(args, 1));
			}
		});
	};
	_c.support = {
		requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
			setTimeout(callback, 1e3 / 60);
		},
		touch: "ontouchstart" in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/) || global.DocumentTouch && document instanceof global.DocumentTouch || global.navigator.msPointerEnabled && global.navigator.msMaxTouchPoints > 0 || global.navigator.pointerEnabled && global.navigator.maxTouchPoints > 0 || false,
		mutationobserver: global.MutationObserver || global.WebKitMutationObserver || null
	};
	_c.support.transition = function() {
		var transitionEnd = function() {
			var element = doc.body || doc.documentElement;
			var transEndEventNames = {
				WebkitTransition: "webkitTransitionEnd",
				MozTransition: "transitionend",
				OTransition: "oTransitionEnd otransitionend",
				transition: "transitionend"
			};
			for(var name in transEndEventNames) {
				if(element.style[name] !== undefined) {
					return transEndEventNames[name];
				}
			}
		}();
		return transitionEnd && {
			end: transitionEnd
		};
	}();
	_c.support.animation = function() {
		var animationEnd = function() {
			var element = doc.body || doc.documentElement;
			var animEndEventNames = {
				WebkitAnimation: "webkitAnimationEnd",
				MozAnimation: "animationend",
				OAnimation: "oAnimationEnd oanimationend",
				animation: "animationend"
			};
			for(var name in animEndEventNames) {
				if(element.style[name] !== undefined) {
					return animEndEventNames[name];
				}
			}
		}();
		return animationEnd && {
			end: animationEnd
		};
	}();
	_c.utils = {
		now: Date.now || function() {
			return new Date().getTime();
		},
		isUndefined: function(obj) {
			return obj === void 0;
		},
		isString: function(obj) {
			return Object.prototype.toString.call(obj) === "[object String]";
		},
		isNumber: function(obj) {
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		},
		isDate: function(obj) {
			var d = new Date(obj);
			return d !== "Invalid Date" && d.toString() !== "Invalid Date" && !isNaN(d);
		},
		isJQueryObject: function(obj) {
			return obj instanceof jQuery;
		},
		str2json: function(str, notevil) {
			var e, newFN;
			try {
				if(notevil) {
					return JSON.parse(str.replace(/([\$\w]+)\s* :/g, function(_, $1) {
						return '"' + $1 + '" :';
					}).replace(/'([^']+)'/g, function(_, $1) {
						return '"' + $1 + '"';
					}));
				} else {
					newFN = Function;
					return new newFN("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));")();
				}
			} catch(_error) {
				e = _error;
				return false;
			}
		},
		debounce: function(fn, wait, immediate) {
			var timeout;
			return function() {
				var context = this,
					args = arguments,
					later = function() {
						timeout = null;
						if(!immediate) {
							fn.apply(context, args);
						}
					},
					callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if(callNow) {
					fn.apply(context, args);
				}
			};
		},
		isInView: function(element, options) {
			var $element = $(element);
			if(!$element.is(":visible")) {
				return false;
			}
			var window_left = _c.$win.scrollLeft();
			var window_top = _c.$win.scrollTop();
			var left = $element[0].offsetLeft;
			var top = $element[0].offsetTop;
			options = $.extend({
				topoffset: 0,
				leftoffset: 0
			}, options);
			return top + $element[0].offsetHeight >= window_top && top - options.topoffset <= window_top + _c.$win.height() && left + $element[0].offsetWidth >= window_left && left - options.leftoffset <= window_left + _c.$win.width();
		},
		checkDisplay: function(context, initanimation) {
			var elements = $("[data-margin], [data-row-match], [data-row-margin], [data-check-display]", context || document);
			if(context && !elements.length) {
				elements = $(context);
			}
			elements.trigger("display.clique.check");
			if(initanimation) {
				if(typeof initanimation !== "string") {
					initanimation = '[class*="animation-"]';
				}
				elements.find(initanimation).each(function() {
					var ele = $(this);
					var cls = ele.attr("class");
					var anim = cls.match(/animation\-(.+)/);
					ele.removeClass(anim[0]).width();
					ele.addClass(anim[0]);
				});
			}
			return elements;
		},
		options: function(string) {
			if($.isPlainObject(string)) {
				return string;
			}
			var start = string ? string.indexOf("{") : -1;
			var options = {};
			if(start !== -1) {
				try {
					options = _c.utils.str2json(string.substr(start));
				} catch(_error) {}
			}
			return options;
		},
		animate: function(element, cls) {
			var d = $.Deferred();
			element = $(element);
			cls = cls;
			element.css("display", "none").addClass(cls).one(_c.support.animation.end, function() {
				element.removeClass(cls);
				d.resolve();
			}).width();
			element.css({
				display: ""
			});
			return d.promise();
		},
		uid: function(prefix) {
			return(prefix || "id") + _c.utils.now() + "RAND" + Math.ceil(Math.random() * 1e5);
		},
		template: function(str, data) {
			var tokens = str.replace(/\n/g, "\\n").replace(/\{\{\{\s*(.+?)\s*\}\}\}/g, "{{!$1}}").split(/(\{\{\s*(.+?)\s*\}\})/g);
			var i = 0;
			var output = [];
			var openblocks = 0;
			while(i < tokens.length) {
				var toc = tokens[i];
				if(toc.match(/\{\{\s*(.+?)\s*\}\}/)) {
					i++;
					toc = tokens[i];
					var cmd = toc[0];
					var prop = toc.substring(toc.match(/^(\^|\#|\!|\~|\:)/) ? 1 : 0);
					switch(cmd) {
						case "~":
							output.push("for(var $i = 0; $i < " + prop + ".length; $i++) { var $item = " + prop + "[$i];");
							openblocks++;
							break;

						case ":":
							output.push("for(var $key in " + prop + ") { var $val = " + prop + "[$key];");
							openblocks++;
							break;

						case "#":
							output.push("if(" + prop + ") {");
							openblocks++;
							break;

						case "^":
							output.push("if(!" + prop + ") {");
							openblocks++;
							break;

						case "/":
							output.push("}");
							openblocks--;
							break;

						case "!":
							output.push("__ret.push(" + prop + ");");
							break;

						default:
							output.push("__ret.push(escape(" + prop + "));");
					}
				} else {
					output.push("__ret.push('" + toc.replace(/\'/g, "\\'") + "');");
				}
				i++;
			}
			var newFN = Function;
			var fn = new newFN("$data", ["var __ret = [];", "try {", "with($data){", !openblocks ? output.join("") : '__ret = ["Not all blocks are closed correctly."]', "};", "}catch(e){__ret = [e.message];}", 'return __ret.join("").replace(/\\n\\n/g, "\\n");', "function escape(html) { return String(html).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}"].join("\n"));
			if(data) {
				return fn(data);
			} else {
				return fn;
			}
		},
		events: {
			click: _c.support.touch ? "tap" : "click"
		},
		matchHeights: function(elements, options) {
			elements = $(elements).css("min-height", "");
			options = _c.$.extend({
				row: true
			}, options);
			var matchHeights = function(group) {
				if(group.length < 2) {
					return;
				}
				var max = 0;
				return group.each(function() {
					max = Math.max(max, $(this).outerHeight());
				}).each(function() {
					return $(this).css("min-height", max);
				});
			};
			if(options.row) {
				elements.first().width();
				return setTimeout(function() {
					var lastoffset = false;
					var group = [];
					elements.each(function() {
						var ele = $(this);
						var offset = ele.offset().top;
						if(offset !== lastoffset && group.length) {
							matchHeights($(group));
							group = [];
							offset = ele.offset().top;
						}
						group.push(ele);
						lastoffset = offset;
					});
					if(group.length) {
						return matchHeights($(group));
					}
				}, 0);
			} else {
				return matchHeights(elements);
			}
		},
		getHeight: function(ele) {
			ele = _c.$(ele);
			var height = "auto";
			if(ele.is(":visible")) {
				height = ele.outerHeight();
			} else {
				var tmp = {
					position: ele.css("position"),
					visibility: ele.css("visibility"),
					display: ele.css("display")
				};
				height = ele.css({
					position: "absolute",
					visibility: "hidden",
					display: "block"
				}).outerHeight();
				ele.css(tmp);
			}
			return height;
		}
	};
	_c.events = {
		scrollstart: {
			setup: function(data) {
				var uid = _c.utils.uid("scrollstart");
				_c.$(this).data("clique.event.scrollstart.uid", uid);
				var _data = $.extend({
					latency: $.event.special.scrollstop.latency
				}, data);
				var timer = null;
				var handler = function(e) {
					var _args, _self;
					_self = this;
					_args = arguments;
					if(timer) {
						clearTimeout(timer);
					} else {
						e.type = "scrollstart.clique.dom";
						_c.$(e.target).trigger("scrollstart.clique.dom", e);
					}
					timer = setTimeout(function() {
						timer = null;
					}, _data.latency);
				};
				return _c.$(this).on("scroll", _c.utils.debounce(handler, 100)).data(uid, handler);
			},
			teardown: function() {
				var uid = _c.$(this).data("clique.event.scrollstart.uid");
				_c.$(this).off("scroll", _c.$(this).data(uid));
				_c.$(this).removeData(uid);
				return _c.$(this).removeData("clique.event.scrollstart.uid");
			}
		},
		scrollstop: {
			latency: 150,
			setup: function(data) {
				var uid = _c.utils.uid("scrollstop");
				_c.$(this).data("clique.event.scrolltop.uid", uid);
				var _data = _c.$.extend({
					latency: _c.$.event.special.scrollstop.latency
				}, data);
				var timer = null;
				var handler = function(e) {
					var _args, _self;
					_self = this;
					_args = arguments;
					if(timer) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() {
						timer = null;
						e.type = "scrollstop.clique.dom";
						_c.$(e.target).trigger("scrollstop.clique.dom", e);
					}, _data.latency);
				};
				_c.$(this).on("scroll", _c.utils.debounce(handler, 100)).data(uid, handler);
			},
			teardown: function() {
				var uid = _c.$(this).data("clique.event.scrolltop.uid");
				_c.$(this).off("scroll", _c.$(this).data(uid));
				_c.$(this).removeData(uid);
				return _c.$(this).removeData("clique.event.scrolltop.uid");
			}
		},
		resizeend: {
			latency: 250,
			setup: function(data) {
				var uid = _c.utils.uid("resizeend");
				_c.$(this).data("clique.event.resizeend.uid", uid);
				var _data = _c.$.extend({
					latency: _c.$.event.special.resizeend.latency
				}, data);
				var timer = _data;
				var handler = function(e) {
					var _args, _self;
					_self = this;
					_args = arguments;
					if(timer) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() {
						timer = null;
						e.type = "resizeend.clique.dom";
						return _c.$(e.target).trigger("resizeend.clique.dom", e);
					}, _data.latency);
				};
				return _c.$(this).on("resize", _c.utils.debounce(handler, 100)).data(uid, handler);
			},
			teardown: function() {
				var uid = _c.$(this).data("clique.event.resizeend.uid");
				_c.$(this).off("resize", _c.$(this).data(uid));
				_c.$(this).removeData(uid);
				return _c.$(this).removeData("clique.event.resizeend.uid");
			}
		}
	};
	window.Clique = _c;
	$.Clique = _c;
	$.fn.clique = _c.fn;
	_c.langdirection = _c.$html.attr("dir") === "rtl" ? "right" : "left";
	_c.components = {};
	_c.component = function(name, def) {
		var fn;
		fn = function(element, options) {
			var $this = this;
			this.element = element ? _c.$(element) : null;
			this.options = _c.$.extend(true, {}, this.defaults, options);
			this.plugins = {};
			if(this.element) {
				this.element.data("clique.data." + name, this);
			}
			this.init();
			(this.options.plugins.length ? this.options.plugins : Object.keys(fn.plugins)).forEach(function(plugin) {
				if(fn.plugins[plugin].init) {
					fn.plugins[plugin].init($this);
					$this.plugins[plugin] = true;
				}
			});
			this.trigger("init.clique.component", [name, this]);
			return this;
		};
		fn.plugins = {};
		_c.$.extend(true, fn.prototype, {
			defaults: {
				plugins: []
			},
			boot: function() {},
			init: function() {},
			on: function(a1, a2, a3) {
				return _c.$(this.element || this).on(a1, a2, a3);
			},
			one: function(a1, a2, a3) {
				return _c.$(this.element || this).one(a1, a2, a3);
			},
			off: function(evt) {
				return _c.$(this.element || this).off(evt);
			},
			trigger: function(evt, params) {
				return _c.$(this.element || this).trigger(evt, params);
			},
			find: function(selector) {
				return _c.$(this.element ? this.element : []).find(selector);
			},
			proxy: function(obj, methods) {
				var $this = this;
				methods.split(" ").forEach(function(method) {
					if(!$this[method]) {
						$this[method] = function() {
							return obj[method].apply(obj, arguments);
						};
					}
				});
			},
			mixin: function(obj, methods) {
				var $this = this;
				methods.split(" ").forEach(function(method) {
					if(!$this[method]) {
						$this[method] = obj[method].bind($this);
					}
				});
			},
			option: function() {
				if(arguments.length === 1) {
					return this.options[arguments[0]] || undefined;
				} else {
					if(arguments.length === 2) {
						this.options[arguments[0]] = arguments[1];
					}
				}
			}
		}, def);
		this.components[name] = fn;
		this[name] = function() {
			var element, options;
			if(arguments.length) {
				switch(arguments.length) {
					case 1:
						if(typeof arguments[0] === "string" || arguments[0].nodeType || arguments[0] instanceof jQuery) {
							element = $(arguments[0]);
						} else {
							options = arguments[0];
						}
						break;

					case 2:
						element = _c.$(arguments[0]);
						options = arguments[1];
				}
			}
			if(element && element.data("clique.data." + name)) {
				return element.data("clique.data." + name);
			}
			return new _c.components[name](element, options);
		};
		if(_c.domready) {
			_c.component.boot(name);
		}
		return fn;
	};
	_c.plugin = function(component, name, def) {
		this.components[component].plugins[name] = def;
	};
	_c.component.boot = function(name) {
		if(_c.components[name].prototype && _c.components[name].prototype.boot && !_c.components[name].booted) {
			_c.components[name].prototype.boot.apply(_c, []);
			_c.components[name].booted = true;
		}
	};
	_c.component.bootComponents = function() {
		for(var component in _c.components) {
			_c.component.boot(component);
		}
	};
	_c.domObservers = [];
	_c.domready = false;
	_c.ready = function(fn) {
		_c.domObservers.push(fn);
		if(_c.domready) {
			fn(document);
		}
	};
	_c.on = function(a1, a2, a3) {
		if(a1 && a1.indexOf("ready.clique.dom") > -1 && _c.domready) {
			a2.apply(_c.$doc);
		}
		return _c.$doc.on(a1, a2, a3);
	};
	_c.one = function(a1, a2, a3) {
		if(a1 && a1.indexOf("ready.clique.dom") > -1 && _c.domready) {
			a2.apply(_c.$doc);
			return _c.$doc;
		}
		return _c.$doc.one(a1, a2, a3);
	};
	_c.trigger = function(evt, params) {
		return _c.$doc.trigger(evt, params);
	};
	_c.domObserve = function(selector, fn) {
		if(!_c.support.mutationobserver) {
			return;
		}
		fn = fn || function() {};
		_c.$(selector).each(function() {
			var element = this;
			var $element = _c.$(element);
			if($element.data("observer")) {
				return;
			}
			try {
				var observer = new _c.support.mutationobserver(_c.utils.debounce(function() {
					fn.apply(element, []);
					$element.trigger("changed.clique.dom");
				}, 50));
				observer.observe(element, {
					childList: true,
					subtree: true
				});
				$element.data("observer", observer);
			} catch(_error) {}
		});
	};
	_c.delay = function(fn, timeout, args) {
		if(timeout === null) {
			timeout = 0;
		}
		fn = fn || function() {};
		return setTimeout(function() {
			return fn.apply(null, args);
		}, timeout);
	};
	_c.on("domready.clique.dom", function() {
		_c.domObservers.forEach(function(fn) {
			fn(document);
		});
		if(_c.domready) {
			_c.utils.checkDisplay(document);
		}
	});
	(function() {
		var evtFn = function(fn) {
			if(fn) {
				return this.on(k, fn);
			} else {
				return this.trigger(k);
			}
		};
		for(var k in _c.events) {
			var v = _c.events[k];
			if(typeof v === "object") {
				_c.$.event.special[k] = v;
				_c.$.fn[k] = evtFn;
			}
		}
		_c.$doc.on("ready", function() {
			_c.$body = _c.$("body");
			_c.ready(function() {
				_c.domObserve("[data-observe]");
			});
			_c.on("changed.clique.dom", function(e) {
				var ele = e.target;
				_c.domObservers.forEach(function(fn) {
					fn(ele);
				});
				_c.utils.checkDisplay(ele);
			});
			_c.trigger("beforeready.clique.dom");
			_c.component.bootComponents();
			setInterval(function() {
				var memory = {
					x: window.pageXOffset,
					y: window.pageYOffset
				};
				var fn = function() {
					if(memory.x !== window.pageXOffset || memory.y !== window.pageYOffset) {
						var dir = {
							x: 0,
							y: 0
						};
						if(window.pageXOffset !== memory.x) {
							dir.x = window.pageXOffset > memory.x ? 1 : -1;
						}
						if(window.pageYOffset !== memory.y) {
							dir.y = window.pageYOffset > memory.y ? 1 : -1;
						}
						memory = {
							dir: dir,
							x: window.pageXOffset,
							y: window.pageYOffset
						};
						_c.$doc.trigger("scrolling.clique.dom", [memory]);
					}
				};
				if(_c.support.touch) {
					_c.$html.on("touchmove touchend MSPointerMove MSPointerUp pointermove pointerup", fn);
				}
				if(memory.x || memory.y) {
					fn();
				}
				return fn;
			}(), 15);
			_c.trigger("domready.clique.dom");
			if(_c.support.touch) {
				if(navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
					_c.$win.on("load orientationchange resize", _c.utils.debounce(function() {
						var fn = function() {
							_c.$(".height-viewport").css("height", window.innerHeight);
							return fn;
						};
						return fn();
					}(), 100));
				}
			}
			_c.trigger("afterready.clique.dom");
			_c.domready = true;
			_c.$win.on("load resizeend.clique.dom orientationchange", function() {
				_c.support.touch = "ontouchstart" in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/) || global.DocumentTouch && document instanceof global.DocumentTouch || global.navigator.msPointerEnabled && global.navigator.msMaxTouchPoints > 0 || global.navigator.pointerEnabled && global.navigator.maxTouchPoints > 0 || false;
				_c.$doc.trigger("reloaded.clique.dom");
			});
		});
	})();
	if(_c.support.touch) {
		var hoverset = false;
		var hovercls = "hover";
		var selector = ".overlay, .overlay-hover, .overlay-toggle, .animation-hover, .has-hover";
		_c.$html.on("touchstart MSPointerDown pointerdown", selector, function() {
			if(hoverset) {
				$("." + hovercls).removeClass(hovercls);
			}
			hoverset = $(this).addClass(hovercls);
		}).on("touchend MSPointerUp pointerup", function(e) {
			var exclude = $(e.target).parents(selector);
			if(hoverset) {
				hoverset.not(exclude).removeClass(hovercls);
			}
		});
	}
	return _c;
});
