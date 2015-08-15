(function(_c) {

	var touch = {},
		touchTimeout, tapTimeout, swipeTimeout, longTapTimeout, longTapDelay = 750,
		gesture;

	function swipeDirection(x1, x2, y1, y2) {
		return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? "Left" : "Right" : y1 - y2 > 0 ? "Up" : "Down";
	}

	function longTap() {
		longTapTimeout = null;
		if(touch.last) {
			touch.el.trigger("longTap");
			touch = {};
		}
	}

	function cancelLongTap() {
		if(longTapTimeout) {
			clearTimeout(longTapTimeout);
		}
		longTapTimeout = null;
	}

	function cancelAll() {
		if(touchTimeout) {
			clearTimeout(touchTimeout);
		}
		if(tapTimeout) {
			clearTimeout(tapTimeout);
		}
		if(swipeTimeout) {
			clearTimeout(swipeTimeout);
		}
		if(longTapTimeout) {
			clearTimeout(longTapTimeout);
		}
		touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
		touch = {};
	}

	function isPrimaryTouch(event) {
		return event.pointerType === event.MSPOINTER_TYPE_TOUCH && event.isPrimary;
	}

	_c.$(function() {
		var now, delta, deltaX = 0,
			deltaY = 0,
			firstTouch;
		if("MSGesture" in window) {
			gesture = new MSGesture();
			gesture.target = document.body;
		}
		_c.$(document).on("MSGestureEnd gestureend", function(e) {
			var swipeDirectionFromVelocity = e.originalEvent.velocityX > 1 ? "Right" : e.originalEvent.velocityX < -1 ? "Left" : e.originalEvent.velocityY > 1 ? "Down" : e.originalEvent.velocityY < -1 ? "Up" : null;
			if(swipeDirectionFromVelocity) {
				touch.el.trigger("swipe");
				touch.el.trigger("swipe" + swipeDirectionFromVelocity);
			}
		}).on("touchstart MSPointerDown pointerdown", function(e) {
			if(e.type === "MSPointerDown" && !isPrimaryTouch(e.originalEvent)) {
				return;
			}
			firstTouch = e.type === "MSPointerDown" || e.type === "pointerdown" ? e : e.originalEvent.touches[0];
			now = Date.now();
			delta = now - (touch.last || now);
			touch.el = _c.$("tagName" in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);
			if(touchTimeout) {
				clearTimeout(touchTimeout);
			}
			touch.x1 = firstTouch.pageX;
			touch.y1 = firstTouch.pageY;
			if(delta > 0 && delta <= 250) {
				touch.isDoubleTap = true;
			}
			touch.last = now;
			longTapTimeout = setTimeout(longTap, longTapDelay);
			if(gesture && (e.type === "MSPointerDown" || e.type === "pointerdown" || e.type === "touchstart")) {
				gesture.addPointer(e.originalEvent.pointerId);
			}
		}).on("touchmove MSPointerMove pointermove", function(e) {
			if(e.type === "MSPointerMove" && !isPrimaryTouch(e.originalEvent)) {
				return;
			}
			firstTouch = e.type === "MSPointerMove" || e.type === "pointermove" ? e : e.originalEvent.touches[0];
			cancelLongTap();
			touch.x2 = firstTouch.pageX;
			touch.y2 = firstTouch.pageY;
			deltaX += Math.abs(touch.x1 - touch.x2);
			deltaY += Math.abs(touch.y1 - touch.y2);
		}).on("touchend MSPointerUp pointerup", function(e) {
			if(e.type === "MSPointerUp" && !isPrimaryTouch(e.originalEvent)) {
				return;
			}
			cancelLongTap();
			if(touch.x2 && Math.abs(touch.x1 - touch.x2) > 30 || touch.y2 && Math.abs(touch.y1 - touch.y2) > 30) {
				swipeTimeout = setTimeout(function() {
					touch.el.trigger("swipe");
					touch.el.trigger("swipe" + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2));
					touch = {};
				}, 0);
			} else {
				if("last" in touch) {
					if(isNaN(deltaX) || deltaX < 30 && deltaY < 30) {
						tapTimeout = setTimeout(function() {
							var event = _c.$.Event("tap");
							event.cancelTouch = cancelAll;
							touch.el.trigger(event);
							if(touch.isDoubleTap) {
								touch.el.trigger("doubleTap");
								touch = {};
							} else {
								touchTimeout = setTimeout(function() {
									touchTimeout = null;
									touch.el.trigger("singleTap");
									touch = {};
								}, 250);
							}
						}, 0);
					} else {
						touch = {};
					}
					deltaX = deltaY = 0;
				}
			}
		}).on("touchcancel MSPointerCancel", cancelAll);
		_c.$(window).on("scroll", cancelAll);
	});
	["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap", "singleTap", "longTap"].forEach(function(eventName) {
		_c.$.fn[eventName] = function(callback) {
			return _c.$(this).on(eventName, callback);
		};
	});
})(Clique);
