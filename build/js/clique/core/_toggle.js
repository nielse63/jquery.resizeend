(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-toggle', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.toggle requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var toggles = [];
	return _c.component('toggle', {
		defaults: {
			target: false,
			class: 'hidden',
			animation: false,
			duration: 400
		},
		boot: function() {
			return _c.ready(function(context) {
				_c.$('[data-toggle]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.toggle')) {
						_c.toggle(ele, _c.utils.options(ele.attr('data-toggle')));
					}
				});
				return setTimeout(function() {
					return toggles.forEach(function(toggle) {
						return toggle.getToggles();
					});
				}, 0);
			});
		},
		init: function() {
			this.aria = this.options.class.indexOf('hidden') !== -1;
			this.getToggles();
			this.on('click', function(_this) {
				return function(e) {
					if(_this.element.is('a[href="#"]')) {
						e.preventDefault();
					}
					return _this.toggle();
				};
			}(this));
			return toggles.push(this);
		},
		toggle: function() {
			if(!this.totoggle.length) {
				return;
			}
			if(this.options.animation && _c.support.animation) {
				var animations = this.options.animation.split(',');
				if(animations.length === 1) {
					animations[1] = animations[0];
				}
				animations[0] = animations[0].trim();
				animations[1] = animations[1].trim();
				this.totoggle.css('animation-duration', this.options.duration + 'ms');
				if(this.totoggle.hasClass(this.options.class)) {
					this.totoggle.toggleClass(this.options.class);
					this.totoggle.each(function() {
						return _c.utils.animate(this, animations[0]).then(function() {
							_c.$(this).css('animation-duration', '');
							return _c.utils.checkDisplay(this);
						});
					});
				} else {
					this.totoggle.each(function() {
						return _c.utils.animate(this, animations[1] + ' animation-reverse').then((function(_this) {
							return function() {
								_c.$(_this).toggleClass(_this.options.class).css('animation-duration', '');
								return _c.utils.checkDisplay(_this);
							};
						})(this));
					});
				}
			} else {
				this.totoggle.toggleClass(this.options.class);
				var evt = _c.$.Event({
					type: 'toggle.clique',
					relatedTarget: this.element
				});
				this.totoggle.trigger(evt);
				_c.utils.checkDisplay(this.totoggle);
			}
			return this.updateAria();
		},
		getToggles: function() {
			this.totoggle = this.options.target ? _c.$(this.options.target) : [];
			return this.updateAria();
		},
		updateAria: function() {
			if(this.aria && this.totoggle.length) {
				return this.totoggle.each(function() {
					return _c.$(this).attr('aria-hidden', _c.$(this).hasClass('hidden'));
				});
			}
		}
	});
});
