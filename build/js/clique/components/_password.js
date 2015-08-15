(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-password', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.password requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	_c.component('password', {
		defaults: {
			show: 'Show',
			hide: 'Hide'
		},
		boot: function() {
			return _c.$html.on('click.password.clique', '[data-password]', function(e) {
				var ele = _c.$(this);
				if(!ele.data('clique.data.password')) {
					e.preventDefault();
					_c.password(ele, _c.utils.options(ele.attr('data-password')));
					return ele.trigger('click');
				}
			});
		},
		init: function() {
			this.on('click', (function(_this) {
				return function(e) {
					e.preventDefault();
					if(_this.input.length) {
						var type = _this.input.attr('type');
						_this.input.attr('type', (type === 'text' ? 'password' : 'text'));
						return _this.element.text(_this.options[(type === 'text' ? 'show' : 'hide')]);
					}
				};
			})(this));
			this.input = (this.element.next('input').length ? this.element.next('input') : this.element.prev('input'));
			this.element.text(this.options[(this.input.is('[type=\'password\']') ? 'show' : 'hide')]);
			return this.element.data('password', this);
		}
	});
});
