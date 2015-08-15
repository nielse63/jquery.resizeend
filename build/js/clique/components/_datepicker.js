(function(addon) {
	if (typeof define === "function" && define.amd) {
		define("clique-datepicker", [ "clique" ], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error("Clique.datepicker requires Clique.core");
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	// form-select component
	_c.component('formSelect', {
		defaults: {
			target: '> span:first'
		},
		boot: function() {
			return _c.ready(function(context) {
				return _c.$('[data-form-select]', context).each(function() {
					var ele, obj;
					ele = _c.$(this);
					if (!ele.data('clique.data.formSelect')) {
						obj = _c.formSelect(ele, _c.utils.options(ele.attr('data-form-select')));
					}
				});
			});
		},
		init: function() {
			this.target = this.find(this.options.target);
			this.select = this.find('select');
			this.select.on('change', (function(_this) {
				return function() {
					var fn, select;
					select = _this.select[0];
					fn = function() {
						try {
							this.target.text(select.options[select.selectedIndex].text);
						} catch (_error) {}
						return fn;
					};
					return fn();
				};
			})(this)());
			return this.element.data('formSelect', this);
		}
	});

	// global vars
	var active = false;
	var dropdown,
		initialScrollPos,
		initialTopPos,
		lastFired = _c.utils.now();

	// global functions
	function repositionScroll() {
		if (!active) {
			return;
		}
		var now = _c.utils.now();
		if (lastFired > now - 15) {
			return;
		}
		lastFired = now;
		var modal = _c.$(".modal.open");
		var offset = initialScrollPos - modal.scrollTop() + initialTopPos;
		dropdown.css("top", offset);
	}

	_c.component("datepicker", {
		defaults: {
			mobile: false,
			weekstart: 1,
			i18n: {
				months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
				weekdays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]
			},
			format: "MM/DD/YYYY",
			offsettop: 5,
			maxDate: false,
			minDate: false,
			template: function(data, opts) {
				var cls,
					currentyear,
					d,
					day,
					maxYear,
					minYear,
					months,
					options,
					years;
				var content = "";
				var maxDate = null;
				var minDate = null;
				var i = null;
				if (opts.maxDate !== false) {
					maxDate = isNaN(opts.maxDate) ? moment(opts.maxDate, opts.format) : moment().add(opts.maxDate, "days");
				}
				if (opts.minDate !== false) {
					minDate = isNaN(opts.minDate) ? moment(opts.minDate, opts.format) : moment().add(opts.minDate - 1, "days");
				}
				content += '<div class="datepicker-nav">';
				content += '<a href="" class="datepicker-previous"></a>';
				content += '<a href="" class="datepicker-next"></a>';
				if (_c.formSelect) {
					currentyear = new Date().getFullYear();
					options = [];
					months = null;
					years = null;
					minYear = null;
					maxYear = null;
					i = 0;
					while (i < opts.i18n.months.length) {
						if (i === data.month) {
							options.push('<option value="' + i + '" selected>' + opts.i18n.months[i] + "</option>");
						} else {
							options.push('<option value="' + i + '">' + opts.i18n.months[i] + "</option>");
						}
						i++;
					}
					months = '<span class="form-select">' + opts.i18n.months[data.month] + '<select class="update-picker-month">' + options.join("") + "</select></span>";
					options = [];
					minYear = minDate ? minDate.year() : currentyear - 50;
					maxYear = maxDate ? maxDate.year() : currentyear + 20;
					i = minYear;
					while (i <= maxYear) {
						if (i === data.year) {
							options.push('<option value="' + i + '" selected>' + i + "</option>");
						} else {
							options.push('<option value="' + i + '">' + i + "</option>");
						}
						i++;
					}
					years = '<span class="form-select">' + data.year + '<select class="update-picker-year">' + options.join("") + "</select></span>";
					content += '<div class="datepicker-heading">' + months + " " + years + "</div>";
				} else {
					content += '<div class="datepicker-heading">' + opts.i18n.months[data.month] + " " + data.year + "</div>";
				}
				content += "</div>";
				content += '<table class="datepicker-table">';
				content += "<thead>";
				i = 0;
				while (i < data.weekdays.length) {
					if (data.weekdays[i]) {
						content += "<th>" + data.weekdays[i] + "</th>";
					}
					i++;
				}
				content += "</thead>";
				content += "<tbody>";
				i = 0;
				while (i < data.days.length) {
					if (data.days[i] && data.days[i].length) {
						content += "<tr>";
						d = 0;
						while (d < data.days[i].length) {
							if (data.days[i][d]) {
								day = data.days[i][d];
								cls = [];
								if (!day.inmonth) {
									cls.push("datepicker-table-muted");
								}
								if (day.selected) {
									cls.push("active");
								}
								if (maxDate && day.day > maxDate) {
									cls.push("datepicker-date-disabled datepicker-table-muted");
								}
								if (minDate && minDate > day.day) {
									cls.push("datepicker-date-disabled datepicker-table-muted");
								}
								content += '<td><a href="" class="' + cls.join(" ") + '" data-date="' + day.day.format() + '">' + day.day.format("D") + "</a></td>";
							}
							d++;
						}
						content += "</tr>";
					}
					i++;
				}
				content += "</tbody>";
				content += "</table>";
				return content;
			}
		},
		boot: function() {
			_c.$win.on("resize orientationchange", function() {
				if (active) {
					return active.hide();
				}
			});
			_c.$html.on("focus.datepicker.clique", "[data-datepicker]", function(e) {
				var ele = _c.$(this);
				if (!ele.data("clique.data.datepicker")) {
					e.preventDefault();
					_c.datepicker(ele, _c.utils.options(ele.attr("data-datepicker")));
					return ele.trigger("focus");
				}
			});
			_c.$html.on("click.datepicker.clique", function(e) {
				var target = _c.$(e.target);
				if (!!active && target[0] !== dropdown[0] && target.data("datepicker") === undefined && !target.parents(".datepicker:first").length) {
					return active.hide();
				}
			});
		},
		init: function() {
			if (_c.support.touch && this.element.attr("type") === "date" && !this.options.mobile) {
				return;
			}
			var $this = this;
			this.current = this.element.val() ? moment(this.element.val(), this.options.format) : moment();
			this.on({
				click: function() {
					if (active !== $this) {
						return $this.pick(this.value);
					}
				},
				change: function() {
					if ($this.element.val() && !moment($this.element.val(), $this.options.format).isValid()) {
						return $this.element.val(moment().format($this.options.format));
					}
				}
			});
			if (!dropdown) {
				dropdown = _c.$('<div class="dropdown datepicker"></div>');
				dropdown.on("click", ".datepicker-next, .datepicker-previous, [data-date]", function(e) {
					e.stopPropagation();
					e.preventDefault();
					var ele = _c.$(this);
					if (ele.hasClass("datepicker-date-disabled")) {
						return false;
					}
					if (ele.is("[data-date]")) {
						active.element.val(moment(ele.data("date")).format(active.options.format)).trigger("change");
						dropdown.hide();
						active = false;
					} else {
						return active.add(1 * (ele.hasClass("datepicker-next") ? 1 : -1), "months");
					}
				});
				dropdown.on("change", ".update-picker-month, .update-picker-year", function() {
					var select;
					select = _c.$(this);
					return active[select.is(".update-picker-year") ? "setYear" : "setMonth"](Number(select.val()));
				});
				return dropdown.appendTo("body");
			}
		},
		pick: function(initdate) {
			var offset = this.element.offset();
			var top = offset.top + this.element.outerHeight() + this.options.offsettop;
			var css = {
				top: top,
				left: offset.left,
				right: ""
			};
			this.current = initdate ? moment(initdate, this.options.format) : moment();
			this.initdate = this.current.format("YYYY-MM-DD");
			this.update();
			if (_c.langdirection === "right") {
				css.right = window.innerWidth - (css.left + this.element.outerWidth());
				css.left = "";
			}
			dropdown.css(css).show();
			this.trigger("show.clique.datepicker");
			active = this;
			if (_c.$html.hasClass("modal-page")) {
				initialScrollPos = _c.$(".modal.open").scrollTop();
				initialTopPos = top;
				_c.$(".modal.open").on("scroll", repositionScroll);
			}
		},
		add: function(unit, value) {
			this.current.add(unit, value);
			return this.update();
		},
		setMonth: function(month) {
			this.current.month(month);
			return this.update();
		},
		setYear: function(year) {
			this.current.year(year);
			return this.update();
		},
		update: function() {
			var data = this.getRows(this.current.year(), this.current.month());
			var tpl = this.options.template(data, this.options);
			dropdown.html(tpl);
			return this.trigger("update.clique.datepicker");
		},
		getRows: function(year, month) {
			var i;
			var opts = this.options;
			var now = moment().format("YYYY-MM-DD");
			var days = [ 31, year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][month];
			var before = new Date(year, month, 1).getDay();
			var data = {
				month: month,
				year: year,
				weekdays: [],
				days: []
			};
			var row = [];
			data.weekdays = function() {
				i = 0;
				var arr = [];
				while (i < 7) {
					var day = i + (opts.weekstart || 0);
					while (day >= 7) {
						day -= 7;
					}
					arr.push(opts.i18n.weekdays[day]);
					i++;
				}
				return arr;
			}();
			if (opts.weekstart && opts.weekstart > 0) {
				before -= opts.weekstart;
				if (before < 0) {
					before += 7;
				}
			}
			var cells = days + before;
			var after = cells;
			while (after > 7) {
				after -= 7;
			}
			cells += 7 - after;
			var day = null;
			i = 0;
			var r = 0;
			while (i < cells) {
				day = new Date(year, month, 1 + (i - before));
				var isDisabled = opts.mindate && day < opts.mindate || opts.maxdate && day > opts.maxdate;
				var isInMonth = !(i < before || i >= days + before);
				day = moment(day);
				var isSelected = this.initdate === day.format("YYYY-MM-DD");
				var isToday = now === day.format("YYYY-MM-DD");
				row.push({
					selected: isSelected,
					today: isToday,
					disabled: isDisabled,
					day: day,
					inmonth: isInMonth
				});
				if (++r === 7) {
					data.days.push(row);
					row = [];
					r = 0;
				}
				i++;
			}
			return data;
		},
		hide: function() {
			if (active && active === this) {
				dropdown.hide();
				active = false;
				_c.$(".modal.open").off("scroll", repositionScroll);
				return this.trigger("hide.clique.datepicker");
			}
		}
	});

	var moment = function(undefined_) {
		var DATE,
			Duration,
			HOUR,
			Locale,
			MILLISECOND,
			MINUTE,
			MONTH,
			Moment,
			SECOND,
			VERSION,
			YEAR,
			absRound,
			addOrSubtractDurationFromMoment,
			addTimeToArrayFromToken,
			aspNetJsonRegex,
			aspNetTimeSpanJsonRegex,
			camelFunctions,
			checkOverflow,
			chooseLocale,
			compareArrays,
			copyConfig,
			createAdder,
			currentDateArray,
			dateFromConfig,
			dateFromObject,
			dayOfYearFromWeekInfo,
			dayOfYearFromWeeks,
			daysInMonth,
			daysInYear,
			daysToYears,
			defaultParsingFlags,
			deprecate,
			deprecateSimple,
			deprecations,
			dfl,
			expandFormat,
			extend,
			formatFunctions,
			formatMoment,
			formatTokenFunctions,
			formattingTokens,
			getParseRegexForToken,
			globalScope,
			hasModule,
			hasOwnProp,
			hasOwnProperty,
			i,
			isArray,
			isDate,
			isLeapYear,
			isValid,
			isoDates,
			isoDurationRegex,
			isoFormat,
			isoRegex,
			isoTimes,
			leftZeroFill,
			lists,
			loadLocale,
			localFormattingTokens,
			locales,
			makeAccessor,
			makeAs,
			makeDate,
			makeDateFromInput,
			makeDateFromString,
			makeDateFromStringAndArray,
			makeDateFromStringAndFormat,
			makeDurationGetter,
			akeFormatFunction,
			makeList,
			makeMoment,
			makeUTCDate,
			map,
			momentProperties,
			momentsDifference,
			normalizeLocale,
			normalizeObjectUnits,
			normalizeUnits,
			oldGlobalMoment,
			ordinalizeToken,
			ordinalizeTokens,
			padToken,
			paddedTokens,
			parseISO,
			parseTimezoneChunker,
			parseTokenDigits,
			parseTokenFourDigits,
			parseTokenOneDigit,
			parseTokenOneOrTwoDigits,
			parseTokenOneToFourDigits,
			parseTokenOneToSixDigits,
			parseTokenOneToThreeDigits,
			parseTokenOrdinal,
			parseTokenSignedNumber,
			parseTokenSixDigits,
			parseTokenT,
			parseTokenThreeDigits,
			parseTokenTimestampMs,
			parseTokenTimezone,
			parseTokenTwoDigits,
			parseTokenWord,
			parseWeekday,
			pickBy,
			positiveMomentsDifference,
			printMsg,
			proxyGettersAndSetters,
			rawGetter,
			rawMonthSetter,
			rawSetter,
			regexpEscape,
			relativeTime,
			relativeTimeThresholds,
			removeFormattingTokens,
			round,
			substituteTimeAgo,
			timezoneMinutesFromString,
			toInt,
			unescapeFormat,
			unitAliases,
			unitMillisecondFactors,
			weekOfYear,
			weeksInYear,
			yearsToDays;

		dfl = function(a, b, c) {
			switch (arguments.length) {
				case 2:
					if (a != null) {
						return a;
					} else {
						return b;
					}
					break;

				case 3:
					if (a != null) {
						return a;
					} else {
						if (b != null) {
							return b;
						} else {
							return c;
						}
					}
					break;

				default:
					throw new Error("Implement me");
			}
		};
		hasOwnProp = function(a, b) {
			return hasOwnProperty.call(a, b);
		};
		defaultParsingFlags = function() {
			return {
				empty: false,
				unusedTokens: [],
				unusedInput: [],
				overflow: -2,
				charsLeftOver: 0,
				nullInput: false,
				invalidMonth: null,
				invalidFormat: false,
				userInvalidated: false,
				iso: false
			};
		};
		printMsg = function(msg) {
			if (moment.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
				return console.warn("Deprecation warning: " + msg);
			}
		};
		deprecate = function(msg, fn) {
			var firstTime;
			firstTime = true;
			return extend(function() {
				if (firstTime) {
					printMsg(msg);
					firstTime = false;
				}
				return fn.apply(this, arguments);
			}, fn);
		};
		deprecateSimple = function(name, msg) {
			if (!deprecations[name]) {
				printMsg(msg);
				deprecations[name] = true;
			}
		};
		padToken = function(func, count) {
			return function(a) {
				return leftZeroFill(func.call(this, a), count);
			};
		};
		ordinalizeToken = function(func, period) {
			return function(a) {
				return this.localeData().ordinal(func.call(this, a), period);
			};
		};
		Locale = function() {};
		Moment = function(config, skipOverflow) {
			if (skipOverflow !== false) {
				checkOverflow(config);
			}
			copyConfig(this, config);
			this._d = new Date(+config._d);
		};
		Duration = function(duration) {
			var days, hours, milliseconds, minutes, months, normalizedInput, quarters, seconds, weeks, years;
			normalizedInput = normalizeObjectUnits(duration);
			years = normalizedInput.year || 0;
			quarters = normalizedInput.quarter || 0;
			months = normalizedInput.month || 0;
			weeks = normalizedInput.week || 0;
			days = normalizedInput.day || 0;
			hours = normalizedInput.hour || 0;
			minutes = normalizedInput.minute || 0;
			seconds = normalizedInput.second || 0;
			milliseconds = normalizedInput.millisecond || 0;
			this._milliseconds = +milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
			this._days = +days + weeks * 7;
			this._months = +months + quarters * 3 + years * 12;
			this._data = {};
			this._locale = moment.localeData();
			return this._bubble();
		};
		extend = function(a, b) {
			var i;
			for (i in b) {
				if (hasOwnProp(b, i)) {
					a[i] = b[i];
				}
			}
			if (hasOwnProp(b, "toString")) {
				a.toString = b.toString;
			}
			if (hasOwnProp(b, "valueOf")) {
				a.valueOf = b.valueOf;
			}
			return a;
		};
		copyConfig = function(to, from) {
			var i, prop, val;
			i = null;
			prop = null;
			val = null;
			if (typeof from._isAMomentObject !== "undefined") {
				to._isAMomentObject = from._isAMomentObject;
			}
			if (typeof from._i !== "undefined") {
				to._i = from._i;
			}
			if (typeof from._f !== "undefined") {
				to._f = from._f;
			}
			if (typeof from._l !== "undefined") {
				to._l = from._l;
			}
			if (typeof from._strict !== "undefined") {
				to._strict = from._strict;
			}
			if (typeof from._tzm !== "undefined") {
				to._tzm = from._tzm;
			}
			if (typeof from._isUTC !== "undefined") {
				to._isUTC = from._isUTC;
			}
			if (typeof from._offset !== "undefined") {
				to._offset = from._offset;
			}
			if (typeof from._pf !== "undefined") {
				to._pf = from._pf;
			}
			if (typeof from._locale !== "undefined") {
				to._locale = from._locale;
			}
			if (momentProperties.length > 0) {
				for (i in momentProperties) {
					prop = momentProperties[i];
					val = from[prop];
					if (typeof val !== "undefined") {
						to[prop] = val;
					}
				}
			}
			return to;
		};
		absRound = function(number) {
			if (number < 0) {
				return Math.ceil(number);
			} else {
				return Math.floor(number);
			}
		};
		leftZeroFill = function(number, targetLength, forceSign) {
			var output, sign;
			output = "" + Math.abs(number);
			sign = number >= 0;
			while (output.length < targetLength) {
				output = "0" + output;
			}
			return (sign ? forceSign ? "+" : "" : "-") + output;
		};
		positiveMomentsDifference = function(base, other) {
			var res;
			res = {
				milliseconds: 0,
				months: 0
			};
			res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
			if (base.clone().add(res.months, "M").isAfter(other)) {
				--res.months;
			}
			res.milliseconds = +other - +base.clone().add(res.months, "M");
			return res;
		};
		momentsDifference = function(base, other) {
			var res;
			res = null;
			other = makeAs(other, base);
			if (base.isBefore(other)) {
				res = positiveMomentsDifference(base, other);
			} else {
				res = positiveMomentsDifference(other, base);
				res.milliseconds = -res.milliseconds;
				res.months = -res.months;
			}
			return res;
		};
		createAdder = function(direction, name) {
			return function(val, period) {
				var dur, tmp;
				dur = null;
				tmp = null;
				if (period !== null && !isNaN(+period)) {
					deprecateSimple(name, "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period).");
					tmp = val;
					val = period;
					period = tmp;
				}
				val = typeof val === "string" ? +val : val;
				dur = moment.duration(val, period);
				addOrSubtractDurationFromMoment(this, dur, direction);
				return this;
			};
		};
		addOrSubtractDurationFromMoment = function(mom, duration, isAdding, updateOffset) {
			var days, milliseconds, months;
			milliseconds = duration._milliseconds;
			days = duration._days;
			months = duration._months;
			updateOffset = updateOffset == null ? true : updateOffset;
			if (milliseconds) {
				mom._d.setTime(+mom._d + milliseconds * isAdding);
			}
			if (days) {
				rawSetter(mom, "Date", rawGetter(mom, "Date") + days * isAdding);
			}
			if (months) {
				rawMonthSetter(mom, rawGetter(mom, "Month") + months * isAdding);
			}
			if (updateOffset) {
				moment.updateOffset(mom, days || months);
			}
		};
		isArray = function(input) {
			return Object.prototype.toString.call(input) === "[object Array]";
		};
		isDate = function(input) {
			return Object.prototype.toString.call(input) === "[object Date]" || input instanceof Date;
		};
		compareArrays = function(array1, array2, dontConvert) {
			var diffs, i, len, lengthDiff;
			len = Math.min(array1.length, array2.length);
			lengthDiff = Math.abs(array1.length - array2.length);
			diffs = 0;
			i = null;
			i = 0;
			while (i < len) {
				if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
					diffs++;
				}
				i++;
			}
			return diffs + lengthDiff;
		};
		normalizeUnits = function(units) {
			var lowered;
			if (units) {
				lowered = units.toLowerCase().replace(/(.)s$/, "$1");
				units = unitAliases[units] || camelFunctions[lowered] || lowered;
			}
			return units;
		};
		normalizeObjectUnits = function(inputObject) {
			var normalizedInput, normalizedProp, prop;
			normalizedInput = {};
			normalizedProp = null;
			prop = null;
			for (prop in inputObject) {
				if (hasOwnProp(inputObject, prop)) {
					normalizedProp = normalizeUnits(prop);
					if (normalizedProp) {
						normalizedInput[normalizedProp] = inputObject[prop];
					}
				}
			}
			return normalizedInput;
		};
		makeList = function(field) {
			var count, setter;
			count = null;
			setter = null;
			if (field.indexOf("week") === 0) {
				count = 7;
				setter = "day";
			} else {
				if (field.indexOf("month") === 0) {
					count = 12;
					setter = "month";
				} else {
					return;
				}
			}
			moment[field] = function(format, index) {
				var getter, i, method, results;
				i = null;
				getter = null;
				method = moment._locale[field];
				results = [];
				if (typeof format === "number") {
					index = format;
					format = undefined;
				}
				getter = function(i) {
					var m;
					m = moment().utc().set(setter, i);
					return method.call(moment._locale, m, format || "");
				};
				if (index != null) {
					return getter(index);
				} else {
					i = 0;
					while (i < count) {
						results.push(getter(i));
						i++;
					}
					return results;
				}
			};
		};
		toInt = function(argumentForCoercion) {
			var coercedNumber, value;
			coercedNumber = +argumentForCoercion;
			value = 0;
			if (coercedNumber !== 0 && isFinite(coercedNumber)) {
				if (coercedNumber >= 0) {
					value = Math.floor(coercedNumber);
				} else {
					value = Math.ceil(coercedNumber);
				}
			}
			return value;
		};
		daysInMonth = function(year, month) {
			return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
		};
		weeksInYear = function(year, dow, doy) {
			return weekOfYear(moment([ year, 11, 31 + dow - doy ]), dow, doy).week;
		};
		daysInYear = function(year) {
			if (isLeapYear(year)) {
				return 366;
			} else {
				return 365;
			}
		};
		isLeapYear = function(year) {
			return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
		};
		checkOverflow = function(m) {
			var overflow;
			overflow = null;
			if (m._a && m._pf.overflow === -2) {
				overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
				if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
					overflow = DATE;
				}
				m._pf.overflow = overflow;
			}
		};
		isValid = function(m) {
			if (m._isValid == null) {
				m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
				if (m._strict) {
					m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
				}
			}
			return m._isValid;
		};
		normalizeLocale = function(key) {
			if (key) {
				return key.toLowerCase().replace("_", "-");
			} else {
				return key;
			}
		};
		chooseLocale = function(names) {
			var i, j, locale, next, split;
			i = 0;
			j = null;
			next = null;
			locale = null;
			split = null;
			while (i < names.length) {
				split = normalizeLocale(names[i]).split("-");
				j = split.length;
				next = normalizeLocale(names[i + 1]);
				next = next ? next.split("-") : null;
				while (j > 0) {
					locale = loadLocale(split.slice(0, j).join("-"));
					if (locale) {
						return locale;
					}
					if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
						break;
					}
					j--;
				}
				i++;
			}
			return null;
		};
		loadLocale = function(name) {
			var oldLocale;
			oldLocale = null;
			if (!locales[name] && hasModule) {
				try {
					oldLocale = moment.locale();
					require("./locale/" + name);
					moment.locale(oldLocale);
				} catch (_error) {}
			}
			return locales[name];
		};
		makeAs = function(input, model) {
			if (model._isUTC) {
				return moment(input).zone(model._offset || 0);
			} else {
				return moment(input).local();
			}
		};
		removeFormattingTokens = function(input) {
			if (input.match(/\[[\s\S]/)) {
				return input.replace(/^\[|\]$/g, "");
			}
			return input.replace(/\\/g, "");
		};
		makeFormatFunction = function(format) {
			var array, i, length;
			array = format.match(formattingTokens);
			i = null;
			length = null;
			i = 0;
			length = array.length;
			while (i < length) {
				if (formatTokenFunctions[array[i]]) {
					array[i] = formatTokenFunctions[array[i]];
				} else {
					array[i] = removeFormattingTokens(array[i]);
				}
				i++;
			}
			return function(mom) {
				var output;
				output = "";
				i = 0;
				while (i < length) {
					output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
					i++;
				}
				return output;
			};
		};
		formatMoment = function(m, format) {
			if (!m.isValid()) {
				return m.localeData().invalidDate();
			}
			format = expandFormat(format, m.localeData());
			if (!formatFunctions[format]) {
				formatFunctions[format] = makeFormatFunction(format);
			}
			return formatFunctions[format](m);
		};
		expandFormat = function(format, locale) {
			var i, replaceLongDateFormatTokens;
			replaceLongDateFormatTokens = function(input) {
				return locale.longDateFormat(input) || input;
			};
			i = 5;
			localFormattingTokens.lastIndex = 0;
			while (i >= 0 && localFormattingTokens.test(format)) {
				format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
				localFormattingTokens.lastIndex = 0;
				i -= 1;
			}
			return format;
		};
		getParseRegexForToken = function(token, config) {
			var a, strict;
			a = null;
			strict = config._strict;
			switch (token) {
				case "Q":
				return parseTokenOneDigit;

				case "DDDD":
				return parseTokenThreeDigits;

				case "YYYY":
				case "GGGG":
				case "gggg":
				if (strict) {
					return parseTokenFourDigits;
				} else {
					return parseTokenOneToFourDigits;
				}
				break;

				case "Y":
				case "G":
				case "g":
				return parseTokenSignedNumber;

				case "YYYYYY":
				case "YYYYY":
				case "GGGGG":
				case "ggggg":
				if (strict) {
					return parseTokenSixDigits;
				} else {
					return parseTokenOneToSixDigits;
				}
				break;

				case "S":
				if (strict) {
					return parseTokenOneDigit;
				}
				break;

				case "SS":
				if (strict) {
					return parseTokenTwoDigits;
				}
				break;

				case "SSS":
				if (strict) {
					return parseTokenThreeDigits;
				}
				break;

				case "DDD":
				return parseTokenOneToThreeDigits;

				case "MMM":
				case "MMMM":
				case "dd":
				case "ddd":
				case "dddd":
				return parseTokenWord;

				case "a":
				case "A":
				return config._locale._meridiemParse;

				case "X":
				return parseTokenTimestampMs;

				case "Z":
				case "ZZ":
				return parseTokenTimezone;

				case "T":
				return parseTokenT;

				case "SSSS":
				return parseTokenDigits;

				case "MM":
				case "DD":
				case "YY":
				case "GG":
				case "gg":
				case "HH":
				case "hh":
				case "mm":
				case "ss":
				case "ww":
				case "WW":
				if (strict) {
					return parseTokenTwoDigits;
				} else {
					return parseTokenOneOrTwoDigits;
				}
				break;

				case "M":
				case "D":
				case "d":
				case "H":
				case "h":
				case "m":
				case "s":
				case "w":
				case "W":
				case "e":
				case "E":
				return parseTokenOneOrTwoDigits;

				case "Do":
				return parseTokenOrdinal;

				default:
				a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
				return a;
			}
		};
		timezoneMinutesFromString = function(string) {
			var minutes, parts, possibleTzMatches, tzChunk;
			string = string || "";
			possibleTzMatches = string.match(parseTokenTimezone) || [];
			tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [];
			parts = (tzChunk + "").match(parseTimezoneChunker) || [ "-", 0, 0 ];
			minutes = +(parts[1] * 60) + toInt(parts[2]);
			if (parts[0] === "+") {
				return -minutes;
			} else {
				return minutes;
			}
		};
		addTimeToArrayFromToken = function(token, input, config) {
			var a, datePartArray;
			a = null;
			datePartArray = config._a;
			switch (token) {
				case "Q":
				if (input != null) {
					datePartArray[MONTH] = (toInt(input) - 1) * 3;
				}
				break;

				case "M":
				case "MM":
				if (input != null) {
					datePartArray[MONTH] = toInt(input) - 1;
				}
				break;

				case "MMM":
				case "MMMM":
				a = config._locale.monthsParse(input);
				if (a != null) {
					datePartArray[MONTH] = a;
				} else {
					config._pf.invalidMonth = input;
				}
				break;

				case "D":
				case "DD":
				if (input != null) {
					datePartArray[DATE] = toInt(input);
				}
				break;

				case "Do":
				if (input != null) {
					datePartArray[DATE] = toInt(parseInt(input, 10));
				}
				break;

				case "DDD":
				case "DDDD":
				if (input != null) {
					config._dayOfYear = toInt(input);
				}
				break;

				case "YY":
				datePartArray[YEAR] = moment.parseTwoDigitYear(input);
				break;

				case "YYYY":
				case "YYYYY":
				case "YYYYYY":
				datePartArray[YEAR] = toInt(input);
				break;

				case "a":
				case "A":
				config._isPm = config._locale.isPM(input);
				break;

				case "H":
				case "HH":
				case "h":
				case "hh":
				datePartArray[HOUR] = toInt(input);
				break;

				case "m":
				case "mm":
				datePartArray[MINUTE] = toInt(input);
				break;

				case "s":
				case "ss":
				datePartArray[SECOND] = toInt(input);
				break;

				case "S":
				case "SS":
				case "SSS":
				case "SSSS":
				datePartArray[MILLISECOND] = toInt(("0." + input) * 1e3);
				break;

				case "X":
				config._d = new Date(parseFloat(input) * 1e3);
				break;

				case "Z":
				case "ZZ":
				config._useUTC = true;
				config._tzm = timezoneMinutesFromString(input);
				break;

				case "dd":
				case "ddd":
				case "dddd":
				a = config._locale.weekdaysParse(input);
				if (a != null) {
					config._w = config._w || {};
					config._w.d = a;
					return;
				} else {
					config._pf.invalidWeekday = input;
				}
				break;

				case "w":
				case "ww":
				case "W":
				case "WW":
				case "d":
				case "e":
				case "E":
				token = token.substr(0, 1);
				break;

				case "gggg":
				case "GGGG":
				case "GGGGG":
				token = token.substr(0, 2);
				if (input) {
					config._w = config._w || {};
					config._w[token] = toInt(input);
				}
				break;

				case "gg":
				case "GG":
				config._w = config._w || {};
				config._w[token] = moment.parseTwoDigitYear(input);
			}
		};
		dayOfYearFromWeekInfo = function(config) {
			var dow, doy, temp, w, week, weekYear, weekday;
			w = null;
			weekYear = null;
			week = null;
			weekday = null;
			dow = null;
			doy = null;
			temp = null;
			w = config._w;
			if (w.GG != null || w.W != null || w.E != null) {
				dow = 1;
				doy = 4;
				weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
				week = dfl(w.W, 1);
				weekday = dfl(w.E, 1);
			} else {
				dow = config._locale._week.dow;
				doy = config._locale._week.doy;
				weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
				week = dfl(w.w, 1);
				if (w.d != null) {
					weekday = w.d;
					if (weekday < dow) {
						++week;
					}
				} else {
					if (w.e != null) {
						weekday = w.e + dow;
					} else {
						weekday = dow;
					}
				}
			}
			temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
			config._a[YEAR] = temp.year;
			config._dayOfYear = temp.dayOfYear;
		};
		dateFromConfig = function(config) {
			var currentDate, date, i, input, yearToUse;
			i = null;
			date = null;
			input = [];
			currentDate = null;
			yearToUse = null;
			if (config._d) {
				return;
			}
			currentDate = currentDateArray(config);
			if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
				dayOfYearFromWeekInfo(config);
			}
			if (config._dayOfYear) {
				yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);
				if (config._dayOfYear > daysInYear(yearToUse)) {
					config._pf._overflowDayOfYear = true;
				}
				date = makeUTCDate(yearToUse, 0, config._dayOfYear);
				config._a[MONTH] = date.getUTCMonth();
				config._a[DATE] = date.getUTCDate();
			}
			i = 0;
			while (i < 3 && config._a[i] == null) {
				config._a[i] = input[i] = currentDate[i];
				++i;
			}
			while (i < 7) {
				config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
				i++;
			}
			config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
			if (config._tzm != null) {
				config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
			}
		};
		dateFromObject = function(config) {
			var normalizedInput;
			normalizedInput = null;
			if (config._d) {
				return;
			}
			normalizedInput = normalizeObjectUnits(config._i);
			config._a = [ normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond ];
			dateFromConfig(config);
		};
		currentDateArray = function(config) {
			var now;
			now = new Date();
			if (config._useUTC) {
				return [ now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ];
			} else {
				return [ now.getFullYear(), now.getMonth(), now.getDate() ];
			}
		};
		makeDateFromStringAndFormat = function(config) {
			var i, parsedInput, skipped, string, stringLength, token, tokens, totalParsedInputLength;
			if (config._f === moment.ISO_8601) {
				parseISO(config);
				return;
			}
			config._a = [];
			config._pf.empty = true;
			string = "" + config._i;
			i = null;
			parsedInput = null;
			tokens = null;
			token = null;
			skipped = null;
			stringLength = string.length;
			totalParsedInputLength = 0;
			tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
			i = 0;
			while (i < tokens.length) {
				token = tokens[i];
				parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
				if (parsedInput) {
					skipped = string.substr(0, string.indexOf(parsedInput));
					if (skipped.length > 0) {
						config._pf.unusedInput.push(skipped);
					}
					string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
					totalParsedInputLength += parsedInput.length;
				}
				if (formatTokenFunctions[token]) {
					if (parsedInput) {
						config._pf.empty = false;
					} else {
						config._pf.unusedTokens.push(token);
					}
					addTimeToArrayFromToken(token, parsedInput, config);
				} else {
					if (config._strict && !parsedInput) {
						config._pf.unusedTokens.push(token);
					}
				}
				i++;
			}
			config._pf.charsLeftOver = stringLength - totalParsedInputLength;
			if (string.length > 0) {
				config._pf.unusedInput.push(string);
			}
			if (config._isPm && config._a[HOUR] < 12) {
				config._a[HOUR] += 12;
			}
			if (config._isPm === false && config._a[HOUR] === 12) {
				config._a[HOUR] = 0;
			}
			dateFromConfig(config);
			checkOverflow(config);
		};
		unescapeFormat = function(s) {
			return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
				return p1 || p2 || p3 || p4;
			});
		};
		regexpEscape = function(s) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		};
		makeDateFromStringAndArray = function(config) {
			var bestMoment, currentScore, i, scoreToBeat, tempConfig;
			tempConfig = null;
			bestMoment = null;
			scoreToBeat = null;
			i = null;
			currentScore = null;
			if (config._f.length === 0) {
				config._pf.invalidFormat = true;
				config._d = new Date(NaN);
				return;
			}
			i = 0;
			while (i < config._f.length) {
				currentScore = 0;
				tempConfig = copyConfig({}, config);
				if (config._useUTC != null) {
					tempConfig._useUTC = config._useUTC;
				}
				tempConfig._pf = defaultParsingFlags();
				tempConfig._f = config._f[i];
				makeDateFromStringAndFormat(tempConfig);
				if (!isValid(tempConfig)) {
					continue;
				}
				currentScore += tempConfig._pf.charsLeftOver;
				currentScore += tempConfig._pf.unusedTokens.length * 10;
				tempConfig._pf.score = currentScore;
				if (scoreToBeat == null || currentScore < scoreToBeat) {
					scoreToBeat = currentScore;
					bestMoment = tempConfig;
				}
				i++;
			}
			extend(config, bestMoment || tempConfig);
		};
		parseISO = function(config) {
			var i, l, match, string;
			i = null;
			l = null;
			string = config._i;
			match = isoRegex.exec(string);
			if (match) {
				config._pf.iso = true;
				i = 0;
				l = isoDates.length;
				while (i < l) {
					if (isoDates[i][1].exec(string)) {
						config._f = isoDates[i][0] + (match[6] || " ");
						break;
					}
					i++;
				}
				i = 0;
				l = isoTimes.length;
				while (i < l) {
					if (isoTimes[i][1].exec(string)) {
						config._f += isoTimes[i][0];
						break;
					}
					i++;
				}
				if (string.match(parseTokenTimezone)) {
					config._f += "Z";
				}
				makeDateFromStringAndFormat(config);
			} else {
				config._isValid = false;
			}
		};
		makeDateFromString = function(config) {
			parseISO(config);
			if (config._isValid === false) {
				delete config._isValid;
				moment.createFromInputFallback(config);
			}
		};
		map = function(arr, fn) {
			var i, res;
			res = [];
			i = null;
			i = 0;
			while (i < arr.length) {
				res.push(fn(arr[i], i));
				++i;
			}
			return res;
		};
		makeDateFromInput = function(config) {
			var input, matched;
			input = config._i;
			matched = null;
			if (input === undefined) {
				config._d = new Date();
			} else {
				if (isDate(input)) {
					config._d = new Date(+input);
				} else {
					if ((matched = aspNetJsonRegex.exec(input)) !== null) {
						config._d = new Date(+matched[1]);
					} else {
						if (typeof input === "string") {
							makeDateFromString(config);
						} else {
							if (isArray(input)) {
								config._a = map(input.slice(0), function(obj) {
									return parseInt(obj, 10);
								});
								dateFromConfig(config);
							} else {
								if (typeof input === "object") {
									dateFromObject(config);
								} else {
									if (typeof input === "number") {
										config._d = new Date(input);
									} else {
										moment.createFromInputFallback(config);
									}
								}
							}
						}
					}
				}
			}
		};
		makeDate = function(y, m, d, h, M, s, ms) {
			var date;
			date = new Date(y, m, d, h, M, s, ms);
			if (y < 1970) {
				date.setFullYear(y);
			}
			return date;
		};
		makeUTCDate = function(y) {
			var date;
			date = new Date(Date.UTC.apply(null, arguments));
			if (y < 1970) {
				date.setUTCFullYear(y);
			}
			return date;
		};
		parseWeekday = function(input, locale) {
			if (typeof input === "string") {
				if (!isNaN(input)) {
					input = parseInt(input, 10);
				} else {
					input = locale.weekdaysParse(input);
					if (typeof input !== "number") {
						return null;
					}
				}
			}
			return input;
		};
		substituteTimeAgo = function(string, number, withoutSuffix, isFuture, locale) {
			return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
		};
		relativeTime = function(posNegDuration, withoutSuffix, locale) {
			var args, days, duration, hours, minutes, months, seconds, years;
			duration = moment.duration(posNegDuration).abs();
			seconds = round(duration.as("s"));
			minutes = round(duration.as("m"));
			hours = round(duration.as("h"));
			days = round(duration.as("d"));
			months = round(duration.as("M"));
			years = round(duration.as("y"));
			args = seconds < relativeTimeThresholds.s && [ "s", seconds ] || minutes === 1 && [ "m" ] || minutes < relativeTimeThresholds.m && [ "mm", minutes ] || hours === 1 && [ "h" ] || hours < relativeTimeThresholds.h && [ "hh", hours ] || days === 1 && [ "d" ] || days < relativeTimeThresholds.d && [ "dd", days ] || months === 1 && [ "M" ] || months < relativeTimeThresholds.M && [ "MM", months ] || years === 1 && [ "y" ] || [ "yy", years ];
			args[2] = withoutSuffix;
			args[3] = +posNegDuration > 0;
			args[4] = locale;
			return substituteTimeAgo.apply({}, args);
		};
		weekOfYear = function(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
			var adjustedMoment, daysToDayOfWeek, end;
			end = firstDayOfWeekOfYear - firstDayOfWeek;
			daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();
			adjustedMoment = null;
			if (daysToDayOfWeek > end) {
				daysToDayOfWeek -= 7;
			}
			if (daysToDayOfWeek < end - 7) {
				daysToDayOfWeek += 7;
			}
			adjustedMoment = moment(mom).add(daysToDayOfWeek, "d")({
				week: Math.ceil(adjustedMoment.dayOfYear() / 7),
				year: adjustedMoment.year()
			});
		};
		dayOfYearFromWeeks = function(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
			var d, dayOfYear, daysToAdd;
			d = makeUTCDate(year, 0, 1).getUTCDay();
			daysToAdd = null;
			dayOfYear = null;
			d = d === 0 ? 7 : d;
			weekday = weekday != null ? weekday : firstDayOfWeek;
			daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
			dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
			return {
				year: dayOfYear > 0 ? year : year - 1,
				dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
			};
		};
		makeMoment = function(config) {
			var format, input;
			input = config._i;
			format = config._f;
			config._locale = config._locale || moment.localeData(config._l);
			if (input === null || format === undefined && input === "") {
				return moment.invalid({
					nullInput: true
				});
			}
			if (typeof input === "string") {
				config._i = input = config._locale.preparse(input);
			}
			if (moment.isMoment(input)) {
				return new Moment(input, true);
			} else {
				if (format) {
					if (isArray(format)) {
						makeDateFromStringAndArray(config);
					} else {
						makeDateFromStringAndFormat(config);
					}
				} else {
					makeDateFromInput(config);
				}
			}
			return new Moment(config);
		};
		pickBy = function(fn, moments) {
			var i, res;
			res = null;
			i = null;
			if (moments.length === 1 && isArray(moments[0])) {
				moments = moments[0];
			}
			if (!moments.length) {
				return moment();
			}
			res = moments[0];
			i = 1;
			while (i < moments.length) {
				if (moments[i][fn](res)) {
					res = moments[i];
				}
				++i;
			}
			return res;
		};
		rawMonthSetter = function(mom, value) {
			var dayOfMonth;
			dayOfMonth = null;
			if (typeof value === "string") {
				value = mom.localeData().monthsParse(value);
				if (typeof value !== "number") {
					return mom;
				}
			}
			dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
			mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](value, dayOfMonth);
			return mom;
		};
		rawGetter = function(mom, unit) {
			return mom._d["get" + (mom._isUTC ? "UTC" : "") + unit]();
		};
		rawSetter = function(mom, unit, value) {
			if (unit === "Month") {
				return rawMonthSetter(mom, value);
			} else {
				return mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value);
			}
		};
		makeAccessor = function(unit, keepTime) {
			return function(value) {
				if (value != null) {
					rawSetter(this, unit, value);
					moment.updateOffset(this, keepTime);
					return this;
				} else {
					return rawGetter(this, unit);
				}
			};
		};
		daysToYears = function(days) {
			return days * 400 / 146097;
		};
		yearsToDays = function(years) {
			return years * 146097 / 400;
		};
		makeDurationGetter = function(name) {
			moment.duration.fn[name] = function() {
				return this._data[name];
			};
		};

		moment = null;
		VERSION = "2.8.3";
		globalScope = typeof global !== "undefined" ? global : this;
		oldGlobalMoment = null;
		round = Math.round;
		hasOwnProperty = Object.prototype.hasOwnProperty;
		i = null;
		YEAR = 0;
		MONTH = 1;
		DATE = 2;
		HOUR = 3;
		MINUTE = 4;
		SECOND = 5;
		MILLISECOND = 6;
		locales = {};
		momentProperties = [];
		hasModule = typeof module !== "undefined" && module.exports;
		aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
		aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;
		isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
		formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g;
		localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g;
		parseTokenOneOrTwoDigits = /\d\d?/;
		parseTokenOneToThreeDigits = /\d{1,3}/;
		parseTokenOneToFourDigits = /\d{1,4}/;
		parseTokenOneToSixDigits = /[+\-]?\d{1,6}/;
		parseTokenDigits = /\d+/;
		parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
		parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/g;
		parseTokenT = /T/i;
		parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/;
		parseTokenOrdinal = /\d{1,2}/;
		parseTokenOneDigit = /\d/;
		parseTokenTwoDigits = /\d\d/;
		parseTokenThreeDigits = /\d{3}/;
		parseTokenFourDigits = /\d{4}/;
		parseTokenSixDigits = /[+-]?\d{6}/;
		parseTokenSignedNumber = /[+-]?\d+/;
		isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
		isoFormat = "YYYY-MM-DDTHH:mm:ssZ";
		isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/ ], [ "YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d{2}/ ], [ "YYYY-DDD", /\d{4}-\d{3}/ ] ];
		isoTimes = [ [ "HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ];
		parseTimezoneChunker = /([\+\-]|\d\d)/g;
		proxyGettersAndSetters = "Date|Hours|Minutes|Seconds|Milliseconds".split("|");
		unitMillisecondFactors = {
			Milliseconds: 1,
			Seconds: 1e3,
			Minutes: 6e4,
			Hours: 36e5,
			Days: 864e5,
			Months: 2592e6,
			Years: 31536e6
		};
		unitAliases = {
			ms: "millisecond",
			s: "second",
			m: "minute",
			h: "hour",
			d: "day",
			D: "date",
			w: "week",
			W: "isoWeek",
			M: "month",
			Q: "quarter",
			y: "year",
			DDD: "dayOfYear",
			e: "weekday",
			E: "isoWeekday",
			gg: "weekYear",
			GG: "isoWeekYear"
		};
		camelFunctions = {
			dayofyear: "dayOfYear",
			isoweekday: "isoWeekday",
			isoweek: "isoWeek",
			weekyear: "weekYear",
			isoweekyear: "isoWeekYear"
		};
		formatFunctions = {};
		relativeTimeThresholds = {
			s: 45,
			m: 45,
			h: 22,
			d: 26,
			M: 11
		};
		ordinalizeTokens = "DDD w W M D d".split(" ");
		paddedTokens = "M D H h m s w W".split(" ");
		formatTokenFunctions = {
			M: function() {
				return this.month() + 1;
			},
			MMM: function(format) {
				return this.localeData().monthsShort(this, format);
			},
			MMMM: function(format) {
				return this.localeData().months(this, format);
			},
			D: function() {
				return this.date();
			},
			DDD: function() {
				return this.dayOfYear();
			},
			d: function() {
				return this.day();
			},
			dd: function(format) {
				return this.localeData().weekdaysMin(this, format);
			},
			ddd: function(format) {
				return this.localeData().weekdaysShort(this, format);
			},
			dddd: function(format) {
				return this.localeData().weekdays(this, format);
			},
			w: function() {
				return this.week();
			},
			W: function() {
				return this.isoWeek();
			},
			YY: function() {
				return leftZeroFill(this.year() % 100, 2);
			},
			YYYY: function() {
				return leftZeroFill(this.year(), 4);
			},
			YYYYY: function() {
				return leftZeroFill(this.year(), 5);
			},
			YYYYYY: function() {
				var sign, y;
				y = this.year();
				sign = y >= 0 ? "+" : "-";
				return sign + leftZeroFill(Math.abs(y), 6);
			},
			gg: function() {
				return leftZeroFill(this.weekYear() % 100, 2);
			},
			gggg: function() {
				return leftZeroFill(this.weekYear(), 4);
			},
			ggggg: function() {
				return leftZeroFill(this.weekYear(), 5);
			},
			GG: function() {
				return leftZeroFill(this.isoWeekYear() % 100, 2);
			},
			GGGG: function() {
				return leftZeroFill(this.isoWeekYear(), 4);
			},
			GGGGG: function() {
				return leftZeroFill(this.isoWeekYear(), 5);
			},
			e: function() {
				return this.weekday();
			},
			E: function() {
				return this.isoWeekday();
			},
			a: function() {
				return this.localeData().meridiem(this.hours(), this.minutes(), true);
			},
			A: function() {
				return this.localeData().meridiem(this.hours(), this.minutes(), false);
			},
			H: function() {
				return this.hours();
			},
			h: function() {
				return this.hours() % 12 || 12;
			},
			m: function() {
				return this.minutes();
			},
			s: function() {
				return this.seconds();
			},
			S: function() {
				return toInt(this.milliseconds() / 100);
			},
			SS: function() {
				return leftZeroFill(toInt(this.milliseconds() / 10), 2);
			},
			SSS: function() {
				return leftZeroFill(this.milliseconds(), 3);
			},
			SSSS: function() {
				return leftZeroFill(this.milliseconds(), 3);
			},
			Z: function() {
				var a, b;
				a = -this.zone();
				b = "+";
				if (a < 0) {
					a = -a;
					b = "-";
				}
				return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
			},
			ZZ: function() {
				var a, b;
				a = -this.zone();
				b = "+";
				if (a < 0) {
					a = -a;
					b = "-";
				}
				return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
			},
			z: function() {
				return this.zoneAbbr();
			},
			zz: function() {
				return this.zoneName();
			},
			X: function() {
				return this.unix();
			},
			Q: function() {
				return this.quarter();
			}
		};
		deprecations = {};
		lists = [ "months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin" ];
		while (ordinalizeTokens.length) {
			i = ordinalizeTokens.pop();
			formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
		}
		while (paddedTokens.length) {
			i = paddedTokens.pop();
			formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
		}
		formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
		extend(Locale.prototype, {
			set: function(config) {
				var prop;
				prop = null;
				i = null;
				for (i in config) {
					prop = config[i];
					if (typeof prop === "function") {
						this[i] = prop;
					} else {
						this["_" + i] = prop;
					}
				}
			},
			_months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
			months: function(m) {
				return this._months[m.month()];
			},
			_monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
			monthsShort: function(m) {
				return this._monthsShort[m.month()];
			},
			monthsParse: function(monthName) {
				var mom, regex;
				i = null;
				mom = null;
				regex = null;
				if (!this._monthsParse) {
					this._monthsParse = [];
				}
				i = 0;
				while (i < 12) {
					if (!this._monthsParse[i]) {
						mom = moment.utc([ 2e3, i ]);
						regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
						this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
					}
					if (this._monthsParse[i].test(monthName)) {
						return i;
					}
					i++;
				}
			},
			_weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
			weekdays: function(m) {
				return this._weekdays[m.day()];
			},
			_weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
			weekdaysShort: function(m) {
				return this._weekdaysShort[m.day()];
			},
			_weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
			weekdaysMin: function(m) {
				return this._weekdaysMin[m.day()];
			},
			weekdaysParse: function(weekdayName) {
				var mom, regex;
				i = null;
				mom = null;
				regex = null;
				if (!this._weekdaysParse) {
					this._weekdaysParse = [];
				}
				i = 0;
				while (i < 7) {
					if (!this._weekdaysParse[i]) {
						mom = moment([ 2e3, 1 ]).day(i);
						regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
						this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
					}
					if (this._weekdaysParse[i].test(weekdayName)) {
						return i;
					}
					i++;
				}
			},
			_longDateFormat: {
				LT: "h:mm A",
				L: "MM/DD/YYYY",
				LL: "MMMM D, YYYY",
				LLL: "MMMM D, YYYY LT",
				LLLL: "dddd, MMMM D, YYYY LT"
			},
			longDateFormat: function(key) {
				var output;
				output = this._longDateFormat[key];
				if (!output && this._longDateFormat[key.toUpperCase()]) {
					output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
						return val.slice(1);
					});
					this._longDateFormat[key] = output;
				}
				return output;
			},
			isPM: function(input) {
				return (input + "").toLowerCase().charAt(0) === "p";
			},
			_meridiemParse: /[ap]\.?m?\.?/i,
			meridiem: function(hours, minutes, isLower) {
				if (hours > 11) {
					if (isLower) {
						return "pm";
					} else {
						return "PM";
					}
				} else {
					if (isLower) {
						return "am";
					} else {
						return "AM";
					}
				}
			},
			_calendar: {
				sameDay: "[Today at] LT",
				nextDay: "[Tomorrow at] LT",
				nextWeek: "dddd [at] LT",
				lastDay: "[Yesterday at] LT",
				lastWeek: "[Last] dddd [at] LT",
				sameElse: "L"
			},
			calendar: function(key, mom) {
				var output;
				output = this._calendar[key];
				if (typeof output === "function") {
					return output.apply(mom);
				} else {
					return output;
				}
			},
			_relativeTime: {
				future: "in %s",
				past: "%s ago",
				s: "a few seconds",
				m: "a minute",
				mm: "%d minutes",
				h: "an hour",
				hh: "%d hours",
				d: "a day",
				dd: "%d days",
				M: "a month",
				MM: "%d months",
				y: "a year",
				yy: "%d years"
			},
			relativeTime: function(number, withoutSuffix, string, isFuture) {
				var output;
				output = this._relativeTime[string];
				if (typeof output === "function") {
					return output(number, withoutSuffix, string, isFuture);
				} else {
					return output.replace(/%d/i, number);
				}
			},
			pastFuture: function(diff, output) {
				var format;
				format = this._relativeTime[diff > 0 ? "future" : "past"];
				if (typeof format === "function") {
					return format(output);
				} else {
					return format.replace(/%s/i, output);
				}
			},
			ordinal: function(number) {
				return this._ordinal.replace("%d", number);
			},
			_ordinal: "%d",
			preparse: function(string) {
				return string;
			},
			postformat: function(string) {
				return string;
			},
			week: function(mom) {
				return weekOfYear(mom, this._week.dow, this._week.doy).week;
			},
			_week: {
				dow: 0,
				doy: 6
			},
			_invalidDate: "Invalid date",
			invalidDate: function() {
				return this._invalidDate;
			}
		});

		moment = function(input, format, locale, strict) {
			var c;
			c = null;
			if (typeof locale === "boolean") {
				strict = locale;
				locale = undefined;
			}
			c = {};
			c._isAMomentObject = true;
			c._i = input;
			c._f = format;
			c._l = locale;
			c._strict = strict;
			c._isUTC = false;
			c._pf = defaultParsingFlags();
			return makeMoment(c);
		};
		moment.suppressDeprecationWarnings = false;
		moment.createFromInputFallback = deprecate("moment construction falls back to js Date. This is " + "discouraged and will be removed in upcoming major " + "release. Please refer to " + "https://github.com/moment/moment/issues/1407 for more info.", function(config) {
			config._d = new Date(config._i);
		});
		moment.min = function() {
			var args;
			args = [].slice.call(arguments, 0);
			return pickBy("isBefore", args);
		};
		moment.max = function() {
			var args;
			args = [].slice.call(arguments, 0);
			return pickBy("isAfter", args);
		};
		moment.utc = function(input, format, locale, strict) {
			var c;
			c = null;
			if (typeof locale === "boolean") {
				strict = locale;
				locale = undefined;
			}
			c = {};
			c._isAMomentObject = true;
			c._useUTC = true;
			c._isUTC = true;
			c._l = locale;
			c._i = input;
			c._f = format;
			c._strict = strict;
			c._pf = defaultParsingFlags();
			return makeMoment(c).utc();
		};
		moment.unix = function(input) {
			return moment(input * 1e3);
		};
		moment.duration = function(input, key) {
			var diffRes, duration, match, parseIso, ret, sign;
			duration = input;
			match = null;
			sign = null;
			ret = null;
			parseIso = null;
			diffRes = null;
			if (moment.isDuration(input)) {
				duration = {
					ms: input._milliseconds,
					d: input._days,
					M: input._months
				};
			} else {
				if (typeof input === "number") {
					duration = {};
					if (key) {
						duration[key] = input;
					} else {
						duration.milliseconds = input;
					}
				} else {
					if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
						sign = match[1] === "-" ? -1 : 1;
						duration = {
							y: 0,
							d: toInt(match[DATE]) * sign,
							h: toInt(match[HOUR]) * sign,
							m: toInt(match[MINUTE]) * sign,
							s: toInt(match[SECOND]) * sign,
							ms: toInt(match[MILLISECOND]) * sign
						};
					} else {
						if (!!(match = isoDurationRegex.exec(input))) {
							sign = match[1] === "-" ? -1 : 1;
							parseIso = function(inp) {
								var res;
								res = inp && parseFloat(inp.replace(",", "."));
								return (isNaN(res) ? 0 : res) * sign;
							};
							duration = {
								y: parseIso(match[2]),
								M: parseIso(match[3]),
								d: parseIso(match[4]),
								h: parseIso(match[5]),
								m: parseIso(match[6]),
								s: parseIso(match[7]),
								w: parseIso(match[8])
							};
						} else {
							if (typeof duration === "object" && ("from" in duration || "to" in duration)) {
								diffRes = momentsDifference(moment(duration.from), moment(duration.to));
								duration = {};
								duration.ms = diffRes.milliseconds;
								duration.M = diffRes.months;
							}
						}
					}
				}
			}
			ret = new Duration(duration);
			if (moment.isDuration(input) && hasOwnProp(input, "_locale")) {
				ret._locale = input._locale;
			}
			return ret;
		};
		moment.version = VERSION;
		moment.defaultFormat = isoFormat;
		moment.ISO_8601 = function() {};
		moment.momentProperties = momentProperties;
		moment.updateOffset = function() {};
		moment.relativeTimeThreshold = function(threshold, limit) {
			if (relativeTimeThresholds[threshold] === undefined) {
				return false;
			}
			if (limit === undefined) {
				return relativeTimeThresholds[threshold];
			}
			relativeTimeThresholds[threshold] = limit;
			return true;
		};
		moment.lang = deprecate("moment.lang is deprecated. Use moment.locale instead.", function(key, value) {
			return moment.locale(key, value);
		});
		moment.locale = function(key, values) {
			var data;
			data = null;
			if (key) {
				if (typeof values !== "undefined") {
					data = moment.defineLocale(key, values);
				} else {
					data = moment.localeData(key);
				}
				if (data) {
					moment.duration._locale = moment._locale = data;
				}
			}
			return moment._locale._abbr;
		};
		moment.defineLocale = function(name, values) {
			if (values !== null) {
				values.abbr = name;
				if (!locales[name]) {
					locales[name] = new Locale();
				}
				locales[name].set(values);
				moment.locale(name);
				return locales[name];
			} else {
				delete locales[name];
				return null;
			}
		};
		moment.langData = deprecate("moment.langData is deprecated. Use moment.localeData instead.", function(key) {
			return moment.localeData(key);
		});
		moment.localeData = function(key) {
			var locale;
			locale = null;
			if (key && key._locale && key._locale._abbr) {
				key = key._locale._abbr;
			}
			if (!key) {
				return moment._locale;
			}
			if (!isArray(key)) {
				locale = loadLocale(key);
				if (locale) {
					return locale;
				}
				key = [ key ];
			}
			return chooseLocale(key);
		};
		moment.isMoment = function(obj) {
			return obj instanceof Moment || obj != null && hasOwnProp(obj, "_isAMomentObject");
		};
		moment.isDuration = function(obj) {
			return obj instanceof Duration;
		};
		i = lists.length - 1;
		while (i >= 0) {
			makeList(lists[i]);
			--i;
		}
		moment.normalizeUnits = function(units) {
			return normalizeUnits(units);
		};
		moment.invalid = function(flags) {
			var m;
			m = moment.utc(NaN);
			if (flags != null) {
				extend(m._pf, flags);
			} else {
				m._pf.userInvalidated = true;
			}
			return m;
		};
		moment.parseZone = function() {
			return moment.apply(null, arguments).parseZone();
		};
		moment.parseTwoDigitYear = function(input) {
			return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
		};
		extend(moment.fn = Moment.prototype, {
			clone: function() {
				return moment(this);
			},
			valueOf: function() {
				return +this._d + (this._offset || 0) * 6e4;
			},
			unix: function() {
				return Math.floor(+this / 1e3);
			},
			toString: function() {
				return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
			},
			toDate: function() {
				if (this._offset) {
					return new Date(+this);
				} else {
					return this._d;
				}
			},
			toISOString: function() {
				var m;
				m = moment(this).utc();
				if (0 < m.year() && m.year() <= 9999) {
					return formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
				} else {
					return formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
				}
			},
			toArray: function() {
				var m;
				m = this;
				return [ m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds() ];
			},
			isValid: function() {
				return isValid(this);
			},
			isDSTShifted: function() {
				if (this._a) {
					return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
				}
				return false;
			},
			parsingFlags: function() {
				return extend({}, this._pf);
			},
			invalidAt: function() {
				return this._pf.overflow;
			},
			utc: function(keepLocalTime) {
				return this.zone(0, keepLocalTime);
			},
			local: function(keepLocalTime) {
				if (this._isUTC) {
					this.zone(0, keepLocalTime);
					this._isUTC = false;
					if (keepLocalTime) {
						this.add(this._dateTzOffset(), "m");
					}
				}
				return this;
			},
			format: function(inputString) {
				var output;
				output = formatMoment(this, inputString || moment.defaultFormat);
				return this.localeData().postformat(output);
			},
			add: createAdder(1, "add"),
			subtract: createAdder(-1, "subtract"),
			diff: function(input, units, asFloat) {
				var daysAdjust, diff, output, that, zoneDiff;
				that = makeAs(input, this);
				zoneDiff = (this.zone() - that.zone()) * 6e4;
				diff = null;
				output = null;
				daysAdjust = null;
				units = normalizeUnits(units);
				if (units === "year" || units === "month") {
					diff = (this.daysInMonth() + that.daysInMonth()) * 432e5;
					output = (this.year() - that.year()) * 12 + (this.month() - that.month());
					daysAdjust = this - moment(this).startOf("month") - (that - moment(that).startOf("month"));
					daysAdjust -= (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) * 6e4;
					output += daysAdjust / diff;
					if (units === "year") {
						output = output / 12;
					}
				} else {
					diff = this - that;
					output = units === "second" ? diff / 1e3 : units === "minute" ? diff / 6e4 : units === "hour" ? diff / 36e5 : units === "day" ? (diff - zoneDiff) / 864e5 : units === "week" ? (diff - zoneDiff) / 6048e5 : diff;
				}
				if (asFloat) {
					return output;
				} else {
					return absRound(output);
				}
			},
			from: function(time, withoutSuffix) {
				return moment.duration({
					to: this,
					from: time
				}).locale(this.locale()).humanize(!withoutSuffix);
			},
			fromNow: function(withoutSuffix) {
				return this.from(moment(), withoutSuffix);
			},
			calendar: function(time) {
				var diff, format, now, sod;
				now = time || moment();
				sod = makeAs(now, this).startOf("day");
				diff = this.diff(sod, "days", true);
				format = diff < -6 ? "sameElse" : diff < -1 ? "lastWeek" : diff < 0 ? "lastDay" : diff < 1 ? "sameDay" : diff < 2 ? "nextDay" : diff < 7 ? "nextWeek" : "sameElse";
				return this.format(this.localeData().calendar(format, this));
			},
			isLeapYear: function() {
				return isLeapYear(this.year());
			},
			isDST: function() {
				return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
			},
			day: function(input) {
				var day;
				day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
				if (input != null) {
					input = parseWeekday(input, this.localeData());
					return this.add(input - day, "d");
				} else {
					return day;
				}
			},
			month: makeAccessor("Month", true),
			startOf: function(units) {
				units = normalizeUnits(units);
				switch (units) {
					case "year":
					this.month(0);
					break;

					case "quarter":
					case "month":
					this.date(1);
					break;

					case "week":
					case "isoWeek":
					case "day":
					this.hours(0);
					break;

					case "hour":
					this.minutes(0);
					break;

					case "minute":
					this.seconds(0);
					break;

					case "second":
					this.milliseconds(0);
					break;
				}
				if (units === "week") {
					this.weekday(0);
				} else {
					if (units === "isoWeek") {
						this.isoWeekday(1);
					}
				}
				if (units === "quarter") {
					this.month(Math.floor(this.month() / 3) * 3);
				}
				return this;
			},
			endOf: function(units) {
				units = normalizeUnits(units);
				return this.startOf(units).add(1, units === "isoWeek" ? "week" : units).subtract(1, "ms");
			},
			isAfter: function(input, units) {
				units = normalizeUnits(typeof units !== "undefined" ? units : "millisecond");
				if (units === "millisecond") {
					input = moment.isMoment(input) ? input : moment(input);
					return +this > +input;
				} else {
					return +this.clone().startOf(units) > +moment(input).startOf(units);
				}
			},
			isBefore: function(input, units) {
				units = normalizeUnits(typeof units !== "undefined" ? units : "millisecond");
				if (units === "millisecond") {
					input = moment.isMoment(input) ? input : moment(input);
					return +this < +input;
				} else {
					return +this.clone().startOf(units) < +moment(input).startOf(units);
				}
			},
			isSame: function(input, units) {
				units = normalizeUnits(units || "millisecond");
				if (units === "millisecond") {
					input = moment.isMoment(input) ? input : moment(input);
					return +this === +input;
				} else {
					return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
				}
			},
			min: deprecate("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function(other) {
				other = moment.apply(null, arguments);
				if (other < this) {
					return this;
				} else {
					return other;
				}
			}),
			max: deprecate("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function(other) {
				other = moment.apply(null, arguments);
				if (other > this) {
					return this;
				} else {
					return other;
				}
			}),
			zone: function(input, keepLocalTime) {
				var localAdjust, offset;
				offset = this._offset || 0;
				localAdjust = null;
				if (input != null) {
					if (typeof input === "string") {
						input = timezoneMinutesFromString(input);
					}
					if (Math.abs(input) < 16) {
						input = input * 60;
					}
					if (!this._isUTC && keepLocalTime) {
						localAdjust = this._dateTzOffset();
					}
					this._offset = input;
					this._isUTC = true;
					if (localAdjust != null) {
						this.subtract(localAdjust, "m");
					}
					if (offset !== input) {
						if (!keepLocalTime || this._changeInProgress) {
							addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, false);
						} else {
							if (!this._changeInProgress) {
								this._changeInProgress = true;
								moment.updateOffset(this, true);
								this._changeInProgress = null;
							}
						}
					}
				} else {
					return this._isUTC ? offset : this._dateTzOffset();
				}
				return this;
			},
			zoneAbbr: function() {
				if (this._isUTC) {
					return "UTC";
				} else {
					return "";
				}
			},
			zoneName: function() {
				if (this._isUTC) {
					return "Coordinated Universal Time";
				} else {
					return "";
				}
			},
			parseZone: function() {
				if (this._tzm) {
					this.zone(this._tzm);
				} else {
					if (typeof this._i === "string") {
						this.zone(this._i);
					}
				}
				return this;
			},
			hasAlignedHourOffset: function(input) {
				if (!input) {
					input = 0;
				} else {
					input = moment(input).zone();
				}
				return (this.zone() - input) % 60 === 0;
			},
			daysInMonth: function() {
				return daysInMonth(this.year(), this.month());
			},
			dayOfYear: function(input) {
				var dayOfYear;
				dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
				if (input == null) {
					return dayOfYear;
				} else {
					return this.add(input - dayOfYear, "d");
				}
			},
			quarter: function(input) {
				if (input == null) {
					return Math.ceil((this.month() + 1) / 3);
				} else {
					return this.month((input - 1) * 3 + this.month() % 3);
				}
			},
			weekYear: function(input) {
				var year;
				year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
				if (input == null) {
					return year;
				} else {
					return this.add(input - year, "y");
				}
			},
			isoWeekYear: function(input) {
				var year;
				year = weekOfYear(this, 1, 4).year;
				if (input == null) {
					return year;
				} else {
					return this.add(input - year, "y");
				}
			},
			week: function(input) {
				var week;
				week = this.localeData().week(this);
				if (input == null) {
					return week;
				} else {
					return this.add((input - week) * 7, "d");
				}
			},
			isoWeek: function(input) {
				var week;
				week = weekOfYear(this, 1, 4).week;
				if (input == null) {
					return week;
				} else {
					return this.add((input - week) * 7, "d");
				}
			},
			weekday: function(input) {
				var weekday;
				weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
				if (input == null) {
					return weekday;
				} else {
					return this.add(input - weekday, "d");
				}
			},
			isoWeekday: function(input) {
				if (input == null) {
					return this.day() || 7;
				} else {
					return this.day(this.day() % 7 ? input : input - 7);
				}
			},
			isoWeeksInYear: function() {
				return weeksInYear(this.year(), 1, 4);
			},
			weeksInYear: function() {
				var weekInfo;
				weekInfo = this.localeData()._week;
				return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
			},
			get: function(units) {
				units = normalizeUnits(units);
				return this[units]();
			},
			set: function(units, value) {
				units = normalizeUnits(units);
				if (typeof this[units] === "function") {
					this[units](value);
				}
				return this;
			},
			locale: function(key) {
				var newLocaleData;
				newLocaleData = null;
				if (key === undefined) {
					return this._locale._abbr;
				} else {
					newLocaleData = moment.localeData(key);
					if (newLocaleData != null) {
						this._locale = newLocaleData;
					}
					return this;
				}
			},
			lang: deprecate("moment().lang() is deprecated. Use moment().localeData() instead.", function(key) {
				if (key === undefined) {
					return this.localeData();
				} else {
					return this.locale(key);
				}
			}),
			localeData: function() {
				return this._locale;
			},
			_dateTzOffset: function() {
				return Math.round(this._d.getTimezoneOffset() / 15) * 15;
			}
		});
		moment.fn.millisecond = moment.fn.milliseconds = makeAccessor("Milliseconds", false);
		moment.fn.second = moment.fn.seconds = makeAccessor("Seconds", false);
		moment.fn.minute = moment.fn.minutes = makeAccessor("Minutes", false);
		moment.fn.hour = moment.fn.hours = makeAccessor("Hours", true);
		moment.fn.date = makeAccessor("Date", true);
		moment.fn.dates = deprecate("dates accessor is deprecated. Use date instead.", makeAccessor("Date", true));
		moment.fn.year = makeAccessor("FullYear", true);
		moment.fn.years = deprecate("years accessor is deprecated. Use year instead.", makeAccessor("FullYear", true));
		moment.fn.days = moment.fn.day;
		moment.fn.months = moment.fn.month;
		moment.fn.weeks = moment.fn.week;
		moment.fn.isoWeeks = moment.fn.isoWeek;
		moment.fn.quarters = moment.fn.quarter;
		moment.fn.toJSON = moment.fn.toISOString;
		extend(moment.duration.fn = Duration.prototype, {
			_bubble: function() {
				var data, days, hours, milliseconds, minutes, months, seconds, years;
				milliseconds = this._milliseconds;
				days = this._days;
				months = this._months;
				data = this._data;
				seconds = null;
				minutes = null;
				hours = null;
				years = 0;
				data.milliseconds = milliseconds % 1e3;
				seconds = absRound(milliseconds / 1e3);
				data.seconds = seconds % 60;
				minutes = absRound(seconds / 60);
				data.minutes = minutes % 60;
				hours = absRound(minutes / 60);
				data.hours = hours % 24;
				days += absRound(hours / 24);
				years = absRound(daysToYears(days));
				days -= absRound(yearsToDays(years));
				months += absRound(days / 30);
				days %= 30;
				years += absRound(months / 12);
				months %= 12;
				data.days = days;
				data.months = months;
				data.years = years;
			},
			abs: function() {
				this._milliseconds = Math.abs(this._milliseconds);
				this._days = Math.abs(this._days);
				this._months = Math.abs(this._months);
				this._data.milliseconds = Math.abs(this._data.milliseconds);
				this._data.seconds = Math.abs(this._data.seconds);
				this._data.minutes = Math.abs(this._data.minutes);
				this._data.hours = Math.abs(this._data.hours);
				this._data.months = Math.abs(this._data.months);
				this._data.years = Math.abs(this._data.years);
				return this;
			},
			weeks: function() {
				return absRound(this.days() / 7);
			},
			valueOf: function() {
				return this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + toInt(this._months / 12) * 31536e6;
			},
			humanize: function(withSuffix) {
				var output;
				output = relativeTime(this, !withSuffix, this.localeData());
				if (withSuffix) {
					output = this.localeData().pastFuture(+this, output);
				}
				return this.localeData().postformat(output);
			},
			add: function(input, val) {
				var dur;
				dur = moment.duration(input, val);
				this._milliseconds += dur._milliseconds;
				this._days += dur._days;
				this._months += dur._months;
				this._bubble();
				return this;
			},
			subtract: function(input, val) {
				var dur;
				dur = moment.duration(input, val);
				this._milliseconds -= dur._milliseconds;
				this._days -= dur._days;
				this._months -= dur._months;
				this._bubble();
				return this;
			},
			get: function(units) {
				units = normalizeUnits(units);
				return this[units.toLowerCase() + "s"]();
			},
			as: function(units) {
				var days, months;
				days = null;
				months = null;
				units = normalizeUnits(units);
				if (units === "month" || units === "year") {
					days = this._days + this._milliseconds / 864e5;
					months = this._months + daysToYears(days) * 12;
					if (units === "month") {
						return months;
					} else {
						return months / 12;
					}
				} else {
					days = this._days + yearsToDays(this._months / 12);
					switch (units) {
						case "week":
						return days / 7 + this._milliseconds / 6048e5;

						case "day":
						return days + this._milliseconds / 864e5;

						case "hour":
						return days * 24 + this._milliseconds / 36e5;

						case "minute":
						return days * 24 * 60 + this._milliseconds / 6e4;

						case "second":
						return days * 24 * 60 * 60 + this._milliseconds / 1e3;

						case "millisecond":
						return Math.floor(days * 24 * 60 * 60 * 1e3) + this._milliseconds;

						default:
						throw new Error("Unknown unit " + units);
					}
				}
			},
			lang: moment.fn.lang,
			locale: moment.fn.locale,
			toIsoString: deprecate("toIsoString() is deprecated. Please use toISOString() instead " + "(notice the capitals)", function() {
				return this.toISOString();
			}),
			toISOString: function() {
				var days, hours, minutes, months, seconds, years;
				years = Math.abs(this.years());
				months = Math.abs(this.months());
				days = Math.abs(this.days());
				hours = Math.abs(this.hours());
				minutes = Math.abs(this.minutes());
				seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
				if (!this.asSeconds()) {
					return "P0D";
				}
				return (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "");
			},
			localeData: function() {
				return this._locale;
			}
		});
		moment.duration.fn.toString = moment.duration.fn.toISOString;
		for (i in unitMillisecondFactors) {
			if (hasOwnProp(unitMillisecondFactors, i)) {
				makeDurationGetter(i.toLowerCase());
			}
		}
		moment.duration.fn.asMilliseconds = function() {
			return this.as("ms");
		};
		moment.duration.fn.asSeconds = function() {
			return this.as("s");
		};
		moment.duration.fn.asMinutes = function() {
			return this.as("m");
		};
		moment.duration.fn.asHours = function() {
			return this.as("h");
		};
		moment.duration.fn.asDays = function() {
			return this.as("d");
		};
		moment.duration.fn.asWeeks = function() {
			return this.as("weeks");
		};
		moment.duration.fn.asMonths = function() {
			return this.as("M");
		};
		moment.duration.fn.asYears = function() {
			return this.as("y");
		};
		moment.locale("en", {
			ordinal : function(number) {
				var b, output;
				b = number % 10;
				output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
				return number + output;
			}
		});
		return moment;

	}.call(this);
	return _c.datepicker;
});
