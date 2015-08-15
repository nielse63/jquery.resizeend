(function(addon) {
	if (typeof define === 'function' && define.amd) {
		define('clique-nestable', ['clique'], function() {
			return addon(Clique);
		});
	}
	if (!window.Clique) {
		throw new Error('Clique.nestable requires Clique.core');
	}
	if (window.Clique) {
		addon(Clique);
	}
})(function(_c) {
	var $win, dragSource, draggingElement, eCancel, eEnd, eMove, eStart, hasPointerEvents, hasTouch, html, touchedlists;
	var $ = _c.$;
	hasTouch = false;
	html = _c.$html;
	touchedlists = [];
	$win = _c.$win;
	draggingElement = void 0;
	dragSource = void 0;
	hasPointerEvents = (function() {
		var docEl, el, supports;
		el = document.createElement('div');
		docEl = document.documentElement;
		if (!('pointerEvents' in el.style)) {
			return false;
		}
		el.style.pointerEvents = 'auto';
		el.style.pointerEvents = 'x';
		docEl.appendChild(el);
		supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
		docEl.removeChild(el);
		return !!supports;
	})();
	eStart = hasTouch ? 'touchstart' : 'mousedown';
	eMove = hasTouch ? 'touchmove' : 'mousemove';
	eEnd = hasTouch ? 'touchend' : 'mouseup';
	eCancel = hasTouch ? 'touchcancel' : 'mouseup';
	_c.component('nestable', {
		defaults: {
			prefix: '',
			listNodeName: 'ul',
			itemNodeName: 'li',
			listBaseClass: '{prefix}nestable',
			listClass: '{prefix}nestable-list',
			listitemClass: '{prefix}nestable-list-item',
			itemClass: '{prefix}nestable-item',
			dragClass: '{prefix}nestable-list-dragged',
			movingClass: '{prefix}nestable-moving',
			handleClass: '{prefix}nestable-handle',
			collapsedClass: '{prefix}collapsed',
			placeClass: '{prefix}nestable-placeholder',
			noDragClass: '{prefix}nestable-nodrag',
			emptyClass: '{prefix}nestable-empty',
			group: 0,
			maxDepth: 10,
			threshold: 20
		},
		boot: function() {
			_c.$html.on('mousemove touchmove', function() {
				var top;
				if (draggingElement) {
					top = draggingElement.offset().top;
					if (top < _c.$win.scrollTop()) {
						return _c.$win.scrollTop(_c.$win.scrollTop() - Math.ceil(draggingElement.height() / 2));
					} else if (top + draggingElement.height() > window.innerHeight + _c.$win.scrollTop()) {
						return _c.$win.scrollTop(_c.$win.scrollTop() + Math.ceil(draggingElement.height() / 2));
					}
				}
			});
			return _c.ready(function(context) {
				return _c.$('[data-nestable]', context).each(function() {
					var ele, obj;
					ele = _c.$(this);
					if (!ele.data('clique.data.nestable')) {
						obj = _c.nestable(ele, _c.utils.options(ele.attr('data-nestable')));
					}
				});
			});
		},
		init: function() {
			var $this, onEndEvent, onMoveEvent, onStartEvent;
			$this = this;
			_c.$doc.on('updated.browser.clique', function() {
				var browser;
				browser = _c.$doc.data('clique.data.browser');
				hasTouch = browser.screen.touch;
			});
			Object.keys(this.options).forEach(function(key) {
				if (String($this.options[key]).indexOf('{prefix}') !== -1) {
					$this.options[key] = $this.options[key].replace('{prefix}', $this.options.prefix);
				}
			});
			this.tplempty = '<div class="' + this.options.emptyClass + '"/>';
			this.find('>' + this.options.itemNodeName).addClass(this.options.listitemClass).end().find('ul:not(.ignore-list)').addClass(this.options.listClass).find('>li').addClass(this.options.listitemClass);
			if (!this.element.children(this.options.itemNodeName).length) {
				this.element.append(this.tplempty);
			}
			this.element.data('nestable-id', 'ID' + (new Date()).getTime() + 'RAND' + Math.ceil(Math.random() * 100000));
			this.reset();
			this.element.data('nestable-group', this.options.group);
			this.placeEl = _c.$('<div class="' + this.options.placeClass + '"/>');
			this.find(this.options.itemNodeName).each(function() {
				return $this.setParent(_c.$(this));
			});
			this.on('click', '[data-nestable-action]', function(e) {
				var action, item, target;
				if ($this.dragEl || !hasTouch && e.button !== 0) {
					return;
				}
				e.preventDefault();
				target = _c.$(e.currentTarget);
				action = target.data('nestableAction');
				item = target.closest($this.options.itemNodeName);
				if (action === 'collapse') {
					$this.collapseItem(item);
				}
				if (action === 'expand') {
					$this.expandItem(item);
				}
				if (action === 'toggle') {
					$this.toggleItem(item);
				}
			});
			onStartEvent = function(e) {
				var handle;
				handle = _c.$(e.target);
				if (!handle.hasClass($this.options.handleClass)) {
					if (handle.closest('.' + $this.options.noDragClass).length) {
						return;
					}
					handle = handle.closest('.' + $this.options.handleClass);
				}
				if (!handle.length || $this.dragEl || !hasTouch && e.button !== 0 || hasTouch && e.touches.length !== 1) {
					return;
				}
				e.preventDefault();
				$this.dragStart(hasTouch ? e.touches[0] : e);
				$this.trigger('start.clique.nestable', [$this]);
			};
			onMoveEvent = function(e) {
				if ($this.dragEl) {
					e.preventDefault();
					$this.dragMove(hasTouch ? e.touches[0] : e);
					return $this.trigger('move.clique.nestable', [$this]);
				}
			};
			onEndEvent = function(e) {
				if ($this.dragEl) {
					e.preventDefault();
					$this.dragStop(hasTouch ? e.touches[0] : e);
				}
				draggingElement = false;
			};
			if (hasTouch) {
				this.element[0].addEventListener(eStart, onStartEvent, false);
				window.addEventListener(eMove, onMoveEvent, false);
				window.addEventListener(eEnd, onEndEvent, false);
				return window.addEventListener(eCancel, onEndEvent, false);
			} else {
				this.on(eStart, onStartEvent);
				$win.on(eMove, onMoveEvent);
				return $win.on(eEnd, onEndEvent);
			}
		},
		serialize: function() {
			var data, depth, list, step;
			data = void 0;
			depth = 0;
			list = this;
			step = function(level, depth) {
				var array, items;
				array = [];
				items = level.children(list.options.itemNodeName);
				items.each(function() {
					var attribute, i, item, li, sub;
					li = _c.$(this);
					item = {};
					attribute = void 0;
					sub = li.children(list.options.listNodeName);
					i = 0;
					while (i < li[0].attributes.length) {
						attribute = li[0].attributes[i];
						if (attribute.name.indexOf('data-') === 0) {
							item[attribute.name.substr(5)] = _c.utils.str2json(attribute.value);
						}
						i++;
					}
					if (sub.length) {
						item.children = step(sub, depth + 1);
					}
					return array.push(item);
				});
				return array;
			};
			data = step(list.element, depth);
			return data;
		},
		list: function(options) {
			var data, depth, list, step;
			data = [];
			list = this;
			depth = 0;
			step = function(level, depth, parent) {
				var items;
				items = level.children(options.itemNodeName);
				return items.each(function(index) {
					var item, li, sub;
					li = _c.$(this);
					item = _c.$.extend({
						parent_id: parent ? parent : null,
						depth: depth,
						order: index
					}, li.data());
					sub = li.children(options.listNodeName);
					data.push(item);
					if (sub.length) {
						return step(sub, depth + 1, li.data(options.idProperty || 'id'));
					}
				});
			};
			options = _c.$.extend({}, list.options, options);
			step(list.element, depth);
			return data;
		},
		reset: function() {
			var i;
			this.mouse = {
				offsetX: 0,
				offsetY: 0,
				startX: 0,
				startY: 0,
				lastX: 0,
				lastY: 0,
				nowX: 0,
				nowY: 0,
				distX: 0,
				distY: 0,
				dirAx: 0,
				dirX: 0,
				dirY: 0,
				lastDirX: 0,
				lastDirY: 0,
				distAxX: 0,
				distAxY: 0
			};
			this.moving = false;
			this.dragEl = null;
			this.dragRootEl = null;
			this.dragDepth = 0;
			this.hasNewRoot = false;
			this.pointEl = null;
			i = 0;
			while (i < touchedlists.length) {
				this.checkEmptyList(touchedlists[i]);
				i++;
			}
			touchedlists = [];
		},
		toggleItem: function(li) {
			return this[li.hasClass(this.options.collapsedClass) ? 'expandItem' : 'collapseItem'](li);
		},
		expandItem: function(li) {
			return li.removeClass(this.options.collapsedClass);
		},
		collapseItem: function(li) {
			var lists;
			lists = li.children(this.options.listNodeName);
			if (lists.length) {
				return li.addClass(this.options.collapsedClass);
			}
		},
		expandAll: function() {
			var list;
			list = this;
			return this.find(list.options.itemNodeName).each(function() {
				return list.expandItem(_c.$(this));
			});
		},
		collapseAll: function() {
			var list;
			list = this;
			return this.find(list.options.itemNodeName).each(function() {
				return list.collapseItem(_c.$(this));
			});
		},
		setParent: function(li) {
			if (li.children(this.options.listNodeName).length) {
				return li.addClass('parent');
			}
		},
		unsetParent: function(li) {
			li.removeClass('parent ' + this.options.collapsedClass);
			return li.children(this.options.listNodeName).remove();
		},
		dragStart: function(e) {
			var depth, dragItem, i, items, mouse, offset, target;
			mouse = this.mouse;
			target = _c.$(e.target);
			dragItem = target.closest(this.options.itemNodeName);
			offset = dragItem.offset();
			this.placeEl.css('height', dragItem.height());
			mouse.offsetX = e.pageX - offset.left;
			mouse.offsetY = e.pageY - offset.top;
			mouse.startX = mouse.lastX = offset.left;
			mouse.startY = mouse.lastY = offset.top;
			this.dragRootEl = this.element;
			this.dragEl = _c.$(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
			this.dragEl.css('width', dragItem.width());
			draggingElement = this.dragEl;
			this.tmpDragOnSiblings = [dragItem[0].previousSibling, dragItem[0].nextSibling];
			dragItem.after(this.placeEl);
			dragItem[0].parentNode.removeChild(dragItem[0]);
			dragItem.appendTo(this.dragEl);
			_c.$body.append(this.dragEl);
			this.dragEl.css({
				left: offset.left,
				top: offset.top
			});
			i = void 0;
			depth = void 0;
			items = this.dragEl.find(this.options.itemNodeName);
			i = 0;
			while (i < items.length) {
				depth = _c.$(items[i]).parents(this.options.listNodeName).length;
				if (depth > this.dragDepth) {
					this.dragDepth = depth;
				}
				i++;
			}
			return html.addClass(this.options.movingClass);
		},
		dragStop: function() {
			var el, root;
			el = this.dragEl.children(this.options.itemNodeName).first();
			root = this.placeEl.parents('.' + this.options.listBaseClass + ':first');
			el[0].parentNode.removeChild(el[0]);
			this.placeEl.replaceWith(el);
			this.dragEl.remove();
			if (this.element[0] !== root[0]) {
				root.trigger('change.clique.nestable', [el, 'added', root, root.data('nestable')]);
				this.element.trigger('change.clique.nestable', [el, 'removed', this.element, this]);
			} else {
				this.element.trigger('change.clique.nestable', [el, 'moved', this.element, this]);
			}
			this.trigger('stop.clique.nestable', [this, el]);
			this.reset();
			return html.removeClass(this.options.movingClass);
		},
		dragMove: function(e) {
			var before, depth, isEmpty, isNewRoot, list, mouse, nestableitem, newAx, next, opt, parent, pointElRoot, prev, tmpRoot;
			list = void 0;
			parent = void 0;
			prev = void 0;
			next = void 0;
			depth = void 0;
			opt = this.options;
			mouse = this.mouse;
			this.dragEl.css({
				left: e.pageX - mouse.offsetX,
				top: e.pageY - mouse.offsetY
			});
			mouse.lastX = mouse.nowX;
			mouse.lastY = mouse.nowY;
			mouse.nowX = e.pageX;
			mouse.nowY = e.pageY;
			mouse.distX = mouse.nowX - mouse.lastX;
			mouse.distY = mouse.nowY - mouse.lastY;
			mouse.lastDirX = mouse.dirX;
			mouse.lastDirY = mouse.dirY;
			mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
			mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
			newAx = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;
			if (!mouse.moving) {
				mouse.dirAx = newAx;
				mouse.moving = true;
				return;
			}
			if (mouse.dirAx !== newAx) {
				mouse.distAxX = 0;
				mouse.distAxY = 0;
			} else {
				mouse.distAxX += Math.abs(mouse.distX);
				if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
					mouse.distAxX = 0;
				}
				mouse.distAxY += Math.abs(mouse.distY);
				if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
					mouse.distAxY = 0;
				}
			}
			mouse.dirAx = newAx;
			if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
				mouse.distAxX = 0;
				prev = this.placeEl.prev(opt.itemNodeName);
				if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
					list = prev.find(opt.listNodeName).last();
					depth = this.placeEl.parents(opt.listNodeName).length;
					if (depth + this.dragDepth <= opt.maxDepth) {
						if (!list.length) {
							list = _c.$('<' + opt.listNodeName + '/>').addClass(opt.listClass);
							list.append(this.placeEl);
							prev.append(list);
							this.setParent(prev);
						} else {
							list = prev.children(opt.listNodeName).last();
							list.append(this.placeEl);
						}
					}
				}
				if (mouse.distX < 0) {
					next = this.placeEl.next(opt.itemNodeName);
					if (!next.length) {
						parent = this.placeEl.parent();
						this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
						if (!parent.children().length) {
							this.unsetParent(parent.parent());
						}
					}
				}
			}
			isEmpty = false;
			if (!hasPointerEvents) {
				this.dragEl[0].style.visibility = 'hidden';
			}
			this.pointEl = _c.$(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
			if (!hasPointerEvents) {
				this.dragEl[0].style.visibility = 'visible';
			}
			if (this.pointEl.hasClass(opt.handleClass)) {
				this.pointEl = this.pointEl.closest(opt.itemNodeName);
			} else {
				nestableitem = this.pointEl.closest('.' + opt.itemClass);
				if (nestableitem.length) {
					this.pointEl = nestableitem.closest(opt.itemNodeName);
				}
			}
			if (this.pointEl.hasClass(opt.emptyClass)) {
				isEmpty = true;
			} else if (this.pointEl.data('nestable') && !this.pointEl.children().length) {
				isEmpty = true;
				this.pointEl = _c.$(this.tplempty).appendTo(this.pointEl);
			} else if (!this.pointEl.length || !this.pointEl.hasClass(opt.listitemClass)) {
				return;
			}
			pointElRoot = this.element;
			tmpRoot = this.pointEl.closest('.' + this.options.listBaseClass);
			isNewRoot = pointElRoot[0] !== this.pointEl.closest('.' + this.options.listBaseClass)[0];
			if (!mouse.dirAx || isNewRoot || isEmpty) {
				if (isNewRoot && opt.group !== tmpRoot.data('nestable-group')) {
					return;
				} else {
					touchedlists.push(pointElRoot);
				}
				depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;
				if (depth > opt.maxDepth) {
					return;
				}
				before = e.pageY < this.pointEl.offset().top + this.pointEl.height() / 2;
				parent = this.placeEl.parent();
				if (isEmpty) {
					this.pointEl.replaceWith(this.placeEl);
				} else if (before) {
					this.pointEl.before(this.placeEl);
				} else {
					this.pointEl.after(this.placeEl);
				}
				if (!parent.children().length) {
					if (!parent.data('clique.data.nestable')) {
						this.unsetParent(parent.parent());
					}
				}
				this.checkEmptyList(this.dragRootEl);
				this.checkEmptyList(pointElRoot);
				if (isNewRoot) {
					this.dragRootEl = tmpRoot;
					this.hasNewRoot = this.element[0] !== this.dragRootEl[0];
				}
			}
		},
		checkEmptyList: function(list) {
			list = list ? _c.$(list) : this.element;
			if (!list.children().length) {
				return list.find('.' + this.options.emptyClass).remove().end().append(this.tplempty);
			}
		}
	});
	return _c.nestable;
});
