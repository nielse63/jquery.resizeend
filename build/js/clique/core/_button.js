(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-button', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.button requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	_c.component('buttonRadio', {
		defaults: {
			target: '.button'
		},
		boot: function() {
			return _c.$html.on('click.buttonRadio.clique', '[data-button-radio]', function(e) {
				var ele = _c.$(this);
				if(!ele.data('clique.data.buttonRadio')) {
					var obj = _c.buttonRadio(ele, _c.utils.options(ele.attr('data-button-radio')));
					var target = _c.$(e.target);
					if(target.hasClass(obj.options.target) || target.is('button')) {
						return target.trigger('click');
					}
				}
			});
		},
		init: function() {
			var _target = this.options.target;
			this.find(_target)
				.attr('aria-checked', 'false')
				.filter('.active')
				.attr('aria-checked', 'true');

			this.on('click', this.options.target, (function(_this) {
				return function(e) {
					var ele = _c.$(this);

					if(ele.is('a[href="#"]')) {
						e.preventDefault();
					}

					_this.find(_target)
						.not(ele)
						.removeClass('active')
						.blur();
					ele.addClass('active');
					_this.find(_target).not(ele).attr('aria-checked', 'false');
					ele.attr('aria-checked', 'true');
					_this.trigger('change.clique.button', [ele]);
				};
			})(this));
		}
	});

	_c.component('buttonCheckbox', {
		defaults: {
			target: '.button'
		},
		boot: function() {
			return _c.$html.on('click.buttonCheckbox.clique', '[data-button-checkbox]', function(e) {
				var ele = _c.$(this);
				if(!ele.data('clique.data.buttonCheckbox')) {
					var obj = _c.buttonCheckbox(ele, _c.utils.options(ele.attr('data-button-checkbox')));
					var target = _c.$(e.target);
					if(target.hasClass(obj.options.target) || target.is('button')) {
						return target.trigger('click');
					}
				}
			});
		},
		init: function() {
			var _target = this.options.target;
			this.find(_target).attr('aria-checked', 'false')
				.filter('.active')
				.attr('aria-checked', 'true');

			return this.on('click', _target, (function(_this) {
				return function(e) {
					var ele = _c.$(this);
					if(ele.is('a[href="#"]')) {
						e.preventDefault();
					}
					ele.toggleClass('active').blur();
					ele.attr('aria-checked', ele.hasClass('active'));
					_this.trigger('change.clique.button', [ele]);
				};
			})(this));
		}
	});

	_c.component('button', {
		defaults: {},
		boot: function() {
			return _c.$html.on('click.button.clique', '[data-button]', function() {
				var ele = _c.$(this);
				if(!ele.data('clique.data.button')) {
					_c.button(ele, _c.utils.options(ele.attr('data-button')));
					return ele.trigger('click');
				}
			});
		},
		init: function() {
			this.element.attr('aria-pressed', this.element.hasClass('active'));
			return this.on('click', (function(_this) {
				return function(e) {
					if(_this.element.is('a[href="#"]')) {
						e.preventDefault();
					}
					_this.toggle();
					return _this.trigger('change.clique.button', [_this.element.blur().hasClass('active')]);
				};
			})(this));
		},
		toggle: function() {
			this.element.toggleClass('active');
			return this.element.attr('aria-pressed', this.element.hasClass('active'));
		}
	});
});
