(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-dropdown', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.dropdown requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var $ = _c.$;
	var active = false;
	var hoverIdle = null;

	_c.component('dropdown', {
		defaults: {
			mode: 'hover',
			remaintime: 800,
			delay: 0
		},
		remainIdle: false,
		boot: function() {
			var triggerevent = _c.support.touch ? 'click' : 'mouseenter';
			_c.$html.on(triggerevent + '.dropdown.clique', '[data-dropdown]', function(e) {
				var ele = _c.$(this);
				if(!ele.data('clique.data.dropdown')) {
					var obj = _c.dropdown(ele, _c.utils.options(ele.data('dropdown')));
					if(triggerevent === 'click' || triggerevent === 'mouseenter' && obj.options.mode === 'hover') {
						obj.element.trigger(triggerevent);
					}
					if(obj.element.find('.dropdown').length) {
						e.preventDefault();
					}
				}
			});
		},
		init: function() {
			var $this = this;

			// Set public properties
			this.dropdown = this.find('.dropdown');
			this.centered = this.dropdown.hasClass('dropdown-center');
			this.boundary = _c.$(this.options.boundary).length ? _c.$(this.options.boundary) : _c.$win;
			this.flipped = this.dropdown.hasClass('dropdown-flip');
			this.scrollable = this.dropdown.hasClass('dropdown-scrollable');

			// Set aria
			this.setAria();

			if(this.options.mode === 'click' || _c.support.touch) {
				this.on('click.clique.dropdown', (function(_this) {
					return function(e) {
						var target;
						target = _c.$(e.target);
						if(!target.parents('.dropdown').length) {
							if(target.is('a[href="#"]') || target.parent().is('a[href="#"]') || _this.dropdown.length && !_this.dropdown.is(':visible')) {
								e.preventDefault();
							}
							target.blur();
						}
						if(!_this.element.hasClass('open')) {
							return _this.show();
						} else {
							if(target.is('a:not(.js-prevent)') || target.is('.dropdown-close') || !_this.dropdown.find(e.target).length) {
								return _this.hide();
							}
						}
					};
				})(this));
			} else {
				this.on('mouseenter', function() {
					if($this.remainIdle) {
						clearTimeout($this.remainIdle);
					}
					if(hoverIdle) {
						clearTimeout(hoverIdle);
					}
					hoverIdle = setTimeout($this.show.bind($this), $this.options.delay);
				}).on('mouseleave', function() {
					if(hoverIdle) {
						clearTimeout(hoverIdle);
					}
					$this.remainIdle = setTimeout(function() {
						return $this.hide();
					}, $this.options.remaintime);
				}).on('click', function(e) {
					var $target;
					$target = $(e.target);
					if($this.remainIdle) {
						clearTimeout($this.remainIdle);
					}
					if($target.is('a[href=\'#\']') || $target.parent().is('a[href=\'#\']')) {
						e.preventDefault();
					}
					return $this.show();
				});
			}
		},
		show: function() {
			_c.$html.off('click.outer.dropdown');
			if(active && active[0] !== this.element[0]) {
				active.removeClass('open');
				active.attr('aria-expanded', 'false');
			}
			if(hoverIdle) {
				clearTimeout(hoverIdle);
			}
			this.element.addClass('open');

			// Set aria
			this.setAria();

			this.trigger('show.clique.dropdown', [this]);
			_c.utils.checkDisplay(this.dropdown, true);
			active = this.element;
			return this.registerOuterClick();
		},
		hide: function() {
			this.element.removeClass('open');
			this.remainIdle = false;

			// Set aria
			this.setAria();

			this.trigger('hide.clique.dropdown', [this]);
			if(active && active[0] === this.element[0]) {
				active = false;
			}
		},
		setAria : function() {
			this.element.attr('aria-haspopup', 'true');
			this.element.attr('aria-expanded', this.element.hasClass('open'));
		},
		registerOuterClick: function() {
			var $this = this;
			_c.$html.off('click.outer.dropdown');
			return setTimeout(function() {
				return _c.$html.on('click.outer.dropdown', function(e) {
					if(hoverIdle) {
						clearTimeout(hoverIdle);
					}
					var $target = _c.$(e.target);
					if(active && active[0] === $this.element[0] && ($target.is('a:not(.js-prevent)') || $target.is('.dropdown-close') || !$this.dropdown.find(e.target).length)) {
						$this.hide();
						return _c.$html.off('click.outer.dropdown');
					}
				});
			}, 10);
		}
	});
});
