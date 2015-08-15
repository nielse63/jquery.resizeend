(function(addon) {
	var component;
	if(window.Clique) {
		component = addon(Clique);
	}
	if(typeof define === "function" && define.amd) {
		define("clique-sticky", ["clique"], function() {
			return component || addon(Clique);
		});
	}
})(function(_c) {

	_c.component("sticky", {
		defaults: {
			top: 0,
			bottom: 0,
			animation: "",
			boundary: false,
			disabled: false
		},
		boot: function() {
			_c.ready(function(context) {
				_c.$("[data-sticky]", context).each(function() {
					var ele = _c.$(this);
					if(!ele.data("clique.data.sticky")) {
						_c.sticky(ele, _c.utils.options(ele.attr("data-sticky")));
					}
				});
			});
		},
		init: function() {
			var wrapper = _c.$('<div class="sticky-placeholder"></div>'),
				boundary = this.options.boundary;
			this.wrapper = this.element.css("margin", 0).wrap(wrapper).parent();
			this.computeWrapper();
			if(this.options.boundary) {
				if(this.options.boundary === true) {
					this.options.boundary = this.wrapper.parent();
				} else {
					if(_c.utils.isString(boundary) && _c.$(boundary).length) {
						this.options.boundary = _c.$(boundary);
					}
				}
			}
			return _c.$doc.on("scrolling.clique.dom", _c.utils.debounce((function(_this) {
				return function(e, memory) {
					return _this.checkScrollPosition(memory);
				};
			})(this), 150, true));
		},
		hasCSSProperty : function(prop) {
			var ruleset = this.element.attr('style').split(';');
			for(var i = 0; i < ruleset.length; i++) {
				var key = ruleset[i].split(':')[0].trim();
				if(key === prop) {
					this.didFindProperty = true;
					return true;
				}
			}
			return false;
		},
		checkScrollPosition : function(memory) {
			// Set element
			var ele = this.element,
				boundary = this.options.boundary;

			// Conditionals to terminate execution
			if(!ele.is(':visible') || this.options.disabled) {
				return;
			}

			if(boundary && !_c.utils.isInView(boundary)) {
				return;
			}

			// Set the threshold to stop tracking scroll
			if(!this.threshold && boundary) {
				this.threshold = boundary.offset().top + boundary.outerHeight() - parseInt(boundary.css('padding-bottom'), 10) - ele.outerHeight();
			} else if(!this.threshold && !boundary) {
				this.threshold = _c.$body.height();
			}

			// Set position variables
			var scrollTop = memory.y;

			if(this.threshold <= scrollTop) {
				ele.css({
					top : this.threshold - scrollTop
				});
				return;
			}

			// Set element position variables
			var eleTop = ele.parent('.sticky-placeholder') ? ele.parent('.sticky-placeholder').offset().top : ele.offset().top;

			// Alter `top` variable based on options
			if(this.options.top && this.options.top > 0) {
				scrollTop += this.options.top;
			} else if(this.options.top && this.options.top < 0) {
				if(memory.dir.y > 0) {
					if(scrollTop > eleTop && scrollTop < eleTop + Math.abs(this.options.top)) {
						ele.css({
							top : eleTop - scrollTop
						});
					} else if(scrollTop > eleTop + Math.abs(this.options.top)) {
						if(this.options.animation) {
							ele.addClass(this.options.animation);
						}
						ele.css({
							top : 0
						});
					}
				} else {
					if(scrollTop < eleTop && this.options.animation && ele.addClass(this.options.animation)) {
						ele.removeClass(this.options.animation);
					}
				}
			}

			// If still above the element, return now
			if(scrollTop < eleTop && !ele.hasClass('active')) {
				return;
			} else if(scrollTop < eleTop && ele.hasClass('active')) {
				this.reset();
				return;
			}

			// Standard, no-options sticky
			if(scrollTop >= eleTop && !ele.hasClass('active')) {
				this.originalCSS = ele.attr('style') || '';
				var parent = ele.parent('.sticky-placeholder');
				ele.addClass('active').css({
					left : parent.offset().left,
					width : parent.outerWidth()
				});
			}

			// Check for top offset
			if(this.options.top && this.options.top > 0 && !this.didFindProperty && !this.hasCSSProperty('top')) {
				ele.css({
					top : this.options.top
				});
			}
		},
		reset : function() {
			var cssString = '';
			var toIgnore = ['top', 'width', 'height', 'left'];
			var ruleset = this.element.attr('style').split(';');
			for(var i = 0; i < ruleset.length; i++) {
				var pair = ruleset[i];
				if(!pair.trim()) {
					continue;
				}
				var key = pair.split(':')[0].trim();
				var value = pair.split(':')[1].trim();
				if(toIgnore.indexOf(key) > -1) {
					continue;
				}
				cssString += key + ':' + value + ';';
			}
			this.element
				.removeClass('active')
				.attr('style', cssString);
			this.didFindProperty = false;
		},
		computeWrapper: function() {
			this.wrapper.css({
				height: this.element.css("position") !== "absolute" ? this.element.outerHeight() : "",
				float: this.element.css("float") !== "none" ? this.element.css("float") : "",
				margin: this.element.css("margin")
			});
		}
	});
});
