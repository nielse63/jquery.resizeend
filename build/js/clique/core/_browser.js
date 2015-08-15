(function(addon) {
	if(typeof define === 'function' && define.amd) {
		define('clique-browser', ['clique'], function() {
			return addon(Clique);
		});
	}
	if(!window.Clique) {
		throw new Error('Clique.browser requires Clique.core');
	}
	if(window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var $ = _c.$;

	_c.browser = {
		engine : '',
		major : '',
		minor : '',
		name : '',
		patch : '',
		version : '',
		supports : function(prop) {
			var ele = _c.$doc[0].body || _c.$doc[0].documentElement;
			var vendors = 'Khtml Ms ms O Moz Webkit'.split(' ');
			var styles = ele.style;
			if(!_c.utils.isUndefined(styles[prop])) {
				return true;
			}
			prop = prop.replace(/^[a-z]/, function(val) {
				return val.toUpperCase();
			});
			for(var i = 0; i < vendors.length; i++) {
				var vendor = vendors[i];
				if(!_c.utils.isUndefined(styles[vendor + prop])) {
					return true;
				}
			};
			return false;
		}
	};

	_c.component('browserProxy', {
		defaults: {
			addClasses: true,
			detectDevice: true,
			detectScreen: true,
			detectOS: true,
			detectBrowser: true,
			detectLanguage: true,
			detectPlugins: true,
			detectSupport: ['flex', 'animation']
		},
		device: {
			type: '',
			model: '',
			orientation: ''
		},
		screen: {
			size: '',
			touch: false
		},
		deviceTypes: ['tv', 'tablet', 'mobile', 'desktop'],
		screens: {
			mini: 0,
			small: 480,
			medium: 768,
			large: 960,
			xlarge: 1220
		},
		browserLanguage: {
			direction: '',
			code: ''
		},
		boot: function() {
			return _c.ready(function() {
				var ele = _c.$doc;
				if(!ele.data('clique.data.browserProxy')) {
					_c.browserProxy(ele);
				}
			});
		},
		init: function() {
			this.getProperties();
			return _c.$win.on('resize orientationchange', _c.utils.debounce((function(_this) {
				return function() {
					return _this.getProperties();
				};
			})(this), 250));
		},
		getProperties: function() {
			var win = _c.$win[0];
			this.userAgent = (win.navigator.userAgent || win.navigator.vendor || win.opera).toLowerCase();
			if(!!this.options.detectDevice) {
				this.detectDevice();
			}
			if(!!this.options.detectScreen) {
				this.detectScreen();
			}
			if(!!this.options.detectOS) {
				this.detectOS();
			}
			if(!!this.options.detectBrowser) {
				this.detectBrowser();
			}
			if(!!this.options.detectPlugins) {
				this.detectPlugins();
			}
			if(!!this.options.detectLanguage) {
				this.detectLanguage();
			}
			if(!!this.options.detectSupport) {
				this.detectSupport();
			}
			if(this.options.addClasses) {
				this.addClasses();
			}
			setTimeout((function(_this) {
				return function() {
					_this.trigger('updated.browser.clique');
				};
			})(this), 0);
		},
		test: function(rgx) {
			return rgx.test(this.userAgent);
		},
		exec: function(rgx) {
			return rgx.exec(this.userAgent);
		},
		uamatches: function(key) {
			return this.userAgent.indexOf(key) > -1;
		},
		version: function(versionType, versionFull) {
			versionType.version = versionFull;
			var versionArray = versionFull.split('.');
			if(versionArray.length > 0) {
				versionArray = versionArray.reverse();
				versionType.major = versionArray.pop();
				if(versionArray.length > 0) {
					versionType.minor = versionArray.pop();
					if(versionArray.length > 0) {
						versionArray = versionArray.reverse();
						versionType.patch = versionArray.join('.');
					} else {
						versionType.patch = '0';
					}
				} else {
					versionType.minor = '0';
				}
			} else {
				versionType.major = '0';
			}
		},
		detectDevice: function() {
			var device = this.device;
			if(this.test(/googletv|smarttv|smart-tv|internet.tv|netcast|nettv|appletv|boxee|kylo|roku|dlnadoc|roku|pov_tv|hbbtv|ce\-html/)) {
				device.type = this.deviceTypes[0];
				device.model = 'smarttv';
			} else if(this.test(/xbox|playstation.3|wii/)) {
				device.type = this.deviceTypes[0];
				device.model = 'console';
			} else if(this.test(/ip(a|ro)d/)) {
				device.type = this.deviceTypes[1];
				device.model = 'ipad';
			} else if((this.test(/tablet/) && !this.test(/rx-34/)) || this.test(/folio/)) {
				device.type = this.deviceTypes[1];
				device.model = String(this.exec(/playbook/) || '');
			} else if(this.test(/linux/) && this.test(/android/) && !this.test(/fennec|mobi|htc.magic|htcX06ht|nexus.one|sc-02b|fone.945/)) {
				device.type = this.deviceTypes[1];
				device.model = 'android';
			} else if(this.test(/kindle/) || (this.test(/mac.os/) && this.test(/silk/))) {
				device.type = this.deviceTypes[1];
				device.model = 'kindle';
			} else if(this.test(/gt-p10|sc-01c|shw-m180s|sgh-t849|sch-i800|shw-m180l|sph-p100|sgh-i987|zt180|htc(.flyer|\_flyer)|sprint.atp51|viewpad7|pandigital(sprnova|nova)|ideos.s7|dell.streak.7|advent.vega|a101it|a70bht|mid7015|next2|nook/) || (this.test(/mb511/) && this.test(/rutem/))) {
				device.type = this.deviceTypes[1];
				device.model = 'android';
			} else if(this.test(/bb10/)) {
				device.type = this.deviceTypes[1];
				device.model = 'blackberry';
			} else {
				device.model = this.exec(/iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec|j2me/);
				if(device.model !== null) {
					device.type = this.deviceTypes[2];
					device.model = String(device.model);
				} else {
					device.model = '';
					if(this.test(/bolt|fennec|iris|maemo|minimo|mobi|mowser|netfront|novarra|prism|rx-34|skyfire|tear|xv6875|xv6975|google.wireless.transcoder/)) {
						device.type = this.deviceTypes[2];
					} else if(this.test(/opera/) && this.test(/windows.nt.5/) && this.test(/htc|xda|mini|vario|samsung\-gt\-i8000|samsung\-sgh\-i9/)) {
						device.type = this.deviceTypes[2];
					} else if((this.test(/windows.(nt|xp|me|9)/) && !this.test(/phone/)) || this.test(/win(9|.9|nt)/) || this.test(/\(windows 8\)/)) {
						device.type = this.deviceTypes[3];
					} else if(this.test(/macintosh|powerpc/) && !this.test(/silk/)) {
						device.type = this.deviceTypes[3];
						device.model = 'mac';
					} else if(this.test(/linux/) && this.test(/x11/)) {
						device.type = this.deviceTypes[3];
					} else if(this.test(/solaris|sunos|bsd/)) {
						device.type = this.deviceTypes[3];
					} else if(this.test(/cros/)) {
						device.type = this.deviceTypes[3];
					} else if(this.test(/bot|crawler|spider|yahoo|ia_archiver|covario-ids|findlinks|dataparksearch|larbin|mediapartners-google|ng-search|snappy|teoma|jeeves|tineye/) && !this.test(/mobile/)) {
						device.type = this.deviceTypes[3];
						device.model = 'crawler';
					} else {
						device.type = this.deviceTypes[3];
					}
				}
			}
			if(device.type !== 'desktop' && device.type !== 'tv') {
				var w = _c.$win.outerWidth();
				var h = _c.$win.outerHeight();
				device.orientation = 'landscape';
				if(h > w) {
					device.orientation = 'portrait';
				}
			}
			this.device = device;
		},
		detectScreen: function() {
			var w = _c.$win.width();
			for(var k in this.screens) {
				var v = this.screens[k];
				if(w > (v - 1)) {
					this.screen.size = k;
				}
			}
			this.detectTouch();
		},
		detectTouch: function() {
			var win = _c.$win[0];
			var doc = _c.$doc[0];
			var touch = 'ontouchstart' in win && win.navigator.userAgent.toLowerCase().match(/mobile|tablet/) || win.DocumentTouch && doc instanceof win.DocumentTouch || win.navigator.msPointerEnabled && win.navigator.msMaxTouchPoints > 0 || win.navigator.pointerEnabled && win.navigator.maxTouchPoints > 0 || false;
			this.screen.touch = !!touch;
		},
		detectOS: function() {
			var device = this.device;
			var os = {};
			if(device.model !== '') {
				if(device.model === 'ipad' || device.model === 'iphone' || device.model === 'ipod') {
					os.name = 'ios';
					this.version(os, (this.test(/os\s([\d_]+)/) ? RegExp.$1 : '').replace(/_/g, '.'));
				} else if(device.model === 'android') {
					os.name = 'android';
					this.version(os, (this.test(/android\s([\d\.]+)/) ? RegExp.$1 : ''));
				} else if(device.model === 'blackberry') {
					os.name = 'blackberry';
					this.version(os, (this.test(/version\/([^\s]+)/) ? RegExp.$1 : ''));
				} else if(device.model === 'playbook') {
					os.name = 'blackberry';
					this.version(os, (this.test(/os ([^\s]+)/) ? RegExp.$1.replace(';', '') : ''));
				}
			}
			if(!os.name) {
				if(this.uamatches('win') || this.uamatches('16bit')) {
					os.name = 'windows';
					if(this.uamatches('windows nt 6.3')) {
						this.version(os, '8.1');
					} else if(this.uamatches('windows nt 6.2') || this.test(/\(windows 8\)/)) {
						this.version(os, '8');
					} else if(this.uamatches('windows nt 6.1')) {
						this.version(os, '7');
					} else if(this.uamatches('windows nt 6.0')) {
						this.version(os, 'vista');
					} else if(this.uamatches('windows nt 5.2') || this.uamatches('windows nt 5.1') || this.uamatches('windows xp')) {
						this.version(os, 'xp');
					} else if(this.uamatches('windows nt 5.0') || this.uamatches('windows 2000')) {
						this.version(os, '2k');
					} else if(this.uamatches('winnt') || this.uamatches('windows nt')) {
						this.version(os, 'nt');
					} else if(this.uamatches('win98') || this.uamatches('windows 98')) {
						this.version(os, '98');
					} else {
						if(this.uamatches('win95') || this.uamatches('windows 95')) {
							this.version(os, '95');
						}
					}
				} else if(this.uamatches('mac') || this.uamatches('darwin')) {
					os.name = 'mac os';
					if(this.uamatches('68k') || this.uamatches('68000')) {
						this.version(os, '68k');
					} else if(this.uamatches('ppc') || this.uamatches('powerpc')) {
						this.version(os, 'ppc');
					} else {
						if(this.uamatches('os x')) {
							this.version(os, (this.test(/os\sx\s([\d_]+)/) ? RegExp.$1 : 'os x').replace(/_/g, '.'));
						}
					}
				} else if(this.uamatches('webtv')) {
					os.name = 'webtv';
				} else if(this.uamatches('x11') || this.uamatches('inux')) {
					os.name = 'linux';
				} else if(this.uamatches('sunos')) {
					os.name = 'sun';
				} else if(this.uamatches('irix')) {
					os.name = 'irix';
				} else if(this.uamatches('freebsd')) {
					os.name = 'freebsd';
				} else {
					if(this.uamatches('bsd')) {
						os.name = 'bsd';
					}
				}
			}
			if(this.test(/\sx64|\sx86|\swin64|\swow64|\samd64/)) {
				os.addressRegisterSize = '64bit';
			} else {
				os.addressRegisterSize = '32bit';
			}
			this.operatingSystem = os;
		},
		detectBrowser: function() {
			var browser = {};
			if(!this.test(/opera|webtv/) && (this.test(/msie\s([\d\w\.]+)/) || this.uamatches('trident'))) {
				browser.engine = 'trident';
				browser.name = 'ie';
				if(!window.addEventListener && document.documentMode && document.documentMode === 7) {
					this.version(browser, '8.compat');
				} else if(this.test(/trident.*rv[ :](\d+)\./)) {
					this.version(browser, RegExp.$1);
				} else {
					this.version(browser, (this.test(/trident\/4\.0/) ? '8' : RegExp.$1));
				}
			} else if(this.uamatches('firefox')) {
				browser.engine = 'gecko';
				browser.name = 'firefox';
				this.version(browser, (this.test(/firefox\/([\d\w\.]+)/) ? RegExp.$1 : ''));
			} else if(this.uamatches('gecko/')) {
				browser.engine = 'gecko';
			} else if(this.uamatches('opera') || this.uamatches('opr')) {
				browser.name = 'opera';
				browser.engine = 'presto';
				this.version(browser, (this.test(/version\/([\d\.]+)/) ? RegExp.$1 : (this.test(/opera(\s|\/)([\d\.]+)/) ? RegExp.$2 : '')));
			} else if(this.uamatches('konqueror')) {
				browser.name = 'konqueror';
			} else if(this.uamatches('chrome')) {
				browser.engine = 'webkit';
				browser.name = 'chrome';
				this.version(browser, (this.test(/chrome\/([\d\.]+)/) ? RegExp.$1 : ''));
			} else if(this.uamatches('iron')) {
				browser.engine = 'webkit';
				browser.name = 'iron';
			} else if(this.uamatches('crios')) {
				browser.name = 'chrome';
				browser.engine = 'webkit';
				this.version(browser, (this.test(/crios\/([\d\.]+)/) ? RegExp.$1 : ''));
			} else if(this.uamatches('applewebkit/')) {
				browser.name = 'safari';
				browser.engine = 'webkit';
				this.version(browser, (this.test(/version\/([\d\.]+)/) ? RegExp.$1 : ''));
			} else if(this.uamatches('mozilla/')) {
				browser.engine = 'gecko';
			}
			_c.browser = _c.$.extend({}, _c.browser, browser);
		},
		detectLanguage: function() {
			var body = _c.$body[0];
			var win = _c.$win[0];
			this.browserLanguage.direction = win.getComputedStyle(body).direction || 'ltr';
			this.browserLanguage.code = win.navigator.userLanguage || win.navigator.language;
		},
		detectPlugins: function() {
			this.plugins = [];
			if(typeof window.navigator.plugins !== 'undefined') {
				var _ref = window.navigator.plugins;
				var _results = [];
				for(var _i = 0, _len = _ref.length; _i < _len; _i++) {
					var plugin = _ref[_i];
					_results.push(this.plugins.push(plugin.name));
				}
				return _results;
			}
		},
		detectSupport: function() {
			var supports = (function() {
				var div = _c.$doc[0].createElement('div');
				var vendors = 'Khtml Ms ms O Moz Webkit'.split(' ');
				return function(prop) {
					if(typeof div.style[prop] !== 'undefined') {
						return true;
					}
					prop = prop.replace(/^[a-z]/, function(val) {
						return val.toUpperCase();
					});
					for(var _i = 0, _len = vendors.length; _i < _len; _i++) {
						var vendor = vendors[_i];
						if(typeof div.style[vendor + prop] !== 'undefined') {
							return true;
						}
					}
					return false;
				};
			})();
			if(!this.css) {
				this.css = {};
			}
			var _ref = this.options.detectSupport;
			for(var _i = 0, _len = _ref.length; _i < _len; _i++) {
				var check = _ref[_i];
				this.css[check] = supports(check);
				return;
			}
		},
		addClasses: function() {
			this.removeClasses();
			if(_c.browser.name) {
				var nameClass = _c.browser.name;
				if(nameClass === 'ie') {
					nameClass += ' ie' + _c.browser.major;
				}
				this.classes.push(nameClass);
				_c.$html.addClass(nameClass);
			}
			if(this.device.type) {
				var typeClass = this.device.type;
				this.classes.push(typeClass);
				_c.$html.addClass(typeClass);
			}
			if(this.device.model) {
				var modelClass = this.device.model;
				this.classes.push(modelClass);
				_c.$html.addClass(modelClass);
			}
			if(this.device.orientation) {
				var orientationClass = this.device.orientation;
				this.classes.push(orientationClass);
				_c.$html.addClass(orientationClass);
			}
			if(this.screen.size) {
				var sizeClass = "screen-" + this.screen.size;
				this.classes.push(sizeClass);
				_c.$html.addClass(sizeClass);
			}

			var _ref = this.css;
			for(var k in _ref) {
				var v = _ref[k];
				if(!v) {
					var supportClass = "no" + k;
					this.classes.push(supportClass);
					_c.$html.addClass(supportClass);
				}
			}

			var touchClass = this.screen.touch ? 'touch' : 'notouch';
			this.classes.push(touchClass);
			_c.$html.addClass(touchClass);
			if(this.browserLanguage.direction) {
				_c.$html.attr('dir', this.browserLanguage.direction);
			}
			if(this.browserLanguage.code) {
				return _c.$html.attr('lang', this.browserLanguage.code);
			}
		},
		removeClasses: function() {
			if(!this.classes) {
				this.classes = [];
			}
			$.each(this.classes, function(idx, selector) {
				return _c.$html.removeClass(selector);
			});
			this.classes = [];
		}
	});
});
