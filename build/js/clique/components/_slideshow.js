(function(addon) {
	var component;
	if(window.Clique) {
		component = addon(Clique);
	}
	if(typeof define === "function" && define.amd) {
		define("clique-slideshow", ["clique"], function() {
			return component || addon(Clique);
		});
	}
})(function(_c) {

	var Animations,
		playerId = 0;

	_c.component("slideshow", {
		defaults: {
			animation: "fade",
			duration: 500,
			height: "auto",
			start: 0,
			autoplay: false,
			autoplayInterval: 7e3,
			videoautoplay: true,
			videomute: true,
			kenburns: false,
			slices: 15,
			pauseOnHover: true
		},
		current: false,
		interval: null,
		hovering: false,

		boot: function() {
			_c.ready(function(context) {
				_c.$("[data-slideshow]", context).each(function() {
					var ele = _c.$(this);
					if(!ele.data("clique.data.slideshow")) {
						var obj = _c.slideshow(ele, _c.utils.options(ele.attr("data-slideshow")));
					}
				});
			});
		},
		init: function() {
			var $this = this,
				canvas,
				kbanimduration;

			this.container = this.element.hasClass("slideshow") ? this.element : _c.$(this.find(".slideshow"));
			this.slides = this.container.children();
			this.slidesCount = this.slides.length;
			this.current = this.options.start;
			this.animating = false;
			this.triggers = this.find("[data-slideshow-item]");
			this.fixFullscreen = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && this.container.hasClass("slideshow-fullscreen");
			if(this.options.kenburns) {
				kbanimduration = this.options.kenburns === true ? "15s" : this.options.kenburns;
				if(!String(kbanimduration).match(/(ms|s)$/)) {
					kbanimduration += "ms";
				}
			}

			this.slides.each(function(_this) {
				return function(index) {
					var slide = _c.$(this),
						media = slide.children("img, video, iframe").eq(0);

					slide.data("media", media);
					slide.data("sizer", media);
					if(media.length) {
						var placeholder;

						switch(media[0].nodeName) {
							case "IMG":
								var cover = _c.$('<div class="cover-background position-cover"></div>').css({
									"background-image": "url(" + media.attr("src") + ")"
								});
								media.css({
									width: "100%",
									height: "auto"
								});
								slide.prepend(cover).data("cover", cover);
								break;

							case "IFRAME":
								var src = media[0].src,
									iframeId = "sw-" + ++playerId;
								media
									.attr("src", "")
									.on("load", function() {
										if(index !== _this.current || index === _this.current && !_this.options.videoautoplay) {
											_this.pausemedia(media);
										}
										if(_this.options.videomute) {
											_this.mutemedia(media);
											var inv = setInterval(function(ic) {
												return function() {
													_this.mutemedia(media);
													if(++ic >= 4) {
														clearInterval(inv);
													}
												};
											}(0), 250);
										}
									})
									.data("slideshow", _this)
									.attr({
										'data-player-id' : iframeId,
										src : [src, src.indexOf('?') > -1 ? '&' : '?', 'enablejsapi=1&api=1&player_id=' + iframeId].join('')
									})
									// .attr("data-player-id", iframeId)
									// .attr("src", [src, src.indexOf("?") > -1 ? "&" : "?", "enablejsapi=1&api=1&player_id=" + iframeId].join(""))
									.addClass("position-absolute");
								if(!_c.support.touch) {
									media.css("pointer-events", "none");
								}
								placeholder = true;
								if(_c.cover) {
									_c.cover(media);
									media.attr("data-cover", "{}");
								}
								break;

							case "VIDEO":
								media.addClass("cover-object position-absolute");
								placeholder = true;
								if(_this.options.videomute) {
									_this.mutemedia(media);
								}
						}
						if(placeholder) {
							canvas = _c.$("<canvas></canvas>").attr({
								width: media[0].width,
								height: media[0].height
							});
							var img = _c.$('<img style="width:100%;height:auto;">').attr("src", canvas[0].toDataURL());
							slide.prepend(img);
							slide.data("sizer", img);
						}
					} else {
						slide.data("sizer", slide);
					}
					if(_this.hasKenBurns(slide)) {
						slide.data("cover").css({
							"-webkit-animation-duration": kbanimduration,
							"animation-duration": kbanimduration
						});
					}
				};
			}(this));
			this.on("click.clique.slideshow", "[data-slideshow-item]", function(_this) {
				return function(e) {
					e.preventDefault();
					var slide = _c.$(this).attr("data-slideshow-item");
					if(_this.current === slide) {
						return;
					}
					switch(slide) {
						case "next":
						case "previous":
							_this[slide === "next" ? "next" : "previous"]();
							break;

						default:
							_this.show(parseInt(slide, 10));
							break;
					}
					_this.stop();
				};
			}(this));
			this.slides.attr("aria-hidden", "true").eq(this.current).addClass("active").attr("aria-hidden", "false");
			this.triggers.filter('[data-slideshow-item="' + this.current + '"]').addClass("active");
			_c.$win.on("resize load", _c.utils.debounce(function(_this) {
				return function() {
					_this.resize();
					if(_this.fixFullscreen) {
						_this.container.css("height", window.innerHeight);
						_this.slides.css("height", window.innerHeight);
					}
				};
			}(this), 100));
			setTimeout(function(_this) {
				return function() {
					_this.resize();
				};
			}(this), 80);
			if(this.options.autoplay) {
				this.start();
			}
			if(this.options.videoautoplay && this.slides.eq(this.current).data("media")) {
				this.playmedia(this.slides.eq(this.current).data("media"));
			}
			if(this.options.kenburns) {
				this.applyKenBurns(this.slides.eq(this.current));
			}
			this.container.on({
				mouseenter: function(_this) {
					return function() {
						if(_this.options.pauseOnHover) {
							_this.hovering = true;
						}
					};
				}(this),
				mouseleave: function(_this) {
					return function() {
						_this.hovering = false;
					};
				}(this)
			});
			this.on("swipeRight swipeLeft", function(_this) {
				return function(e) {
					_this[e.type === "swipeLeft" ? "next" : "previous"]();
				};
			}(this));
			this.on("display.clique.check", function(_this) {
				return function() {
					if(_this.element.is(":visible")) {
						_this.resize();
						if(_this.fixFullscreen) {
							_this.container.css("height", window.innerHeight);
							_this.slides.css("height", window.innerHeight);
						}
					}
				};
			}(this));
		},
		resize: function() {
			if(this.container.hasClass("slideshow-fullscreen")) {
				return;
			}
			var $this = this,
				height = this.options.height;
			if(this.options.height === "auto") {
				height = 0;
				this.slides.css("height", "").each(function() {
					height = Math.max(height, _c.$(this).height());
				});
			}
			this.container.css("height", height);
			this.slides.css("height", height);
		},
		show: function(index, direction) {
			if(this.animating || this.current === index) {
				return;
			}
			this.animating = true;
			var $this = this,
				current = this.slides.eq(this.current),
				next = this.slides.eq(index),
				dir = direction ? direction : this.current < index ? -1 : 1,
				currentmedia = current.data("media"),
				animation = Animations[this.options.animation] ? this.options.animation : "fade",
				nextmedia = next.data("media"),
				finalize = function(_this) {
					return function() {
						if(!_this.animating) {
							return;
						}
						if(currentmedia && currentmedia.is("video,iframe")) {
							_this.pausemedia(currentmedia);
						}
						if(nextmedia && nextmedia.is("video,iframe")) {
							_this.playmedia(nextmedia);
						}
						next.addClass("active").attr("aria-hidden", "false");
						current.removeClass("active").attr("aria-hidden", "true");
						_this.animating = false;
						_this.current = index;
						_c.utils.checkDisplay(next, '[class*="animation-"]:not(.cover-background.position-cover)');
						_this.trigger("show.clique.slideshow", [next]);
					};
				}(this);
			this.applyKenBurns(next);
			if(!_c.support.animation) {
				animation = "none";
			}
			current = _c.$(current);
			next = _c.$(next);
			Animations[animation].apply(this, [current, next, dir]).then(finalize);
			this.triggers.removeClass("active");
			this.triggers.filter('[data-slideshow-item="' + index + '"]').addClass("active");
		},
		applyKenBurns: function(slide) {
			if(!this.hasKenBurns(slide)) {
				return;
			}
			var animations = ["animation-middle-left", "animation-top-right", "animation-bottom-left", "animation-top-center", "", "animation-bottom-right"],
				index = this.kbindex || 0;
			slide.data("cover").attr("class", "cover-background position-cover").width();
			slide.data("cover").addClass(["animation-scale", "animation-reverse", animations[index]].join(" "));
			this.kbindex = animations[index + 1] ? index + 1 : 0;
		},
		hasKenBurns: function(slide) {
			return this.options.kenburns && slide.data("cover");
		},
		next: function() {
			this.show(this.slides[this.current + 1] ? this.current + 1 : 0);
		},
		previous: function() {
			this.show(this.slides[this.current - 1] ? this.current - 1 : this.slides.length - 1);
		},
		start: function() {
			this.stop();
			var $this = this;
			this.interval = setInterval(function(_this) {
				return function() {
					if(!_this.hovering) {
						_this.next();
					}
				};
			}(this), this.options.autoplayInterval);
		},
		stop: function() {
			if(this.interval) {
				clearInterval(this.interval);
			}
		},
		playmedia: function(media) {
			if(!(media && media[0])) {
				return;
			}
			switch(media[0].nodeName) {
				case "VIDEO":
					if(!this.options.videomute) {
						media[0].muted = false;
					}
					media[0].play();
					break;

				case "IFRAME":
					if(!this.options.videomute) {
						media[0].contentWindow.postMessage('{ "event": "command", "func": "unmute", "method":"setVolume", "value":1}', "*");
					}
					media[0].contentWindow.postMessage('{ "event": "command", "func": "playVideo", "method":"play"}', "*");
					break;
			}
		},
		pausemedia: function(media) {
			switch(media[0].nodeName) {
				case "VIDEO":
					media[0].pause();
					break;

				case "IFRAME":
					media[0].contentWindow.postMessage('{ "event": "command", "func": "pauseVideo", "method":"pause"}', "*");
					break;
			}
		},
		mutemedia: function(media) {
			switch(media[0].nodeName) {
				case "VIDEO":
					media[0].muted = true;
					break;

				case "IFRAME":
					media[0].contentWindow.postMessage('{ "event": "command", "func": "mute", "method":"setVolume", "value":0}', "*");
					break;
			}
		}
	});

	Animations = {
		none: function() {
			var d = _c.$.Deferred();
			d.resolve();
			return d.promise();
		},
		scroll: function(current, next, dir) {
			var d = _c.$.Deferred();
			current.css("animation-duration", this.options.duration + "ms");
			next.css("animation-duration", this.options.duration + "ms");
			next.css("opacity", 1).one(_c.support.animation.end, function() {
				current.removeClass(dir === 1 ? "slideshow-scroll-backward-out" : "slideshow-scroll-forward-out");
				next.css("opacity", "").removeClass(dir === 1 ? "slideshow-scroll-backward-in" : "slideshow-scroll-forward-in");
				d.resolve();
			}.bind(this));
			current.addClass(dir === 1 ? "slideshow-scroll-backward-out" : "slideshow-scroll-forward-out");
			next.addClass(dir === 1 ? "slideshow-scroll-backward-in" : "slideshow-scroll-forward-in");
			next.width();
			return d.promise();
		},
		swipe: function(current, next, dir) {
			var d = _c.$.Deferred();
			current.css("animation-duration", this.options.duration + "ms");
			next.css("animation-duration", this.options.duration + "ms");
			next.css("opacity", 1).one(_c.support.animation.end, function() {
				current.removeClass(dir === 1 ? "slideshow-swipe-backward-out" : "slideshow-swipe-forward-out");
				next.css("opacity", "").removeClass(dir === 1 ? "slideshow-swipe-backward-in" : "slideshow-swipe-forward-in");
				d.resolve();
			}.bind(this));
			current.addClass(dir === 1 ? "slideshow-swipe-backward-out" : "slideshow-swipe-forward-out");
			next.addClass(dir === 1 ? "slideshow-swipe-backward-in" : "slideshow-swipe-forward-in");
			next.width();
			return d.promise();
		},
		scale: function(current, next, dir) {
			var d = _c.$.Deferred();
			current.css("animation-duration", this.options.duration + "ms");
			next.css("animation-duration", this.options.duration + "ms");
			next.css("opacity", 1);
			current.one(_c.support.animation.end, function() {
				current.removeClass("slideshow-scale-out");
				next.css("opacity", "");
				d.resolve();
			}.bind(this));
			current.addClass("slideshow-scale-out");
			current.width();
			return d.promise();
		},
		fade: function(current, next, dir) {
			var d = _c.$.Deferred();
			current.css("animation-duration", this.options.duration + "ms");
			next.css("animation-duration", this.options.duration + "ms");
			next.css("opacity", 1);
			current.one(_c.support.animation.end, function() {
				current.removeClass("slideshow-fade-out");
				next.css("opacity", "");
				d.resolve();
			}.bind(this));
			current.addClass("slideshow-fade-out");
			current.width();
			return d.promise();
		}
	};

	_c.slideshow.animations = Animations;
	window.addEventListener("message", function onMessageReceived(e) {
		var data = e.data;
		if(_c.utils.isString(data)) {
			try {
				data = JSON.parse(data);
			} catch(err) {
				data = {};
			}
		}
		if(e.origin && e.origin.indexOf("vimeo") > -1 && data.event === "ready" && data.player_id) {
			var iframe = _c.$('[data-player-id="' + data.player_id + '"]');
			if(iframe.length) {
				iframe.data("slideshow").mutemedia(iframe);
			}
		}
	}, false);
});
