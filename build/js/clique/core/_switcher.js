(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-switcher', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.switcher requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var Animations;

	function coreAnimation(cls, current, next) {
		var d = _c.$.Deferred();
		var clsIn = cls;
		var clsOut = cls;
		if(next[0] === current[0]) {
			d.resolve();
			return d.promise();
		}
		if(typeof cls === 'object') {
			clsIn = cls[0];
			clsOut = cls[1] || cls[0];
		}
		var release = function() {
			if(current) {
				current.hide().removeClass('active ' + clsOut + ' animation-reverse');
			}
			return next.addClass(clsIn).one(_c.support.animation.end, function() {
				next.removeClass('' + clsIn + '').css({
					opacity : '',
					display : ''
				});
				d.resolve();
				if(current) {
					return current.css({
						opacity : '',
						display : ''
					});
				}
			}).show();
		};
		next.css('animation-duration', this.options.duration + 'ms');
		if(current && current.length) {
			current.css('animation-duration', this.options.duration + 'ms');
			current.css('display', 'none').addClass(clsOut + ' animation-reverse').one(_c.support.animation.end, function() {
				return release();
			}).css('display', '');
		} else {
			next.addClass('active');
			release();
		}
		return d.promise();
	}

	_c.component('switcher', {
		defaults: {
			connect: false,
			toggle: '> *',
			active: 0,
			animation: false,
			duration: 200
		},
		animating: false,
		boot: function() {
			_c.ready(function(context) {
				_c.$('[data-switcher]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.switcher')) {
						_c.switcher(ele, _c.utils.options(ele.attr('data-switcher')));
					}
				});
			});
		},
		init: function() {
			var active, toggles;
			this.on('click.clique.switcher', this.options.toggle, function(_this) {
				return function(e) {
					e.preventDefault();
					return _this.show(this);
				};
			}(this));
			if(this.options.connect) {
				this.connect = _c.$(this.options.connect);
				this.connect.find('.active').removeClass('.active');
				if(this.connect.length) {
					this.connect.children().attr('aria-hidden', 'true');
					this.connect.on('click', '[data-switcher-item]', function(_this) {
						return function(e) {
							e.preventDefault();
							var item = _c.$(this).attr('data-switcher-item');
							if(_this.index === item) {
								return;
							}
							switch(item) {
								case 'next':
								case 'previous':
									return _this.show(_this.index + (item === 'next' ? 1 : -1));
								default:
									return _this.show(parseInt(item, 10));
							}
						};
					}(this)).on('swipeRight swipeLeft', function(_this) {
						return function(e) {
							e.preventDefault();
							return _this.show(_this.index + (e.type === 'swipeLeft' ? 1 : -1));
						};
					}(this));
				}
				toggles = this.find(this.options.toggle);
				active = toggles.filter('.active');
				if(active.length) {
					this.show(active, false);
				} else {
					if(this.options.active === false) {
						return;
					}
					active = toggles.eq(this.options.active);
					this.show((active.length ? active : toggles.eq(0)), false);
				}
				toggles.not(active).attr('aria-expanded', 'false');
				active.attr('aria-expanded', 'true');
				return this.on('changed.clique.dom', function(_this) {
					return function() {
						_this.connect = _c.$(_this.options.connect);
					};
				}(this));
			}
		},
		show: function(tab, animate) {
			if(this.animating) {
				return;
			}
			if(isNaN(tab)) {
				tab = _c.$(tab);
			} else {
				toggles = this.find(this.options.toggle);
				tab = (tab < 0 ? toggles.length - 1 : tab);
				tab = toggles.eq((toggles[tab] ? tab : 0));
			}
			var toggles = this.find(this.options.toggle);
			var active = _c.$(tab);
			var animation = Animations[this.options.animation] || function(_this) {
				return function(current, next) {
					if(!_this.options.animation) {
						return Animations.none.apply(_this);
					}
					var anim = _this.options.animation.split(',');
					if(anim.length === 1) {
						anim[1] = anim[0];
					}
					anim[0] = anim[0].trim();
					anim[1] = anim[1].trim();
					return coreAnimation.apply(_this, [anim, current, next]);
				};
			}(this);
			if(animate === false || !_c.support.animation) {
				animation = Animations.none;
			}
			if(active.hasClass('disabled')) {
				return;
			}
			toggles.attr('aria-expanded', 'false');
			active.attr('aria-expanded', 'true');
			toggles.filter('.active').removeClass('active');
			active.addClass('active');
			if(this.options.connect && this.connect.length) {
				this.index = this.find(this.options.toggle).index(active);
				if(this.index === -1) {
					this.index = 0;
				}
				this.connect.each(function(_this) {
					return function() {
						var container = _c.$(this);
						var children = _c.$(container.children());
						var current = _c.$(children.filter('.active'));
						var next = _c.$(children.eq(_this.index));
						_this.animating = true;
						return animation.apply(_this, [current, next]).then(function() {
							current.removeClass('active');
							next.addClass('active');
							current.attr('aria-hidden', 'true');
							next.attr('aria-hidden', 'false');
							_c.utils.checkDisplay(next, true);
							_this.animating = false;
						});
					};
				}(this));
			}
			return this.trigger('show.clique.switcher', [active]);
		}
	});

	Animations = {
		none : function() {
			var d = _c.$.Deferred();
			d.resolve();
			return d.promise();
		},
		fade : function(current, next) {
			return coreAnimation.apply(this, ['animation-fade', current, next]);
		},
		'slide-bottom' : function(current, next) {
			return coreAnimation.apply(this, ['animation-slide-bottom', current, next]);
		},
		'slide-top' : function(current, next) {
			return coreAnimation.apply(this, ['animation-slide-top', current, next]);
		},
		'slide-vertical' : function(current, next) {
			var anim = ['animation-slide-top', 'animation-slide-bottom'];
			if(current && current.index() > next.index()) {
				anim.reverse();
			}
			return coreAnimation.apply(this, [anim, current, next]);
		},
		'slide-left' : function(current, next) {
			return coreAnimation.apply(this, ['animation-slide-left', current, next]);
		},
		'slide-right' : function(current, next) {
			return coreAnimation.apply(this, ['animation-slide-right', current, next]);
		},
		'slide-horizontal' : function(current, next) {
			var anim = ['animation-slide-right', 'animation-slide-left'];
			if(current && current.index() > next.index()) {
				anim.reverse();
			}
			return coreAnimation.apply(this, [anim, current, next]);
		},
		scale : function(current, next) {
			return coreAnimation.apply(this, ['animation-scale-up', current, next]);
		}
	};
	_c.switcher.animations = Animations;
});
