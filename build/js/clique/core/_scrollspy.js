(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-scrollspy', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.scrollspy requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var scrollspies = [],
		scrollspynavs = [];
	var $ = _c.$;

	function checkScrollSpy() {
		var i = 0;
		var _results = [];
		while(i < scrollspies.length) {
			_c.support.requestAnimationFrame.apply(window, [scrollspies[i].check]);
			_results.push(i++);
		}
		return _results;
	}

	_c.component('scrollspy', {
		defaults: {
			target: false,
			class: 'scrollspy-inview',
			initcls: 'scrollspy-init-inview',
			topoffset: 0,
			leftoffset: 0,
			repeat: false,
			delay: 0
		},
		boot: function() {
			_c.$doc.on('scrolling.clique.dom', _c.utils.debounce(checkScrollSpy, 150));
			_c.$win.on('load resize orientationchange', _c.utils.debounce(checkScrollSpy, 150));
			return _c.ready(function(context) {
				return _c.$('[data-scrollspy]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.scrollspy')) {
						_c.scrollspy(ele, _c.utils.options(ele.attr('data-scrollspy')));
					}
				});
			});
		},
		init: function() {
			var $this = this;
			var togglecls = this.options.class.split(/,/);
			var fn = function() {
				var delayIdx, elements, toggleclsIdx;
				elements = $this.options.target ? $this.element.find($this.options.target) : $this.element;
				delayIdx = elements.length === 1 ? 1 : 0;
				toggleclsIdx = 0;
				return elements.each(function() {
					var element, initinview, inview, inviewstate, toggle;
					element = _c.$(this);
					inviewstate = element.data('inviewstate');
					inview = _c.utils.isInView(element, $this.options);
					toggle = element.data('cliqueScrollspyCls') || togglecls[toggleclsIdx].trim();
					if(inview && !inviewstate && !element.data('scrollspy-idle')) {
						if(!initinview) {
							element.addClass($this.options.initcls);
							$this.offset = element.offset();
							initinview = true;
							element.trigger('init.clique.scrollspy');
						}
						element.data('scrollspy-idle', setTimeout(function() {
							element.addClass('scrollspy-inview').toggleClass(toggle).width();
							element.trigger('inview.clique.scrollspy');
							element.data('scrollspy-idle', false);
							return element.data('inviewstate', true);
						}, $this.options.delay * delayIdx));
						delayIdx++;
					}
					if(!inview && inviewstate && $this.options.repeat) {
						if(element.data('scrollspy-idle')) {
							clearTimeout(element.data('scrollspy-idle'));
						}
						element.removeClass('scrollspy-inview').toggleClass(toggle);
						element.data('inviewstate', false);
						element.trigger('outview.clique.scrollspy');
					}
					toggleclsIdx = togglecls[toggleclsIdx + 1] ? toggleclsIdx + 1 : 0;
				});
			};
			fn();
			this.check = fn;
			return scrollspies.push(this);
		}
	});

	function checkScrollSpyNavs() {
		var i = 0;
		var _results = [];
		while(i < scrollspynavs.length) {
			_c.support.requestAnimationFrame.apply(window, [scrollspynavs[i].check]);
			_results.push(i++);
		}
		return _results;
	}

	return _c.component('scrollspynav', {
		defaults: {
			class: 'active',
			closest: false,
			topoffset: 0,
			leftoffset: 0,
			smoothscroll: false
		},
		boot: function() {
			_c.$doc.on('scrolling.clique.dom', checkScrollSpyNavs);
			_c.$win.on('resize orientationchange', _c.utils.debounce(checkScrollSpyNavs, 50));
			return _c.ready(function(context) {
				return $('[data-scrollspy-nav]', context).each(function() {
					var ele = $(this);
					if(!ele.data('scrollspynav')) {
						_c.scrollspynav(ele, _c.utils.options(ele.attr('data-scrollspy-nav')));
					}
				});
			});
		},
		init: function() {
			var ids = [];
			var links = this.find('a[href^=\'#\']').each(function() {
				return ids.push($(this).attr('href'));
			});
			var targets = $(ids.join(','));
			var clsActive = this.options.class;
			var clsClosest = this.options.closest || this.options.closest;
			var $this = this;
			var fn = function() {
				var inviews = [];
				var i = 0;
				while(i < targets.length) {
					if(_c.utils.isInView(targets.eq(i), $this.options)) {
						inviews.push(targets.eq(i));
					}
					i++;
				}
				if(inviews.length) {
					var scrollTop = _c.$win.scrollTop();
					var target = (function() {
						i = 0;
						while(i < inviews.length) {
							if(inviews[i].offset().top >= scrollTop) {
								return inviews[i];
							}
							i++;
						}
					})();
					if(!target) {
						return;
					}
					var navitems;
					if($this.options.closest) {
						links.closest(clsClosest).removeClass(clsActive);
						navitems = links.filter('a[href=\'#' + target.attr('id') + '\']').closest(clsClosest).addClass(clsActive);
					} else {
						navitems = links.removeClass(clsActive).filter('a[href=\'#' + target.attr('id') + '\']').addClass(clsActive);
					}
					return $this.element.trigger('inview.clique.scrollspynav', [target, navitems]);
				}
			};
			if(this.options.smoothscroll && _c.scrollTo) {
				links.each(function() {
					return _c.smoothScroll(this, $this.options.smoothscroll);
				});
			}
			fn();
			this.element.data('scrollspynav', this);
			this.check = fn;
			return scrollspynavs.push(this);
		}
	});
});
