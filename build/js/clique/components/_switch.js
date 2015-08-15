(function(addon) {
	if (typeof define === 'function' && define.amd) {
		define('clique-switch', ['clique'], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error('Clique.switch requires Clique.core');
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	_c.component('switch', {
		defaults: {
			labels: {
				off: 'Off',
				on: 'On'
			}
		},
		boot: function() {
			_c.ready(function(context) {
				_c.$('[data-switch]', context).each(function() {
					var ele = _c.$(this);
					if (!ele.data('clique.data.switch')) {
						_c.switch(ele, _c.utils.options(ele.attr('data-switch')));
					}
				});
			});
		},
		init: function() {
			this.create(this.element);
			this.element.data('switch', this);
		},
		create: function(input) {
			if(typeof input === 'undefined') {
				input = this.element;
			}
			input.wrap('<div class="switch" />');
			var wrapper = this.wrapper = input.closest('.switch');
			wrapper.wrapInner('<div class="switch-container" />');
			var container = wrapper.children('.switch-container');
			var elementArray = ['<div class="switch-handle on"><label>' + this.options.labels.on + '</label></div>', '<div class="switch-label" />', '<div class="switch-handle off"><label>' + this.options.labels.off + '</label></div>'];
			var i = 0;
			while (i < elementArray.length) {
				container.append(elementArray[i]);
				i++;
			}
			this.set('state', input.is(':checked'));
			this.wrapper.on('click', function(_this) {
				return function() {
					_this.toggle(_this.element);
				};
			}(this));
			this.element.trigger('init.clique.switch');
		},
		destroy: function() {
			this.wrapper.find('.switch-handle, .switch-label').remove();
			this.element.unwrap().unwrap();
			this.element.removeData(['clique.data.switch', 'switch']);
		},
		toggle: function(input) {
			if(typeof input === 'undefined') {
				input = this.element;
			}
			input.trigger('willswitch.clique.switch');
			if(_c.support.transition) {
				this.wrapper.one(_c.support.transition.end, function(_this) {
					return function() {
						input.trigger('didswitch.clique.switch', [_this.state]);
					};
				}(this));
			}
			this.state === 'on' ? true : false;
			this.set('state', !this.state);
		},
		set: function(prop, val) {
			if(_c.utils.isString(val)) {
				if(val.toLowerCase() === 'on') {
					val = true;
				} else {
					val = false;
				}
			}
			this.state = val ? 'on' : 'off';
			this.wrapper.removeClass('on off');
			this.wrapper.addClass(this.state);
			this.element.prop('checked', val);
			return this.element.prop('on', val);
		}
	});
});
