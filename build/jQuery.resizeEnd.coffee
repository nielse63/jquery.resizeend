
( ($, window, document)->
	plugin = 'resizeEnd'
	defaults =
		delay : 250

	ResizeEnd = (element, options, callback)->
		if typeof options == 'function'
			callback = options
			options = {}
		callback = callback || null
		this.element = element
		this.settings = $.extend {}, defaults, options
		this._defaults = defaults
		this._name = plugin
		this._timeout = false
		this._callback = callback
		this.init()

	ResizeEnd.prototype =
		init : ()->
			_this = this
			$el = $(this.element)
			$el.on 'resize', ()->
				_this.initResize()
		getUTCDate : (d)->
			d = d || new Date()
			curdate = Date.UTC d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
			return curdate
		initResize : ()->
			_this = this
			_this.controlTime = _this.getUTCDate()
			if _this._timeout == false
				_this._timeout = true
				setTimeout ()->
					_this.runCallback _this
				, _this.settings.delay
		runCallback : (_this)->
			nowTime = _this.getUTCDate()
			if nowTime - _this.controlTime < _this.settings.delay
				setTimeout ()->
					_this.runCallback _this
				, _this.settings.delay
			else
				_this._timeout = false
				_this._callback()

	$.fn[ plugin ] = (options, callback)->
		this.each ()->
			if !$.data(this, 'plugin_' + plugin)
				$.data this, 'plugin_' + plugin, new ResizeEnd(this, options, callback)


) jQuery, window, document