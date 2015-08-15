(function(addon) {
	if (typeof define === 'function' && define.amd) {
		define('clique-accordion', ['clique'], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error('Clique.accordion requires Clique.core');
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	// Private variables
	var PRIVATE = {
		classes : {
			active : 'active',
			toggle : '.accordion-title'
		}
	};

	_c.component('accordion', {
		defaults: {
			collapse: true,
			animate: true,
			duration: 300,
			toggle: '.accordion-title',
			containers: '.accordion-content',
		},
		boot: function() {
			_c.ready(function(context) {
				_c.$('[data-accordion]', context).each(function() {
					var ele = _c.$(this);
					if (!ele.data('clique.data.accordion')) {
						_c.accordion(ele, _c.utils.options(ele.attr('data-accordion')));
					}
				});
			});
		},
		init: function() {
			this.element.on('click.clique.accordion', this.options.toggle, (function(_this) {
				return function(e) {
					e.preventDefault();
					_this.trigger('willupdate.clique.accordion')
					if(_this.options.collapse) {
						_c.$(this).siblings(PRIVATE.classes.toggle).removeClass(PRIVATE.classes.active);
					}
					_c.$(this).toggleClass(PRIVATE.classes.active);
					_this.toggleItem(_c.$(this).data('wrapper'), _this.options.animate, _this.options.collapse);
				};
			})(this));
			this.update();
			if(!this.element.find('> .' + PRIVATE.classes.active).length) {
				this.element.find('> ' + PRIVATE.classes.toggle).first().addClass(PRIVATE.classes.active);
			}
			var idx = this.element.find('> .' + PRIVATE.classes.active).prevAll(PRIVATE.classes.toggle).length
			this.toggleItem(this.toggle.eq(idx).data('wrapper'), false, false);
		},
		toggleItem: function(wrapper, animated, collapse) {
			var $this, active;
			$this = this;
			active = wrapper.data('toggle').hasClass(PRIVATE.classes.active);
			if(collapse) {
				this.toggle.not(wrapper.data('toggle')).removeClass(PRIVATE.classes.active);
				this.content.not(wrapper.data('content')).parent().stop().animate({
					height: 0
				}, {
					duration: (animated ? this.options.duration : 0)
				}).attr('aria-expanded', 'false');
			}
			if(animated) {
				wrapper.stop().animate({
					height: active ? _c.utils.getHeight(wrapper.data('content')) : 0
				}, this.options.duration).promise().done(function(_this) {
					return function() {
						if (active) {
							_c.utils.checkDisplay(wrapper.data('content'));
							wrapper.height('auto');
						}
						_this.trigger('display.clique.check');
					};
				}(this));
			} else {
				wrapper.stop().height((active ? 'auto' : 0));
				if (active) {
					_c.utils.checkDisplay(wrapper.data('content'));
				}
				this.trigger('display.clique.check');
			}
			wrapper.attr('aria-expanded', active);
			this.element.trigger('toggle.clique.accordion', [active, wrapper.data('toggle'), wrapper.data('content')]);
		},
		update: function() {
			this.toggle = this.find(this.options.toggle);
			this.content = this.find(this.options.containers);
			this.content.each(function(_this) {
				return function(index, el) {
					var content,
					toggle,
					wrapper;
					content = _c.$(el);
					if (content.parent().data('wrapper')) {
						wrapper = content.parent();
					} else {
						wrapper = _c.$(el).wrap('<div data-wrapper="true" style="overflow:hidden;height:0;position:relative;"></div>').parent();
						wrapper.attr('aria-expanded', 'false');
					}
					toggle = _this.toggle.eq(index);
					wrapper.data('toggle', toggle);
					wrapper.data('content', content);
					toggle.data('wrapper', wrapper);
					content.data('wrapper', wrapper);
				};
			}(this));
			this.element.trigger('update.clique.accordion', [this]);
		}
	});
});
