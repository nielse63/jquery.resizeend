(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-utility', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.utility requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	var stacks = [];

	_c.component('stackMargin', {
		defaults: {
			class: 'margin-small-top'
		},
		boot: function() {
			return _c.ready(function(context) {
				return _c.$('[data-margin]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.stackMargin')) {
						_c.stackMargin(ele, _c.utils.options(ele.attr('data-margin')));
					}
				});
			});
		},
		init: function() {
			this.columns = this.element.children();
			if(!this.columns.length) {
				return;
			}
			_c.$win.on('resize orientationchange', (function(_this) {
				return function() {
					var fn;
					fn = function() {
						return _this.process();
					};
					_c.$(function() {
						fn();
						return _c.$win.on('load', fn);
					});
					return _c.utils.debounce(fn, 20);
				};
			}(this))());
			_c.$html.on('changed.clique.dom', (function(_this) {
				return function() {
					_this.columns = _this.element.children();
					return _this.process();
				};
			})(this));
			this.on('display.clique.check', (function(_this) {
				return function() {
					_this.columns = _this.element.children();
					if(_this.element.is(':visible')) {
						return _this.process();
					}
				};
			})(this));
			return stacks.push(this);
		},
		process: function() {
			_c.utils.stackMargin(this.columns, this.options);
			return this;
		},
		revert: function() {
			this.columns.removeClass(this.options.class);
			return this;
		}
	});

	_c.ready((function() {
		var iframes = [];
		var check = function() {
			return iframes.forEach(function(iframe) {
				if(!iframe.is(':visible')) {
					return;
				}
				var width = iframe.parent().width();
				var iwidth = iframe.data('width');
				var ratio = width / iwidth;
				var height = Math.floor(ratio * iframe.data('height'));
				return iframe.css({
					height: width < iwidth ? height : iframe.data('height')
				});
			});
		};
		_c.$win.on('resize', _c.utils.debounce(check, 15));
		return function(context) {
			_c.$('iframe.responsive-width', context).each(function() {
				var iframe = _c.$(this);
				if(!iframe.data('responsive') && iframe.attr('width') && iframe.attr('height')) {
					iframe.data('width', iframe.attr('width'));
					iframe.data('height', iframe.attr('height'));
					iframe.data('responsive', true);
					return iframes.push(iframe);
				}
			});
			return check();
		};
	})());

	_c.utils.stackMargin = function(elements, options) {
		options = _c.$.extend({
			class: 'margin-small-top'
		}, options);
		options.class = options.class;
		elements = _c.$(elements).removeClass(options.class);
		var skip = false;
		var firstvisible = elements.filter(':visible:first');
		var offset = firstvisible.length ? firstvisible.position().top + firstvisible.outerHeight() - 1 : false;
		if(offset === false) {
			return;
		}
		return elements.each(function() {
			var column = _c.$(this);
			if(column.is(':visible')) {
				if(skip) {
					return column.addClass(options.class);
				} else {
					if(column.position().top >= offset) {
						skip = column.addClass(options.class);
					}
				}
			}
		});
	};
});
