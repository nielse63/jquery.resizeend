(function(addon) {
	if(typeof define === "function" && define.amd) {
		define("clique-grid", ["clique"], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error("Clique.grid requires Clique.core");
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	_c.component("grid", {
		defaults: {
			colwidth: "auto",
			animation: true,
			duration: 300,
			gutter: 0,
			controls: false,
			filter: false
		},
		boot: function() {
			_c.ready(function(context) {
				_c.$("[data-grid]", context).each(function() {
					var ele = _c.$(this);
					if(!ele.data("clique.data.grid")) {
						_c.grid(ele, _c.utils.options(ele.attr("data-grid")));
					}
				});
			});
		},
		init: function() {
			var $this = this;
			var gutter = String(this.options.gutter).trim().split(" ");

			this.gutterv = parseInt(gutter[0], 10);
			this.gutterh = parseInt(gutter[1] || gutter[0], 10);

			this.element.css({
				position: "relative"
			});
			this.controls = null;
			if(this.options.controls) {
				this.controls = _c.$(this.options.controls);
				this.controls.on("click", "[data-filter]", (function(_this) {
					return function(e) {
						e.preventDefault();
						_this.filter(_c.$(this).data("filter"));
					};
				})(this));
				this.controls.on("click", "[data-sort]", (function(_this) {
					return function(e) {
						e.preventDefault();
						var cmd = _c.$(this).attr("data-sort").split(":");
						_this.sort(cmd[0], cmd[1]);
					};
				})(this));
			}
			_c.$win.on("load resize orientationchange", _c.utils.debounce(function(_this) {
				return function() {
					if(_this.currentfilter) {
						_this.filter(_this.currentfilter);
					} else {
						_this.updateLayout();
					}
				};
			}(this), 100));
			this.on("display.clique.check", function(_this) {
				return function() {
					if(_this.element.is(":visible")) {
						_this.updateLayout();
					}
				};
			}(this));
			_c.$html.on("changed.clique.dom", function(_this) {
				return function() {
					_this.updateLayout();
				};
			}(this));
			if(this.options.filter !== false) {
				this.filter(this.options.filter);
			} else {
				this.updateLayout();
			}
		},
		updateLayout: function(elements) {
			this._prepareElements();
			elements = elements || this.element.children(":visible");
			var children = elements;
			var maxwidth = this.element.width() + 2 * this.gutterh + 2;
			var left = 0;
			var top = 0;
			var positions = [];
			var aX;
			var aY;
			var pos, i, max;
			this.trigger("beforeupdate.clique.grid", [children]);
			children.each(function(index) {
				var size = getElementSize(this);
				var item = _c.$(this);
				var width = size.outerWidth;
				var height = size.outerHeight;
				left = 0;
				top = 0;
				for(i = 0, max = positions.length; i < max; i++) {
					pos = positions[i];
					if(left <= pos.aX) {
						left = pos.aX;
					}
					if(maxwidth < left + width) {
						left = 0;
					}
					if(top <= pos.aY) {
						top = pos.aY;
					}
				}
				positions.push({
					ele : item,
					top : top,
					left : left,
					width : width,
					height : height,
					aY : top + height,
					aX : left + width
				});
			});
			var posPrev, maxHeight = 0;
			for(i = 0, max = positions.length; i < max; i++) {
				pos = positions[i];
				top = 0;
				for(var z = 0; z < i; z++) {
					posPrev = positions[z];
					if(pos.left < posPrev.aX && posPrev.left + 1 < pos.aX) {
						top = posPrev.aY;
					}
				}
				pos.top = top;
				pos.aY = top + pos.height;
				maxHeight = Math.max(maxHeight, pos.aY);
			}
			maxHeight = maxHeight - this.gutterv;
			if(this.options.animation) {
				this.element.stop().animate({
					height: maxHeight
				}, 100);
				positions.forEach(function(pos) {
					pos.ele.stop().animate({
						top : pos.top,
						left : pos.left,
						opacity : 1
					}, this.options.duration);
				}.bind(this));
			} else {
				this.element.css("height", maxHeight);
				positions.forEach(function(pos) {
					pos.ele.css({
						top : pos.top,
						left : pos.left,
						opacity : 1
					});
				}.bind(this));
			}
			setTimeout(function() {
				_c.$doc.trigger("scrolling.clique.document");
			}, 2 * this.options.duration * (this.options.animation ? 1 : 0));
			this.trigger("afterupdate.clique.grid", [children]);
		},
		filter: function(filter) {
			this.currentfilter = filter;
			filter = filter || [];
			if(typeof filter === "string") {
				filter = filter.split(/,/).map(function(item) {
					return item.trim();
				});
			}
			var children = this.element.children(),
				elements = {
					visible: [],
					hidden: []
				},
				visible, hidden;
			children.each(function(index) {
				var ele = _c.$(this),
					f = ele.attr("data-filter"),
					infilter = filter.length ? false : true;
				if(f) {
					f = f.split(/,/).map(function(item) {
						return item.trim();
					});
					filter.forEach(function(item) {
						if(f.indexOf(item) > -1) {
							infilter = true;
						}
					});
				}
				elements[infilter ? "visible" : "hidden"].push(ele);
			});
			elements.hidden = _c.$(elements.hidden).map(function() {
				return this[0];
			});
			elements.visible = _c.$(elements.visible).map(function() {
				return this[0];
			});
			elements.hidden.attr("aria-hidden", "true").filter(":visible").fadeOut(this.options.duration);
			elements.visible.attr("aria-hidden", "false").filter(":hidden").css("opacity", 0).show();
			this.updateLayout(elements.visible);
			if(this.controls && this.controls.length) {
				this.controls.find("[data-filter]").removeClass("active").filter('[data-filter="' + filter + '"]').addClass("active");
			}
		},
		sort: function(by, order) {
			order = order || 1;
			if(typeof order === "string") {
				order = order.toLowerCase() === "desc" ? -1 : 1;
			}
			var elements = this.element.children();
			elements.sort(function(a, b) {
				a = _c.$(a);
				b = _c.$(b);
				return(b.data(by) || "") < (a.data(by) || "") ? order : order * -1;
			}).appendTo(this.element);
			this.updateLayout(elements.filter(":visible"));
			if(this.controls && this.controls.length) {
				this.controls.find("[data-sort]").removeClass("active").filter('[data-sort="' + by + ":" + (order === -1 ? "desc" : "asc") + '"]').addClass("active");
			}
		},

		// private methods
		_prepareElements: function() {
			var children = this.element.children(":not([data-grid-prepared])"),
				css;
			if(!children.length) {
				return;
			}
			css = {
				position: "absolute",
				"box-sizing": "border-box",
				width: this.options.colwidth === "auto" ? "" : this.options.colwidth
			};
			if(this.options.gutter) {
				css["padding-left"] = this.gutterh;
				css["padding-bottom"] = this.gutterv;
				this.element.css("margin-left", this.gutterh * -1);
			}
			children.attr("data-grid-prepared", "true").css(css);
		},
	});

	var _getSize = function() {

		var prefixes = "Webkit Moz ms Ms O".split(" ");
		var docElemStyle = document.documentElement.style;

		function getStyleProperty(propName) {
			if(!propName) {
				return;
			}
			if(typeof docElemStyle[propName] === "string") {
				return propName;
			}
			propName = propName.charAt(0).toUpperCase() + propName.slice(1);
			var prefixed;
			for(var i = 0, len = prefixes.length; i < len; i++) {
				prefixed = prefixes[i] + propName;
				if(typeof docElemStyle[prefixed] === "string") {
					return prefixed;
				}
			}
		}

		function getStyleSize(value) {
			var num = parseFloat(value);
			var isValid = value.indexOf("%") === -1 && !isNaN(num);
			return isValid && num;
		}

		function noop() {}
		var logError = typeof console === "undefined" ? noop : function(message) {
			console.error(message);
		};
		var measurements = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];

		function getZeroSize() {
			var size = {
				width: 0,
				height: 0,
				innerWidth: 0,
				innerHeight: 0,
				outerWidth: 0,
				outerHeight: 0
			};
			for(var i = 0, len = measurements.length; i < len; i++) {
				var measurement = measurements[i];
				size[measurement] = 0;
			}
			return size;
		}
		var isSetup = false;
		var getStyle, boxSizingProp, isBoxSizeOuter;

		function setup() {
			if(isSetup) {
				return;
			}
			isSetup = true;
			var getComputedStyle = window.getComputedStyle;
			getStyle = function() {
				var getStyleFn = getComputedStyle ? function(elem) {
					return getComputedStyle(elem, null);
				} : function(elem) {
					return elem.currentStyle;
				};
				return function getStyle(elem) {
					var style = getStyleFn(elem);
					if(!style) {
						logError("Style returned " + style + ". Are you running this code in a hidden iframe on Firefox? " + "See http://bit.ly/getsizebug1");
					}
					return style;
				};
			}();
			boxSizingProp = getStyleProperty("boxSizing");
			if(boxSizingProp) {
				var div = document.createElement("div");
				div.style.width = "200px";
				div.style.padding = "1px 2px 3px 4px";
				div.style.borderStyle = "solid";
				div.style.borderWidth = "1px 2px 3px 4px";
				div.style[boxSizingProp] = "border-box";
				var body = document.body || document.documentElement;
				body.appendChild(div);
				var style = getStyle(div);
				isBoxSizeOuter = getStyleSize(style.width) === 200;
				body.removeChild(div);
			}
		}

		function getSize(elem) {
			setup();
			if(typeof elem === "string") {
				elem = document.querySelector(elem);
			}
			if(!elem || typeof elem !== "object" || !elem.nodeType) {
				return;
			}
			var style = getStyle(elem);
			if(style.display === "none") {
				return getZeroSize();
			}
			var size = {};
			size.width = elem.offsetWidth;
			size.height = elem.offsetHeight;
			var isBorderBox = size.isBorderBox = !!(boxSizingProp && style[boxSizingProp] && style[boxSizingProp] === "border-box");
			for(var i = 0, len = measurements.length; i < len; i++) {
				var measurement = measurements[i];
				var value = style[measurement];
				var num = parseFloat(value);
				size[measurement] = !isNaN(num) ? num : 0;
			}
			var paddingWidth = size.paddingLeft + size.paddingRight;
			var paddingHeight = size.paddingTop + size.paddingBottom;
			var marginWidth = size.marginLeft + size.marginRight;
			var marginHeight = size.marginTop + size.marginBottom;
			var borderWidth = size.borderLeftWidth + size.borderRightWidth;
			var borderHeight = size.borderTopWidth + size.borderBottomWidth;
			var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
			var styleWidth = getStyleSize(style.width);
			if(styleWidth !== false) {
				size.width = styleWidth + (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
			}
			var styleHeight = getStyleSize(style.height);
			if(styleHeight !== false) {
				size.height = styleHeight + (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
			}
			size.innerWidth = size.width - (paddingWidth + borderWidth);
			size.innerHeight = size.height - (paddingHeight + borderHeight);
			size.outerWidth = size.width + marginWidth;
			size.outerHeight = size.height + marginHeight;
			return size;
		}
		return getSize;
	}();

	function getElementSize(ele) {
		return _getSize(ele);
	}
});
