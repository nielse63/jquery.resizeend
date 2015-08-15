(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-cover', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.cover requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	_c.component('cover', {
		defaults: {
			automute: true
		},
		boot: function() {
			return _c.ready(function(context) {
				return _c.$('[data-cover]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.cover')) {
						_c.cover(ele, _c.utils.options(ele.attr('data-cover')));
					}
				});
			});
		},
		init: function() {
			var src;
			this.parent = this.element.parent();
			_c.$win.on('load resize orientationchange', _c.utils.debounce((function(_this) {
				return function() {
					return _this.check();
				};
			})(this), 100));
			this.on('display.clique.check', (function(_this) {
				return function() {
					if(_this.is(':visible')) {
						return _this.check();
					}
				};
			})(this));
			this.check();
			if(this.element.is('iframe') && this.options.automute) {
				src = this.element.attr('src');
				this.element
					.attr('src', '')
					.on('load', function() {
						this.contentWindow.postMessage('{ "event" : "command", "func" : "mute", "method" :"setVolume", "value" :0}', '*');
					})
					.attr('src', [src, src.indexOf('?') > -1 ? '&' : '?', 'enablejsapi=1&api=1'].join(''));
			}
		},
		check: function() {
			var h, height,
				w, width,
				attrWidth,
				attrHeight;
			this.element.css({
				width : '',
				height : ''
			});
			this.dimension = {
				w : this.element.width(),
				h : this.element.height()
			};

			attrWidth = this.element.attr('width');
			attrHeight = this.element.attr('width');
			if(attrWidth && _c.utils.isNumber(attrWidth)) {
				this.dimension.w = attrWidth;
			}
			if(attrHeight && _c.utils.isNumber(attrHeight)) {
				this.dimension.h = attrHeight;
			}

			this.ratio = this.dimension.w / this.dimension.h;
			w = this.parent.width();
			h = this.parent.height();
			if(w / this.ratio < h) {
				width = Math.ceil(h * this.ratio);
				height = h;
			} else {
				width = w;
				height = Math.ceil(w / this.ratio);
			}
			return this.element.css({
				width: width,
				height: height
			});
		}
	});
});
