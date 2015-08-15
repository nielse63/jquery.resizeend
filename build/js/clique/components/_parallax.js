(function(addon) {
	if (typeof define === 'function' && define.amd) {
		define('clique-parallax', ['clique'], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error('Clique.parallax requires Clique.core');
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	/*
	x, y, rotate, scale, bg (bg = bgy), bgx, bgy
	*/

	_c.component('parallax', {
		defaults: {
			velocity : 0.5,
			target : false,
			offset : '25%' // pixels or percent
		},
		boot: function() {

			return _c.ready(function(context) {
				return _c.$('[data-parallax]', context).each(function() {
					var ele = _c.$(this);
					if (!ele.data('clique.data.parallax')) {
						var obj = _c.parallax(ele, _c.utils.options(ele.attr('data-parallax')));
					}
				});
			});
		},
		init: function() {

			// check for 3d support
			this.supports3d = (function() {
				var has3d;
				var el = document.createElement('div');
				var transforms = {
					'WebkitTransform': '-webkit-transform',
					'MSTransform': '-ms-transform',
					'MozTransform': '-moz-transform',
					'Transform': 'transform'
				};
				document.body.insertBefore(el, null);
				for (var t in transforms) {
					if (el.style[t] !== void 0) {
						el.style[t] = 'translate3d(1px,1px,1px)';
						has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
					}
				}
				document.body.removeChild(el);
				return typeof has3d !== 'undefined' && has3d.length > 0 && has3d !== 'none';
			})();

			_c.$doc.on('ready', function() {
				// ...
			});

			// set properties
			this.target = this.options.target ? _c.$(this.options.target) : this.element;
			this.velocity = this.options.velocity || 1;
			this.windowHeight = _c.$win.height();
			this.properties = this.getProperties();
			this.didCheck = {
				before : false,
				after : false
			};

			// set initial css values
			if(!_c.utils.isInView(this.target)) {
				this.setStaticValues();
			}

			// bind event listeners
			_c.$win.on('load resizeend.clique.dom orientationchange', function(_this) {
				return function() {
					_this.windowHeight = _c.$win.height();
				};
			}(this));

			_c.$doc.on('scrolling.clique.dom', function(_this) {
				return function(e, memory) {

					// if not in view, don't process
					if(!_c.utils.isInView(_this.target)) {
						_this.setStaticValues();
						return;
					}

					// reset 'didCheck' values
					_this.didCheck = {
						before : false,
						after : false
					};

					// get threshold to stop checking
					var threshold = _this.getScreenThreshold(memory.y);

					// get percentage offset from screen threshold
					var top = _this.target[0].offsetTop - (_this.target[0].offsetHeight / 2);
					var offset = ((top - threshold) / _this.viewport.height);
					if(offset < 0) {
						offset = 0;
					} else if(offset > 1) {
						offset = 1;
					}

					// set the property values
					var cssObject = {};
					for(var key in _this.properties) {
						var value = _this.properties[key];
						var cssValue = value.start + value.diff * (1 - offset) * value.dir;
						if(cssValue === value.end) {
							continue;
						}

						if(offset === 0) {
							cssValue = value.end;
						} else if(offset === 1) {
							cssValue = value.start;
						}
						// console.log(key, cssValue, cssObject);
						cssObject = _this.setCSSValueForKey(key, cssValue, cssObject);
					}

					var cssOutput = {};
					var transformArray = [];
					console.log(cssObject);
					for(var key in cssObject) {
						// console.log(key);
						var value = cssObject[key];
						if(key === 'transform') {
							for(var _key in value) {
								var _value = value[_key];
								switch(_key) {
									case 'x' :
										transformArray.push(this.supports3d ? " translate3d(" + _value + "px, 0, 0)" : " translateX(" + _value + "px)");
										break;
									case 'y' :
										transformArray.push(this.supports3d ? " translate3d(0, " + _value + "px, 0)" : " translateY(" + _value + "px)");
										break;
									case 'rotate' :
										transformArray.push("rotate(" + _value + "deg)");
										break;
									case 'scale' :
										transformArray.push("scale(" + _value + ")");
										break;
								}
							}
						} else {
							cssOutput[key] = value;
						}
					}
					if(transformArray.length) {
						cssOutput["transform"] = transformArray.join(' ');
					}
					if(Object.keys(cssOutput).length) {
						return _c.support.requestAnimationFrame.apply(window, [function() {
							_this.target.css(cssOutput);
						}]);
					}
				};
			}(this));
		},

		getScreenThreshold : function(y) {
			var offset = this.options.offset;
			if(_c.utils.isString(offset)) {
				offset = this.windowHeight * (parseFloat(offset.replace('%', '')) / 100);
				this.options.offset = offset;
			}

			this.viewport = {
				top : y + this.options.offset - (this.target[0].offsetHeight / 2),
				height : this.windowHeight - this.options.offset
			};
			return this.viewport.top;
		},

		setStaticValues : function() {
			var isBefore = this.isBeforeView();
			var isAfter = this.isAfterView();
			if(!this.didCheck.before && isBefore) {
				this.didCheck.before = true;
				this.setEndingCSSValues();
			} else if(!this.didCheck.after && isAfter) {
				this.didCheck.after = true;
				this.setStartingCSSValues();
			}
		},

		// if the element is above or to the left of the viewport boundary
		isBeforeView : function() {
			if (!this.target.is(":visible")) {
				return false;
			}
			var window_left = _c.$win.scrollLeft();
			var window_top = _c.$win.scrollTop();
			var bottom = this.target[0].offsetHeight + this.target[0].offsetTop;
			var right = this.target[0].offsetWidth + this.target[0].offsetLeft;
			return right < window_left || bottom < window_top;
		},

		// if the element is before or to the right of the viewport boundary
		isAfterView : function() {
			if (!this.target.is(":visible")) {
				return false;
			}
			var window_right = _c.$win.scrollLeft() + _c.$win.width();
			var window_bottom = _c.$win.scrollTop() + _c.$win.height();
			var top = this.target[0].offsetTop;
			var left = this.target[0].offsetLeft;
			return left > window_right || top > window_bottom;
		},

		setStartingCSSValues : function() {
			for(var key in this.properties) {
				var value = this.properties[key];
				this.setCSSValueForKey(key, value.start);
			}
		},

		setEndingCSSValues : function() {
			for(var key in this.properties) {
				var value = this.properties[key];
				this.setCSSValueForKey(key, value.end);
			}
		},

		setCSSValueForKey : function(key, value, obj) {
			obj = obj || {};
			var cssValue = parseFloat(value);
			var cssKey = key;
			if(['x', 'y', 'rotate', 'scale'].indexOf(cssKey) > -1) {
				if(!obj.transform) {
					obj.transform = {};
				}
				obj.transform[cssKey] = cssValue;
			} else {
				obj[cssKey] = cssValue;
			}
			return obj;
		},

		getCSSValueForKey : function(key) {
			if(['x', 'y', 'scale', 'rotate'].indexOf(key) < 0) {
				return parseFloat(this.target.css(key));
			}

			var transformString = this.target.css('transform');
			if(transformString === 'none') {
				transformString = "matrix(1, 0, 0, 1, 0, 0)";
			}
			var match = transformString.match(/\(.*?\)/);
			if(match) {
				var transformArray = transformString.match(/\(.*?\)/)[0].replace('(', '').replace(')', '').split(',');
				var transform = {
					a : parseFloat(transformArray[0].trim()),
					b : parseFloat(transformArray[1].trim()),
					c : parseFloat(transformArray[2].trim()),
					d : parseFloat(transformArray[3].trim()),
					x : parseFloat(transformArray[4].trim()),
					y : parseFloat(transformArray[5].trim()),
				};
				if(key === 'rotate') {
					return Math.round(Math.atan2(transform.b, transform.a) * (180 / Math.PI));
				} else if(key === 'scale') {
					return Math.sqrt((transform.a * transform.a) + (transform.b * transform.b));
				}
				return transform[key] ? transform[key] : 0;
			}
			return 0;
		},

		getProperties : function() {
			var reserved = ['target', 'velocity', 'plugins', 'offset'];
			var properties = {};
			Object.keys(this.options).forEach((function(_this) {
				return function(prop) {
					if (reserved.indexOf(prop) !== -1) {
						return;
					}
					var startend = String(_this.options[prop]).split(',');
					var start = parseFloat(startend[1] ? startend[0] : _this.getCSSValueForKey(prop));
					var end = parseFloat(startend[1] ? startend[1] : startend[0]);
					var diff = start < end ? end - start : start - end;
					var dir = start < end ? 1 : -1;

					// if(isNaN(start) || isNaN(end) || isNaN(diff)) {
					// 	return;
					// }

					properties[prop] = {
						start : start,
						end : end,
						dir : dir,
						diff : diff
					};
				};
			})(this));
			return properties;
		},
	});
});
