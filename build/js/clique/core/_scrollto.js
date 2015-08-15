(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-scrollto', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.scrollTo requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	_c.component('scrollTo', {
		defaults : {
			duration : 1000,
			transition : 'easeOutExpo',
			offset: 0
		},
		boot: function() {
			return _c.$html.on('click.scrollTo.clique', '[data-scrollto]', function(e) {
				e.preventDefault();
				var ele = _c.$(this);
				if(!ele.data('clique.data.scrollTo')) {
					_c.scrollTo(ele, _c.utils.options(ele.attr('data-scrollto')));
					return ele.trigger('click');
				}
			});
		},
		init: function() {
			var $this = this;
			return this.on('click', function(_this) {
				return function(e) {
					e.preventDefault();
					_this.trigger('willscroll.clique.scrollTo');
					var top = _c.$win.scrollTop();
					if(_this.options.offset) {
						if(typeof $this.options.offset === 'string' && _c.$(_this.options.offset).length) {
							top = _c.$(_this.options.offset).offset().top;
						} else {
							top = _c.$win.scrollTop() + _this.options.offset;
						}
					} else if(_c.$(this).attr('href') && _c.$(_c.$(this).attr('href')).length) {
						top = _c.$(_c.$(this).attr('href')).offset().top;
					}
					return _this.scrollTo(top);
				};
			}(this));
		},
		scrollTo : function(top) {
			_c.$win.on('mousewheel', function() {
				_c.$('html, body').stop(true);
			});
			return _c.$('html, body').stop().animate({
				scrollTop : top
			}, this.options.duration, this.options.transition).promise().done(function(_this) {
				return function() {
					_this.trigger('didscroll.clique.scrollTo');
					return _c.$win.off('mousewheel');
				};
			}(this));
		}
	});
	if(!_c.$.easing.easeOutExpo) {
		_c.$.easing.easeOutExpo = function(x, t, b, c, d) {
			if(t === d) {
				return b + c;
			} else {
				return c * (-Math.pow(2, -10 * t / d) + 1) + b;
			}
		};
	}
});
