(function(addon) {
	if (typeof define === 'function' && define.amd) {
		define('clique-lightbox', ['clique'], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error('Clique.lightbox requires Clique.core');
	}
	if (!window.Clique.modal) {
		throw new Error('Clique.lightbox requires Clique.modal');
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	var modal = null;
	var cache = {};
	var getModal = function(lightbox) {
		if (modal) {
			modal.lightbox = lightbox;
			return modal;
		}
		modal = _c.$([
			'<div class="modal">',
				'<div class="modal-dialog modal-dialog-lightbox slidenav-position" style="margin-left:auto;margin-right:auto;width:200px;height:200px;top:' + Math.abs(window.innerHeight / 2 - 200) + 'px;">',
					'<a href="#" class="modal-close close close-alt"></a>',
					'<div class="lightbox-content"></div>',
					'<div class="modal-spinner hidden"></div>',
				'</div>',
			'</div>'
		].join('')).appendTo('body');
		modal.dialog = modal.find('.modal-dialog:first');
		modal.content = modal.find('.lightbox-content:first');
		modal.loader = modal.find('.modal-spinner:first');
		modal.closer = modal.find('.close.close-alt');
		modal.modal = _c.modal(modal);

		modal.on('swipeRight swipeLeft', function(e) {
			return modal.lightbox[(e.type === 'swipeLeft' ? 'next' : 'previous')]();
		}).on('click', '[data-lightbox-previous], [data-lightbox-next]', function(e) {
			e.preventDefault();
			return modal.lightbox[(_c.$(this).is('[data-lightbox-next]') ? 'next' : 'previous')]();
		});

		modal.on('hide.clique.modal', function() {
			return modal.content.html('');
		});

		_c.$win.on('load resize orientationchange', _c.utils.debounce(function() {
			if (modal.is(':visible')) {
				return modal.lightbox.fitSize();
			}
		}, 100));

		modal.lightbox = lightbox;
		return modal;
	};

	_c.component('lightbox', {
		defaults: {
			group: false,
			duration: 400,
			keyboard: true
		},
		index: 0,
		items: false,
		boot: function() {
			_c.$html.on('click', '[data-lightbox]', function(e) {
				e.preventDefault();
				var link = _c.$(this);
				if (!link.data('clique.data.lightbox')) {
					_c.lightbox(link, _c.utils.options(link.attr('data-lightbox')));
				}
				return link.data('clique.data.lightbox').show(link);
			});
			return _c.$doc.on('keyup', function(e) {
				if (modal && modal.is(':visible') && modal.lightbox.options.keyboard) {
					e.preventDefault();
					switch (e.keyCode) {
						case 37 :
							return modal.lightbox.previous();
						case 39 :
							return modal.lightbox.next();
					}
				}
			});
		},
		init: function() {
			var siblings = [];
			this.index = 0;
			this.siblings = [];
			if (this.element && this.element.length) {
				var domSiblings = (this.options.group ? _c.$(['[data-lightbox*="' + this.options.group + '"]', '[data-lightbox*=\'' + this.options.group + '\']'].join(',')) : this.element);
				domSiblings.each(function() {
					var ele = _c.$(this);
					return siblings.push({
						source: ele.attr('href'),
						title: ele.attr('title'),
						type: ele.attr('data-lightbox-type') || 'auto',
						link: ele
					});
				});
				this.index = domSiblings.index(this.element);
				this.siblings = siblings;
			} else {
				if (this.options.group && this.options.group.length) {
					this.siblings = this.options.group;
				}
			}
			return this.trigger('lightbox-init', [this]);
		},
		show: function(index, callback) {
			index = index || 0;

			this.modal = getModal(this);
			this.modal.dialog.stop();
			this.modal.content.stop();

			var $this = this;

			if (typeof index === 'object') {
				this.siblings.forEach(function(s, idx) {
					if (index[0] === s.link[0]) {
						index = idx;
					}
				});
			}
			if (index < 0) {
				index = this.siblings.length - index;
			} else {
				if (!this.siblings[index]) {
					index = 0;
				}
			}
			var item = this.siblings[index];
			this.data = {
				lightbox: $this,
				source: item.source,
				type: item.type,
				index: index,
				promise: _c.$.Deferred(),
				title: item.title,
				item: item,
				meta: {
					content: '',
					width: null,
					height: null
				}
			};
			this.index = index;
			this.modal.content.empty();
			if (!this.modal.is(':visible')) {
				this.modal.content.css({
					width: '',
					height: ''
				}).empty();
				this.modal.modal.show();
			}
			this.modal.loader.removeClass('hidden');
			this.data.promise.done(function(_this) {
				return function() {
					_this.fitSize();
				};
			}(this)).fail(function() {
				console.error('Failed to load resource');
			});
			$this.trigger('showitem.clique.lightbox', [this.data]);
			// $this.modal.trigger('show.clique.lightbox', [this.data]);
			if(callback && typeof callback === 'function') {
				callback();
			}
		},
		fitSize: function() {
			var dh, t;
			var $this = this;
			var data = this.data;
			var pad = this.modal.dialog.outerWidth() - this.modal.dialog.width();
			var dpadTop = parseInt(this.modal.dialog.css('margin-top'), 10);
			var dpadBot = parseInt(this.modal.dialog.css('margin-bottom'), 10);
			var dpad = dpadTop + dpadBot;
			var content = data.meta.content;
			var duration = this.options.duration;

			if (this.siblings.length > 1) {
				content = [content, '<a href="#" class="slidenav slidenav-contrast slidenav-previous hidden-touch" data-lightbox-previous></a>', '<a href="#" class="slidenav slidenav-contrast slidenav-next hidden-touch" data-lightbox-next></a>'].join('');
			}
			var tmp = _c.$('<div>&nbsp;</div>').css({
				opacity : 0,
				position : 'absolute',
				top : 0,
				left : 0,
				width : '100%',
				'max-width' : this.modal.dialog.css('max-width'),
				padding : this.modal.dialog.css('padding'),
				margin : this.modal.dialog.css('margin')
			});
			var maxwidth = null;
			var maxheight = null;
			var w = data.meta.width;
			var h = data.meta.height;
			tmp.appendTo('body').width();
			maxwidth = tmp.width();
			maxheight = window.innerHeight - dpad;
			tmp.remove();
			this.modal.dialog.find('.modal-caption').remove();
			if (data.title) {
				this.modal.dialog.append('<div class="modal-caption">' + data.title + '</div>');
				maxheight -= this.modal.dialog.find('.modal-caption').outerHeight();
			}
			if (maxwidth < data.meta.width) {
				h = Math.floor(h * (maxwidth / w));
				w = maxwidth;
			}
			if (maxheight < h) {
				h = Math.floor(maxheight);
				w = Math.ceil(data.meta.width * (maxheight / data.meta.height));
			}
			this.modal.content.css('opacity', 0).width(w).html(content);
			if (data.type === 'iframe') {
				this.modal.content.find('iframe:first').height(h);
			}
			dh = h + pad;
			t = Math.floor(window.innerHeight / 2 - dh / 2) - dpad;
			if (t < 0) {
				t = 0;
			}
			this.modal.closer.addClass('hidden');
			if ($this.modal.data('mwidth') === w && $this.modal.data('mheight') === h) {
				duration = 0;
			}
			return this.modal.dialog.animate({
				width : w + pad,
				height : h + pad,
				top : t
			}, duration, 'swing', function() {
				$this.modal.loader.addClass('hidden');
				$this.modal.content.css({
					width : '',
					opacity : 1
				});
				$this.modal.closer.removeClass('hidden');
				$this.modal.data({
					mwidth : w,
					mheight : h
				});
			});
		},
		next: function() {
			return this.show((this.siblings[this.index + 1] ? this.index + 1 : 0));
		},
		previous: function() {
			return this.show((this.siblings[this.index - 1] ? this.index - 1 : this.siblings.length - 1));
		}
	});

	_c.plugin('lightbox', 'image', {
		init: function(lightbox) {
			return lightbox.on('showitem.clique.lightbox', function(e, data) {
				var resolve;
				if (data.type === 'image' || data.source && data.source.match(/\.(jpg|jpeg|png|gif|svg)/)) {
					resolve = function(source, width, height) {
						data.meta = {
							content: '<img class="responsive-width" width="' + width + '" height="' + height + '" src ="' + source + '">',
							width: width,
							height: height
						};
						data.type = 'image';
						return data.promise.resolve();
					};
					if (!cache[data.source]) {
						var img = new Image();
						img.onerror = function() {
							return data.promise.reject('Loading image failed');
						};
						img.onload = function() {
							cache[data.source] = {
								width: img.width,
								height: img.height
							};
							return resolve(data.source, cache[data.source].width, cache[data.source].height);
						};
						img.src = data.source;
					} else {
						return resolve(data.source, cache[data.source].width, cache[data.source].height);
					}
				}
			});
		}
	});
	_c.plugin('lightbox', 'youtube', {
		init: function(lightbox) {
			var youtubeRegExp, youtubeRegExpShort;
			youtubeRegExp = /(\/\/.*?youtube\.[a-z]+)\/watch\?v=([^&]+)&?(.*)/;
			youtubeRegExpShort = /youtu\.be\/(.*)/;
			return lightbox.on('showitem.clique.lightbox', function(e, data) {
				var id, img, matches, resolve;
				id = null;
				matches = null;
				resolve = function(id, width, height) {
					data.meta = {
						content: '<iframe src="//www.youtube.com/embed/' + id + '" width="' + width + '" height="' + height + '" style="max-width:100%;"></iframe>',
						width: width,
						height: height
					};
					data.type = 'iframe';
					return data.promise.resolve();
				};
				matches = data.source.match(youtubeRegExp);
				if (matches) {
					id = matches[2];
				}
				if (matches) {
					id = matches[1];
				}
				if (id) {
					if (!cache[id]) {
						img = new Image();
						img.onerror = function() {
							cache[id] = {
								width: 640,
								height: 320
							};
							return resolve(id, cache[id].width, cache[id].height);
						};
						img.onload = function() {
							cache[id] = {
								width: img.width,
								height: img.height
							};
							return resolve(id, img.width, img.height);
						};
						img.src = '//img.youtube.com/vi/' + id + '/0.jpg';
					} else {
						resolve(id, cache[id].width, cache[id].height);
					}
					return e.stopImmediatePropagation();
				}
			});
		}
	});
	_c.plugin('lightbox', 'vimeo', {
		init: function(lightbox) {
			var regex = /(\/\/.*?)vimeo\.[a-z]+\/([0-9]+).*?/;
			var matches = null;
			return lightbox.on('showitem.clique.lightbox', function(e, data) {
				function resolve(id, width, height) {
					data.meta = {
						content: '<iframe src="//player.vimeo.com/video/' + id + '" width="' + width + '" height="' + height + '" style="width:100%;box-sizing:border-box;"></iframe>',
						width: width,
						height: height
					};
					data.type = 'iframe';
					return data.promise.resolve();
				}
				matches = data.source.match(regex);
				if (matches) {
					var id = matches[2];
					if (!cache[id]) {
						_c.$.ajax({
							type: 'GET',
							url: 'http://vimeo.com/api/oembed.json?url=' + encodeURI(data.source),
							jsonp: 'callback',
							dataType: 'jsonp',
							success: function(data) {
								cache[id] = {
									width: data.width,
									height: data.height
								};
								return resolve(id, cache[id].width, cache[id].height);
							}
						});
					} else {
						resolve(id, cache[id].width, cache[id].height);
					}
					return e.stopImmediatePropagation();
				}
			});
		}
	});
	_c.plugin('lightbox', 'video', {
		init: function(lightbox) {
			return lightbox.on('showitem.clique.lightbox', function(e, data) {
				var idle, resolve, vid;
				resolve = function(source, width, height) {
					data.meta = {
						content: '<video class="responsive-width" src="' + source + '" width="' + width + '" height="' + height + '" controls></video>',
						width: width,
						height: height
					};
					data.type = 'video';
					return data.promise.resolve();
				};
				if (data.type === 'video' || data.source.match(/\.(mp4|webm|ogv)$/)) {
					if (!cache[data.source]) {
						vid = _c.$('<video style="position:fixed;visibility:hidden;top:-10000px;"></video>').attr('src', data.source).appendTo('body');
						idle = setInterval(function() {
							if (vid[0].videoWidth) {
								clearInterval(idle);
								cache[data.source] = {
									width: vid[0].videoWidth,
									height: vid[0].videoHeight
								};
								resolve(data.source, cache[data.source].width, cache[data.source].height);
								return vid.remove();
							}
						}, 20);
					} else {
						return resolve(data.source, cache[data.source].width, cache[data.source].height);
					}
				}
			});
		}
	});

	return _c.lightbox.create = function(items, options) {
		if (!items) {
			return;
		}
		var group = [];
		var o = null;
		items.forEach(function(item) {
			return group.push(_c.$.extend({
				source: '',
				title: '',
				type: 'auto',
				link: false
			}, (typeof item === 'string' ? {
				source: item
			} : item)));
		});
		o = _c.lightbox(_c.$.extend({}, options, {
			group: group
		}));
		return o;
	};
});
