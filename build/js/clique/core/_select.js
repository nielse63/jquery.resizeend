(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-select', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.select requires Clique.core');
	}
	if(!window.Clique.dropdown) {
		throw new Error('Clique.select requires the Clique.dropdown component');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	_c.component('select', {
		defaults: {
			inheritClasses: true
		},
		boot: function() {
			return _c.ready(function(context) {
				_c.$('[data-select]').each(function() {
					var ele = _c.$(this);
					if(!ele.is('select')) {
						ele.find('select').each(function() {
							var _ele = _c.$(this);
							if(!_ele.data('clique.data.select')) {
								_c.select(_ele);
							}
						});
					} else {
						if(!ele.data('clique.data.select')) {
							_c.select(ele);
						}
					}
				});
			});
		},
		init: function() {
			this.element.on('clique.select.change', (function(_this) {
				return function(e, idx, obj) {
					_this.updateSelect(idx, obj);
				};
			})(this));
			this.selectOptions = [];
			this.element.children('option').each(function(_this) {
				return function() {
					_this.selectOptions.push({
						text: _c.$(this).text(),
						value: _c.$(this).val(),
						selected : _c.$(this).is(':selected')
					});
				};
			}(this));
			this.template();
			this.bindSelect();
			setTimeout(function(_this) {
				return function() {
					_c.$.each(_this.selectOptions, function(i, obj) {
						if(i > 0 && obj.selected) {
							_this.updateSelect(i, obj);
							return false;
						}
					});
				};
			}(this), 0);
			// return setTimeout(function(_this) {
			// 	return function() {
			// 		console.log('here');
			// 		_this.dropdown = _c.dropdown(this.select, {
			// 			mode : 'click'
			// 		});
			// 		_this.select.find('.nav-dropdown li:first-child a').trigger('click');
			// 	};
			// }(this), 0);
		},
		template: function() {
			var cls = [];
			if(this.options.inheritClasses && this.element.attr('class')) {
				var classes = this.element.attr('class').split(' ');
				for (var i = 0; i < classes.length; i++) {
					cls.push(classes[i]);
				};
			}
			cls.push('select');
			var width = this.element.outerWidth() < 60 ? 60 : this.element.outerWidth();
			this.select = _c.$('<div class="' + cls.join(' ') + '" style="min-width:' + width + 'px;" />');
			this.select
				.append(_c.$('<a href="#" class="select-link">' + this.selectOptions[0].text + '</a>'))
				.append(_c.$('<div class="dropdown dropdown-scrollable"><ul class="nav nav-dropdown nav-side" /></div>'));
			this.element.val(this.selectOptions[0].value);
			this.selectOptions.forEach(function(_this) {
				return function(val) {
					_this.select.find('.nav-dropdown').append(_c.$('<li><a href="#">' + val.text + '</a></li>'));
				};
			}(this));
			this.element.before(this.select);
			this.element.hide();
			_c.dropdown(this.select, {
				mode : 'click'
			});
		},
		bindSelect: function() {
			this.select.on('click', '.nav-dropdown a', (function(_this) {
				return function(e) {
					e.preventDefault();
					var idx = _c.$(this).parent('li').index();
					var option = _this.selectOptions[idx];
					var obj = {
						value: option.value,
						text: option.text
					};
					_this.element.trigger('clique.select.change', [idx, obj]);
				};
			})(this));
		},
		updateSelect: function(idx, obj) {
			this.select.find('.nav-dropdown li').removeClass('active');
			var li = this.select.find('.nav-dropdown li').eq(idx);
			li.addClass('active');
			this.select.children('.select-link').text(obj.text);
			this.element.val(obj.value);
			this.trigger('change');
		}
	});
});
