(function(addon) {
	if (typeof define === 'function' && define.amd) {
		define('clique-datatable', ['clique'], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error('Clique.datatable requires Clique.core');
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {

	_c.component('datatable', {
		defaults : {
			paginationWrapper: '.datatable-pagination-pages',
			perPage: 10,
			infoWrapper: '.datatable-info',
			infoString: 'Showing rows #{start} through #{end} of #{total}',
			sortColumn: 0,
			sortOrder: 'asc'
		},
		currentPage: 0,

		boot : function() {
			_c.ready(function(context) {
				_c.$('[data-datatable]', context).each(function() {
					var ele = _c.$(this);
					if (!ele.data('clique.data.datatable')) {
						_c.datatable(ele, _c.utils.options(ele.attr('data-datatable')));
					}
				});
			});
		},
		init : function() {

			// set properties
			this.elements = {
				tbody : this.find('> tbody'),
				thead : this.find('> thead'),
				th : this.find('> thead > tr > th'),
				next : this._findElement(this.element, '[data-datatable-next]'),
				prev : this._findElement(this.element, '[data-datatable-previous]'),
			};
			if (this.options.paginationWrapper) {
				var pagination = this._findElement(this.element, this.options.paginationWrapper);
				if(pagination.length) {
					this.elements.pagination = pagination;
				}
			}
			if (this.options.infoWrapper) {
				var infoWrapper = this._findElement(this.element, this.options.infoWrapper);
				if(infoWrapper.length) {
					this.elements.infoWrapper = infoWrapper;
				}
			}
			this.hasRows = !!this.elements.tbody.find('> tr').length;

			// execute internal methods (for data tracking)
			this._setColumns();
			this._cacheData();

			// bind event handlers
			this.on('showpage.datatable.clique', (function(_this) {
				return function(e, pageIndex) {
					return _this.showPage(pageIndex);
				};
			})(this));
			this.on('didshowpage.datatable.clique', (function(_this) {
				return function(e, currentPage, start, end, dataLength) {
					return _this.didShowPage(currentPage, start, end, dataLength);
				};
			})(this));
			this.on('next.datatable.clique', (function(_this) {
				return function() {
					return _this.showNextPage();
				};
			})(this));
			this.on('previous.datatable.clique', (function(_this) {
				return function() {
					return _this.showPreviousPage();
				};
			})(this));
			this.on('sort.datatable.clique', (function(_this) {
				return function(e, columnIndex, sortOrder) {
					return _this.sortByColumn(columnIndex, sortOrder);
				};
			})(this));

			// bind event listeners
			this.elements.thead.on('click', '.datatable-sort', (function(_this) {
				return function(e) {
					e.preventDefault();
					var idx = _c.$(this).closest('th').index();
					if (_this.options.sortColumn === idx) {
						if (_this.options.sortOrder === 'desc') {
							_this.options.sortColumn = -1;
						}
						_this.options.sortOrder = _this.options.sortOrder === 'asc' ? 'desc' : 'asc';
					} else {
						_this.options.sortColumn = idx;
						_this.options.sortOrder = 'asc';
					}
					return _this.trigger('sort.datatable.clique', [_this.options.sortColumn, _this.options.sortOrder]);
				};
			})(this));

			// set next/prev object data
			this.elements.prev.data('clique.data.datatable.prev', this);
			this.elements.next.data('clique.data.datatable.next', this);

			_c.$html.on('click', '[data-datatable-previous]', function(e) {
				e.preventDefault();
				if(!_c.$(this).hasClass('disabled')) {
					var table = _c.$(this).data('clique.data.datatable.prev');
					table.showPreviousPage();
				}
			});
			_c.$html.on('click', '[data-datatable-next]', function(e) {
				e.preventDefault();
				if(!_c.$(this).hasClass('disabled')) {
					var table = _c.$(this).data('clique.data.datatable.next');
					table.showNextPage();
				}
			});

			// trigger initial sort
			this.trigger('sort.datatable.clique', [this.options.sortColumn, this.options.sortOrder]);
			this.trigger('showpage.datatable.clique', [this.currentPage]);
		},

		// templating methods
		addSortClass : function(idx, order) {
			this.removeSortClass();
			return this.elements.th.eq(idx).find('.datatable-sort').addClass("datatable-sort-active datatable-sort-" + order);
		},
		removeSortClass : function() {
			return this.elements.th.find('.datatable-sort').removeClass('datatable-sort-active datatable-sort-asc datatable-sort-desc');
		},
		removeAllRows : function() {
			return this.elements.tbody.find('> *').remove();
		},
		addRow: function(rowData) {
			var tr = _c.$('<tr />');
			for (var _i = 0, _len = rowData.length; _i < _len; _i++) {
				var cellData = rowData[_i];
				var content = cellData.text;
				var td = _c.$("<td>" + content + "</td>");
				tr.append(td);
			}
			return this.elements.tbody.append(tr);
		},

		// sort methods
		sortByColumn : function(idx, order) {
			idx = parseInt(idx, 10);
			if (idx < 0) {
				this.printOriginalData();
				return;
			}
			order = order.toLowerCase() || 'asc';
			if (order !== 'asc' && order !== 'desc') {
				order = 'asc';
			}
			function compare(a, b) {
				if (order === 'asc') {
					if (a.value < b.value) {
						return -1;
					}
					if (a.value > b.value) {
						return 1;
					}
				} else {
					if (a.value > b.value) {
						return -1;
					}
					if (a.value < b.value) {
						return 1;
					}
				}
				return 0;
			};
			var columnData = this.getColumnData(idx);
			var sortedData = columnData.sort(compare);
			var newData = [];
			for (var _i = 0, _len = sortedData.length; _i < _len; _i++) {
				newData.push(this.data[sortedData[_i].index]);
			}
			this._setDataProperties(newData);
			this.addSortClass(idx, order);
			return this.trigger('showpage.datatable.clique', [this.currentPage]);
		},

		// pagination methods
		buildPagination : function() {
			var selector = this.options.paginationWrapper;
			if (!this.pagination || !this.pagination.length) {
				var parents = this.element.parents();
				parents.each(function(_this) {
					return function() {
						if ($(this).find(selector).length) {
							_this.pagination = _c.$(this).find(selector);
							return false;
						}
					};
				}(this));
			}
			if (this.pagination.length && !this.pagination.find('> *').length) {
				var hasPaginationClass = this.pagination.hasClass('pagination');
				var i = 0;
				var html = '';
				while (i < this.pages + 1) {
					if (i === this.pages) {
						html += "<li class='datatable-pagination-blank'><span>...</span></li>";
					}
					html += hasPaginationClass ? "<li><a href='#' data-datatable-page='" + i + "'>" + (i + 1) + "</a></li>" : "<a href='#' data-datatable-page='" + i + "'>" + (i + 1) + "</a>";
					if (i === 0) {
						html += "<li class='datatable-pagination-blank'><span>...</span></li>";
					}
					i++;
				}
				this.pagination.append(html);
				return this.bindPaginationEvents();
			}
		},
		buildComplexPagination: function() {
			var pages;
			var i = 0;
			if (this.currentPage < 3) {
				this.pagination.find('> .datatable-pagination-blank').first().hide();
				this.pagination.find('> .datatable-pagination-blank').last().show();
				pages = [0, 1, 2, 3, this.pages];
			} else if (this.currentPage > this.pages - 3) {
				this.pagination.find('> .datatable-pagination-blank').first().show();
				this.pagination.find('> .datatable-pagination-blank').last().hide();
				pages = [0, this.pages - 3, this.pages - 2, this.pages - 1, this.pages];
			} else {
				this.pagination.find('> li').css('display', 'inline-block');
				pages = [0, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.pages];
			}
			return this.pagination.find('> [data-datatable-page]').each(function() {
				var page = _c.$(this).data('datatable-page');
				if (pages.indexOf(page) < 0) {
					return _c.$(this).hide();
				} else {
					return _c.$(this).show();
				}
			});
		},
		updatePagination : function() {
			if (!this.options.paginationWrapper || !this.elements.pagination || !this.elements.pagination.length) {
				return;
			}
			this.buildPagination();
			if (this.pages > 6) {
				this.buildComplexPagination();
			// } else {
			// 	this.updatePaginationVisibility();
			}
			if (this.pagination && this.pagination.length) {
				if (this.pagination.hasClass('pagination')) {
					this.pagination.find('[data-datatable-page]').parent().removeClass('active');
					return this.pagination.find("[data-datatable-page='" + this.currentPage + "']").parent().addClass('active');
				} else {
					this.pagination.find('[data-datatable-page]').removeClass('active');
					return this.pagination.find("[data-datatable-page='" + this.currentPage + "']").addClass('active');
				}
			}
		},
		bindPaginationEvents: function() {
			return this.pagination.on('click', '[data-datatable-page]', (function(_this) {
				return function(e) {
					e.preventDefault();
					var idx = _c.$(e.target).data('datatable-page');
					return _this.trigger('showpage.datatable.clique', [idx]);
				};
			})(this));
		},
		showPage : function(idx) {
			if (!this.hasRows || !this.dataLength) {
				return;
			}
			this.removeAllRows();
			var start = this.options.perPage * idx;
			var end = start + this.options.perPage;
			end = end > this.dataLength ? this.dataLength : end;
			var data = this.getDataForRange(start, end);
			for (var _i = 0, _len = data.length; _i < _len; _i++) {
				this.addRow(data[_i]);
			}
			this.currentPage = idx;
			this.disablePrevious = start === 0 ? true : false;
			this.disableNext = this.currentPage === this.pages ? true : false;
			this.updatePagination();
			return this.trigger('didshowpage.datatable.clique', [this.currentPage, (start === 0 ? 1 : start), end, this.dataLength]);
		},
		didShowPage : function(currentPage, start, end, dataLength) {
			if (this.elements.paginationWrapper && !this.elements.paginationWrapper.find('> *').length) {
				return this.buildPagination();
			}
			if(this.elements.infoWrapper) {
				this.printTableInfo(start, end, dataLength);
			}
			if(this.elements.next) {
				if(this.currentPage === this.pages) {
					this.elements.next.addClass('disabled');
				} else if(this.elements.next.hasClass('disabled')) {
					this.elements.next.removeClass('disabled');
				}
			}
			if(this.elements.prev) {
				if(this.currentPage === 0) {
					this.elements.prev.addClass('disabled');
				} else if(this.elements.prev.hasClass('disabled')) {
					this.elements.prev.removeClass('disabled');
				}
			}
		},
		showNextPage : function() {
			var pageIndex = this.currentPage + 1;
			pageIndex = pageIndex > this.pages ? this.pages : pageIndex;
			return this.showPage(pageIndex);
		},
		showPreviousPage : function() {
			var pageIndex = this.currentPage - 1;
			pageIndex = pageIndex < 0 ? 0 : pageIndex;
			return this.showPage(pageIndex);
		},

		// info methods
		printTableInfo : function(start, end, dataLength) {
			this.elements.infoWrapper.html('<p>Showing ' + start + ' to ' + end + ' of ' + dataLength + '</p>');
		},

		// public getters
		getColumnData : function(idx) {
			if (!this.data || !this.dataLength) {
				return [];
			}
			var output = [];
			var _ref = this.data;
			for (var i in _ref) {
				if(_ref.hasOwnProperty(i)) {
					var rowData = _ref[i];
					var columnData = rowData[idx];
					output.push({
						index: parseInt(i, 10),
						value: columnData.value
					});
				}
			}
			return output;
		},
		getDataForRange : function(start, end) {
			var i = start;
			var output = [];
			while (i < end) {
				output.push(this.data[i]);
				i++;
			}
			return output;
		},

		// public printers
		printOriginalData : function() {
			this._setDataProperties(this.originalData);
			this.removeSortClass();
			return this.trigger('showpage.datatable.clique', [this.currentPage]);
		},

		// private methods
		_findElement : function(root, selector) {
			if (selector[0] === '#') {
				return _c.$(selector);
			}
			var parents = root.parents();
			var output = null;
			parents.each(function() {
				if (_c.$(this).find(selector).length) {
					output = _c.$(this).find(selector);
					return false;
				}
			});
			return output;
		},
		_setColumns : function() {
			var columns = [];
			this.elements.th.each(function(i) {
				var th = _c.$(this);
				var html = th.html();
				var _html = _c.$('<div></div>');
				_html.append(html);
				_html.children().each(function() {
					return _c.$(this).remove();
				});
				_c.$(this).width(_c.$(this).outerWidth());
				return columns.push({
					index: i,
					title: _html.text().trim(),
					width: _c.$(this).outerWidth()
				});
			});
			this.columns = columns;
		},
		_cacheData : function() {
			if (!this.hasRows) {
				return;
			}
			var tbody = this.elements.tbody;
			var data = [];
			var columns = this.columns;
			var isNumber = _c.utils.isNumber;
			var isDate = _c.utils.isDate;
			tbody.find('> tr').each(function() {
				var rowData = [];
				_c.$(this).find('> *').each(function(i) {
					var value;
					var text = _c.$(this).text();
					var html = _c.$(this).html();
					if (isNumber(text)) {
						value = parseFloat(text);
					} else if (isDate(text)) {
						value = new Date(text);
					} else {
						value = text;
					}
					return rowData.push({
						index: i,
						key: columns[i].title,
						value: value,
						text: text,
						html: html
					});
				});
				return data.push(rowData);
			});
			this._setDataProperties(data);
		},
		_setDataProperties : function(data) {
			this.data = data;
			if (!this.originalData && this.data.length) {
				this.originalData = this.data;
			}
			this.dataLength = this.data.length;
			if (!this.options.paginationWrapper) {
				this.options.perPage = this.dataLength;
			}
			this.pages = Math.ceil(this.dataLength / this.options.perPage) - 1;
		},
	});
});
