(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-grid', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.grid requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	_c.component('rowMatchHeight', {
		defaults: {
			target: false,
			row: true
		},
		boot: function() {
			_c.ready(function(context) {
				var browserSupportsFlex = _c.browser.supports('flex');
				_c.$('[data-row-match]', context).each(function() {
					var ele = _c.$(this);
					if(browserSupportsFlex && !ele.hasClass('row-match')) {
						ele.addClass('row-match');
					} else if(!browserSupportsFlex && !ele.data('rowMatchHeight')) {
						_c.rowMatchHeight(ele, _c.utils.options(ele.attr('data-row-match')));
					}
				});
			});
		},
		init: function() {
			this.columns = this.element.children();
			this.elements = this.options.target ? this.find(this.options.target) : this.columns;
			if(!this.columns.length) {
				return;
			}
			_c.$win.on('load resize orientationchange', function(_this) {
				return function() {
					var fn = function() {
						_this.match();
					};
					_c.$(function() {
						return fn();
					});
					return _c.utils.debounce(fn, 50);
				};
			}(this));
			_c.$html.on('changed.clique.dom', function(_this) {
				return function() {
					_this.columns = _this.element.children();
					_this.elements = _this.options.target ? _this.find(_this.options.target) : _this.columns;
					return _this.match();
				};
			}(this));
			this.on('display.clique.check', function(_this) {
				return function() {
					if(_this.element.is(':visible')) {
						return _this.match();
					}
				};
			}(this));
		},
		match: function() {
			var firstvisible = this.columns.filter(':visible:first');
			if(!firstvisible.length) {
				return;
			}
			var stacked = Math.ceil(100 * parseFloat(firstvisible.css('width')) / parseFloat(firstvisible.parent().css('width'))) >= 100;
			if(stacked) {
				this.revert();
			} else {
				_c.utils.matchHeights(this.elements, this.options);
			}
			return this;
		},
		revert: function() {
			this.elements.css('min-height', '');
			return this;
		}
	});
});
