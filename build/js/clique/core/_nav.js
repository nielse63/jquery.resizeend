(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-nav', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.nav requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	_c.component('nav', {
		defaults: {
			toggle : '> .parent > a[href=\'#\']',
			lists : '> .parent > ul',
			multiple : false
		},
		boot: function() {
			_c.ready(function(context) {
				_c.$('[data-nav]', context).each(function() {
					var ele = _c.$(this);
					if(!ele.data('clique.data.nav')) {
						_c.nav(ele, _c.utils.options(ele.attr('data-nav')));
					}
				});
			});
		},
		init: function() {
			this.on('click.clique.nav', this.options.toggle, (function(_this) {
				return function(e) {
					e.preventDefault();
					var ele = _c.$(this);
					_this.open((ele.parent()[0] === _this.element[0] ? ele : ele.parent('li')));
				};
			})(this));
			this.find(this.options.lists).each((function(_this) {
				return function() {
					var ele = _c.$(this);
					var parent = ele.parent();

					ele.wrap('<div style="overflow:hidden;height:0;position:relative;"></div>');
					parent
						.data('list-container', ele.parent())
						.attr('aria-expanded', parent.hasClass('open'));
					if(parent.hasClass('active') || parent.hasClass('open')) {
						_this.open(parent, true);
					}
				};
			})(this));
		},
		open: function(li) {
			var element = this.element;
			li = _c.$(li);
			if(!this.options.multiple) {
				element.children('.open').not(li).each(function() {
					var ele = _c.$(this),
						parent = ele.data('list-container');

					if(parent) {
						parent.stop().animate({
							height : 0
						}, function() {
							_c.$(this).parent().removeClass('open');
						});
					}
				});
			}
			li.toggleClass('open');
			li.attr('aria-expanded', li.hasClass('open'));
			if(li.data('list-container')) {
				li.data('list-container').stop().animate({
					height : li.hasClass('open') ? _c.utils.getHeight(li.data('list-container').find('ul:first')) : 0
				}, (function(_this) {
					return function() {
						_this.trigger('display.clique.check');
					};
				})(this));
			}
		}
	});
});
