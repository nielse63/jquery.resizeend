(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-tab', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.tab requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	return _c.component('tab', {
		defaults: {
			target: '> li:not(.tab-responsive, .disabled)',
			connect: false,
			active: 0,
			animation: false,
			duration: 200
		},
		boot: function() {
			return _c.ready(function(context) {
				return _c.$('[data-tab]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.tab')) {
						_c.tab(ele, _c.utils.options(ele.attr('data-tab')));
					}
				});
			});
		},
		init: function() {
			this.on('click.clique.tab', this.options.target, function(_this) {
				return function(e) {
					e.preventDefault();
					if(_this.switcher && _this.switcher.animating) {
						return;
					}
					var current = _this.find(_this.options.target).not(this);
					current.removeClass('active').blur();
					_this.trigger('change.clique.tab', [_c.$(this).addClass('active')]);
					if(!_this.options.connect) {
						current.attr('aria-expanded', 'false');
						return _c.$(this).attr('aria-expanded', 'true');
					}
				};
			}(this));
			if(this.options.connect) {
				this.connect = _c.$(this.options.connect);
			}
			this.responsivetab = _c.$('<li class="tab-responsive active"><a></a></li>').append('<div class="dropdown dropdown-small"><ul class="nav nav-dropdown"></ul><div>');
			this.responsivetab.dropdown = this.responsivetab.find('.dropdown');
			this.responsivetab.lst = this.responsivetab.dropdown.find('ul');
			this.responsivetab.caption = this.responsivetab.find('a:first');
			if(this.element.hasClass('tab-bottom')) {
				this.responsivetab.dropdown.addClass('dropdown-up');
			}
			this.responsivetab.lst.on('click.clique.tab', 'a', function(_this) {
				return function(e) {
					e.preventDefault();
					e.stopPropagation();
					var link = _c.$(this);
					return _this.element.children(':not(.tab-responsive)').eq(link.data('index')).trigger('click');
				};
			}(this));
			this.on('show.clique.switcher change.clique.tab', function(_this) {
				return function(e, tab) {
					return _this.responsivetab.caption.html(tab.text());
				};
			}(this));
			this.element.append(this.responsivetab);
			if(this.options.connect) {
				this.switcher = _c.switcher(this.element, {
					toggle: '> li:not(.tab-responsive)',
					connect: this.options.connect,
					active: this.options.active,
					animation: this.options.animation,
					duration: this.options.duration
				});
			}
			if(_c.dropdown) {
				_c.dropdown(this.responsivetab, {
					mode: 'click'
				});
			}
			this.trigger('change.clique.tab', [this.element.find(this.options.target).filter('.active')]);
			this.check();
			_c.$win.on('resize orientationchange', _c.utils.debounce(function(_this) {
				return function() {
					if(_this.element.is(':visible')) {
						return _this.check();
					}
				};
			}(this), 100));
			return this.on('display.clique.check', function(_this) {
				return function() {
					if(_this.element.is(':visible')) {
						return _this.check();
					}
				};
			}(this));
		},
		check: function() {
			var children = this.element.children(':not(.tab-responsive)').removeClass('hidden');
			if(!children.length) {
				return;
			}
			var top = children.eq(0).offset().top + Math.ceil(children.eq(0).height() / 2);
			var doresponsive = false;
			this.responsivetab.lst.empty();
			children.each(function() {
				if(_c.$(this).offset().top > top) {
					doresponsive = true;
				}
			});
			if(doresponsive) {
				var i = 0;
				while(i < children.length) {
					var item = _c.$(children.eq(i));
					var link = item.find('a');
					if(item.css('float') !== 'none' && !item.attr('dropdown')) {
						item.addClass('hidden');
						if(!item.hasClass('disabled')) {
							this.responsivetab.lst.append('<li><a href="' + link.attr('href') + '" data-index="' + i + '">' + link.html() + '</a></li>');
						}
					}
					i++;
				}
			}
			return this.responsivetab[(this.responsivetab.lst.children().length ? 'removeClass' : 'addClass')]('hidden');
		}
	});
});
