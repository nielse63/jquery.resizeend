(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-alert', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.alert requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	_c.component('alert', {
		defaults : {
			fade : true,
			duration : 400,
			trigger : '.close'
		},
		boot : function() {
			_c.$html.on('click.alert.clique', '[data-alert]', function(e) {
				var ele = _c.$(this);
				if(!ele.data('clique.data.alert')) {
					var obj = _c.alert(ele, _c.utils.options(ele.attr('data-alert')));
					if(_c.$(e.target).is(obj.options.trigger)) {
						e.preventDefault();
						obj.close();
					}
				}
			});
		},
		init : function() {
			this.on('click', this.options.trigger, (function(_this) {
				return function(e) {
					e.preventDefault();
					_this.close();
				};
			})(this));
		},
		close : function() {
			var element = this.trigger('willclose.clique.alert');
			var removeElement = (function(_this) {
				return function() {
					_this.trigger('didclose.clique.alert').remove();
				};
			})(this);

			// Fade out
			if(this.options.fade) {
				element.css({
					overflow : 'hidden',
					maxHeight : element.outerHeight()
				}).animate({
					height : 0,
					opacity : 0,
					paddingTop : 0,
					paddingBottom : 0,
					marginTop : 0,
					marginBottom : 0
				}, this.options.duration, removeElement);
			} else {
				return removeElement();
			}
		}
	});
});
