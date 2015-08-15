
var path = require('path');

var replace = [
	{
		find : 'clique/core/core.coffee',
		replace : 'lib/clique.core.coffee'
	},
	{
		find : 'clique/core',
		replace : 'plugins'
	},
	{
		find : 'clique/components',
		replace : 'plugins'
	},
	{
		find : 'build/coffee/app/',
		replace : ''
	},
	{
		find : 'build/coffee/',
		replace : ''
	},
];
function findAndReplace(src) {
	var dest = src;
	for(var i = 0; i < replace.length; i++) {
		var obj = replace[i];
		dest = dest.replace(obj.find, obj.replace);
	}
	return dest;
}

module.exports = {

	// Filter .less files
	// ========================================================================

	less : function(object) {
		/*
			Output:
				{
					"css/clique.css" : ["build/less/clique/clique.less"],
					"css/offcanvas.css" : ["build/less/clique/components/offcanvas.less"],
					"css/main.css" : ["build/less/custom/main.less"],
				}
		*/
		var output = {};
		var keys = Object.keys(object);
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var files = object[key];
			for(var n = 0; n < files.length; n++) {
				var src = path.join('build', 'less', key, files[n] + '.less');
				var basename = path.basename(src).replace('.less', '.css');
				var dest = path.join('css', basename);
				output[dest] = [src];
			}
		}
		return output;
	},

	// Filter .coffee files
	// ========================================================================
	coffee : function(object) {
		/*
			Output:
				{
					"js/lib/clique.core.js" : ["build/coffee/clique/core/core.coffee"],
					"js/plugins/clique.dropdown.js" : ["build/coffee/clique/core/dropdown.coffee"],
					"js/functions.js" : ["build/coffee/custom/functions.coffee"],
				}
		*/
		var output = {};
		var keys = Object.keys(object);
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var files = object[key];
			for(var n = 0; n < files.length; n++) {
				var src = path.join('build', 'coffee', key, files[n] + '.coffee');
				var dest = path.join('js', findAndReplace(src).replace('.coffee', '.js'));
				output[dest] = [src];
			}
		}
		return output;
	}
};

