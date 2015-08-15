(function(_c) {
	var GLOBALS, fixedNavbar, parallaxHeader, setActiveNavbar;
	GLOBALS = {
		header: _c.$('.header').height(),
		nav: {
			top: 0,
			left: 0,
			width: 0
		}
	};
	parallaxHeader = function(y) {
		var h1, h2, percentage;
		percentage = y / GLOBALS.header;
		_c.$('.header-cover').css('top', percentage * (GLOBALS.header * 0.22));
		h1 = _c.$('.header-center h1');
		if(y <= h1.offset().top + h1.height()) {
			h1.css('top', percentage * (GLOBALS.header * -0.17));
		}
		h2 = _c.$('.header-center h2');
		if(y <= h2.offset().top + h2.height()) {
			return h2.css('top', percentage * (GLOBALS.header * -0.11));
		}
	};
	fixedNavbar = function(y) {
		var aside;
		aside = _c.$('.aside-inner');
		if(y < GLOBALS.header) {
			if(aside.hasClass('aside-fixed')) {
				return aside.removeClass('aside-fixed').removeAttr('style');
			}
		} else {
			if(!aside.hasClass('aside-fixed')) {
				aside.addClass('aside-fixed').css({
					top: GLOBALS.nav.top,
					left: GLOBALS.nav.left
				});
			}
			return aside.width(GLOBALS.nav.width);
		}
	};
	setActiveNavbar = function(y) {
		var articles;
		if(y === _c.$html.height() - _c.$win.height()) {
			_c.$('.nav-side li').removeClass('active');
			_c.$('.nav-side li:last-child').addClass('active');
			return;
		}
		articles = _c.$(_c.$('.article').get().reverse());
		return articles.each(function(i) {
			var id, parent;
			if(y >= _c.$(this).offset().top) {
				id = _c.$(this).attr('id');
				parent = _c.$("[href='#" + id + "']").parent();
				if(parent.hasClass('active')) {
					return false;
				}
				parent.siblings().removeClass('active');
				parent.addClass('active');
				return false;
			}
		});
	};
	_c.$html.on('click', '.nav-side a', function(e) {
		var id, parent;
		e.preventDefault();
		id = _c.$(this).attr('href');
		parent = _c.$(this).parent();
		return _c.$('html, body').stop().animate({
			scrollTop: _c.$(id).offset().top
		}, function() {
			parent.siblings().removeClass('active');
			return parent.addClass('active');
		});
	});
	_c.$doc.on('ready reloaded.clique.dom', function() {
		var parent;
		GLOBALS.header = _c.$('.header').height();
		parent = _c.$('.aside-inner').parent();
		return GLOBALS.nav = {
			top: parseInt(_c.$('.header + *').css('paddingTop'), 10),
			left: parent.offset().left - parseInt(parent.css('paddingLeft'), 10),
			width: parent.width()
		};
	});
	_c.$doc.on('ready scrolling.clique.dom reloaded.clique.dom', function(e, memory) {
		var y;
		y = memory ? memory.y : _c.$win.scrollTop();
		if(y < GLOBALS.header) {
			parallaxHeader(y);
		} else {
			setActiveNavbar(y);
		}
		return fixedNavbar(y);
	});
	_c.$win.on('resize', function() {
		return _c.$('.demo-output pre').text('Resizing');
	});
	return _c.$win.on('resizeend', function() {
		return _c.$('.demo-output pre').text('Resizing Complete!');
	});
})(Clique);
