(function(addon) {
	if (typeof define === "function" && define.amd) {
		define("clique-offcanvas", [ "clique" ], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error("Clique.offcanvas requires Clique.core");
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var scrollpos = {};
	_c.component("offcanvas", {
		boot: function() {
			_c.$html.on("click.offcanvas.clique", "[data-offcanvas]", function(e) {
				var ele, obj;
				e.preventDefault();
				ele = _c.$(this);
				if (!ele.data("clique.data.offcanvas")) {
					obj = _c.offcanvas(ele, _c.utils.options(ele.attr("data-offcanvas")));
					ele.trigger("click");
				}
			});
		},
		init: function() {
			var $this;
			$this = this;
			this.options = _c.$.extend({
				target: $this.element.is("a") ? $this.element.attr("href") : false
			}, this.options);
			this.on("click", function(_this) {
				return function(e) {
					e.preventDefault();
					_this.show($this.options.target);
				};
			}(this));
		},
		show: function() {
			var element, bar, dir, flip, rtl, $this = this;
			// console.log(this);
			element = _c.$(this.options.target);
			if (!element.length) {
				return;
			}
			element.trigger("willshow.clique.offcanvas");
			if(this.scrollToPosition) {
				delete this.scrollToPosition;
			}
			bar = element.find(".offcanvas-bar").first();
			rtl = _c.langdirection === "right";
			flip = bar.hasClass("offcanvas-bar-flip") ? -1 : 1;
			dir = flip * (rtl ? -1 : 1);
			scrollpos = {
				x: _c.$win.scrollLeft(),
				y: _c.$win.scrollTop()
			};
			element.one(_c.support.transition.end, function() {
				$this.bindCloseListeners();
				element.attr("aria-hidden", "false");
				element.trigger("didshow.clique.offcanvas");
			}).addClass("active");
			_c.$body.css({
				width: _c.$win.width(),
				height: _c.$win.height()
			}).addClass("offcanvas-page");
			_c.$body.css(rtl ? "margin-right" : "margin-left", (rtl ? -1 : 1) * (bar.outerWidth() * dir)).width();
			_c.$html.css("margin-top", scrollpos.y * -1);
			bar.addClass("offcanvas-bar-show");
		},
		hide: function(force) {
			var bar, element, rtl;
			element = _c.$(this.options.target);
			bar = element.find(".offcanvas-bar").first();
			rtl = _c.langdirection === "right";
			if (!element.length) {
				return;
			}
			element.trigger("willhide.clique.offcanvas");
			bar.one(_c.support.transition.end, (function(_this) {
				return function() {
					_c.$body.removeClass("offcanvas-page");
					_c.$body.css({
						width: "",
						height: "",
						"margin-left": "",
						"margin-right": ""
					});
					element.removeClass("active");
					_c.$html.css("margin-top", "");
					_c.$win.scrollTop(scrollpos.y);
					element.attr("aria-hidden", "true");
					element.trigger("didhide.clique.offcanvas");
					if(_this.scrollToPosition) {
						_c.$('html, body').stop(true).animate({
							scrollTop : _this.scrollToPosition
						});
					}
				};
			}(this))).removeClass("offcanvas-bar-show");
			_c.$body.css(rtl ? "margin-right" : "margin-left", "");
		},
		bindCloseListeners: function() {
			var element = _c.$(this.options.target);
			if (element.data("clique.data.offcanvasCloseBound")) {
				return;
			}
			element.on("click.clique.offcanvas swipeRight.clique.offcanvas swipeLeft.clique.offcanvas", function(_this) {
				return function(e) {
					var target = _c.$(e.target);
					if(target.is('a[href^=\'#\']')) {
						e.preventDefault();
						var id = _c.$(target).attr('href');
						if(_c.$(id).length) {
							_this.scrollToPosition = _c.$(id)[0].offsetTop;
						}
					}
					if (!e.type.match(/swipe/) && !target.hasClass("offcanvas-close")) {
						if(target.hasClass("offcanvas-bar")) {
							return;
						}
					}
					e.stopImmediatePropagation();
					_this.hide();
				};
			}(this));
			_c.$html.on("keydown.clique.offcanvas", function(_this) {
				return function(e) {
					if (e.keyCode === 27) {
						_this.hide();
					}
				};
			}(this));
			element.data("clique.data.offcanvasCloseBound", true);
		}
	});
});
