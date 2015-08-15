
var filepaths = require('./scripts/filepaths');

/*global module:false*/
module.exports = function(grunt) {

	// ========================================================================
	// Grunt modules
	// ========================================================================

	require('load-grunt-tasks')(grunt);

	// Less Files -
	//   This object represents the Less files that are to be compiled
	// ========================================================================
	var lessfiles = {
		app : [
			'main'
		],
		clique : [
			'clique',
			// 'components/slideshow',
		]
	};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner : '/*!\n' +
			' * <%= pkg.title || pkg.name %> - <%= pkg.description %>\n' +
			' * \n' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
			' * \n' +
			' * Licensed under the MIT license:\n' +
			' *    http://www.opensource.org/licenses/mit-license.php\n' +
			' * \n' +
			' * Project home:\n' +
			' *    <%= pkg.homepage %>\n' +
			' * \n' +
			' * Version:  <%= pkg.version %>\n' +
			' * \n' +
			' */\n\n',
		less: {
			options: {
				sourceMap : true,
				// ieCompat : false,
				sourceMapFileInline : true
			},
			all: {
				files: filepaths.less(lessfiles)
			}
		},
		coffee: {
			options: {
				join: false,
				bare: true
			},
			app: {
				files: [{
					expand: true,
					cwd: 'build/coffee',
					src: ['*.coffee'],
					dest: 'js',
					ext: '.js',
					extDot : 'last'
				}]
			}
		},
		watch: {
			less: {
				files: [ 'build/less/**/*.less', 'Gruntfile.js' ],
				tasks: [ 'less' ]
			},
			coffee: {
				files: [ 'build/coffee/**/*.coffee', 'Gruntfile.js' ],
				tasks: [ 'newer:coffee' ]
			},
			js: {
				files: [ 'build/js/**/*.js', 'Gruntfile.js' ],
				tasks: [ 'newer:uglify' ]
			},
		},
		concat : {
			options : {
				stripBanners : {
					block : true,
					line : true
				}
			},
		},
		cssmin : {
			combine: {
				options : {
					compatibility : '*',
					keepSpecialComments : 0,
					restructuring : false
				},
				files: [{
					expand: true,
					cwd: 'css',
					src: ['*.css', '!*.min.css'],
					dest: 'css',
					ext: '.min.css',
					extDot : 'last'
				}]
			}
		},
		uglify: {
			options : {
				preserveComments : false,
				screwIE8 : true
			},
			build: {
				options: {
					mangle : false,
					compress : false,
					beautify : {
						beautify : true,
						bracketize : true
					},
				},
				files: [{
					expand: true,
					cwd: 'build/js/clique',
					src: ['**/*.js', '!**/_*.js'],
					dest: 'js'
				}]
			},
			app: {
				options: {
					mangle : false,
					compress : false,
					beautify : {
						beautify : true,
						bracketize : true
					},
				},
				files: [{
					expand: true,
					cwd: 'build/js/app',
					src: '**/*.js',
					dest: 'js'
				}]
			},
			lib: {
				files: [{
					expand: true,
					cwd: 'js/lib',
					src: ['*.js', '!*.min.js'],
					dest: 'js/lib',
					ext: '.min.js',
					extDot : 'last'
				}]
			},
			core : {
				files: [{
					expand: true,
					cwd: 'js/core',
					src: ['*.js', '!*.min.js'],
					dest: 'js/core',
					ext: '.min.js',
					extDot : 'last'
				}]
			},
			custom: {
				files: [{
					expand: true,
					cwd: 'js',
					src: ['*.js', '!*.min.js'],
					dest: 'js',
					ext: '.min.js',
					extDot : 'last'
				}]
			},
		},
		jsbeautifier: {
			options: {
				html: {
					fileTypes: [".php"],
					braceStyle: "collapse",
					indentChar: "\t",
					indentSize: 1,
					maxPreserveNewlines: 10,
					preserveNewlines: true,
					unformatted: ["a", "sub", "sup", "b", "u", "pre", "code"],
					wrapLineLength: 0,
					endWithNewline: true
				},
				css: {
					fileTypes: [".less"],
					indentChar: "\t",
					indentSize: 1
				},
				js: {
					braceStyle: "collapse",
					breakChainedMethods: false,
					e4x: false,
					evalCode: false,
					indentLevel: 0,
					indentWithTabs: true,
					jslintHappy: false,
					keepArrayIndentation: false,
					keepFunctionIndentation: false,
					spaceAfterAnonFunction: false,
					maxPreserveNewlines: 10,
					preserveNewlines: true,
					spaceBeforeConditional: false,
					spaceInParen: false,
					unescapeStrings: false,
					wrapLineLength: 0,
					endWithNewline: true
				}
			},
			css : {
				src: ['css/**/*'],
				filter : function(filepath) {
					return filepath.indexOf('.min') < 0
				}
			},
			js : {
				src: ['js/**/*', '!js/plugins/*', '!js/lib/*'],
				filter : function(filepath) {
					return filepath.indexOf('.min') < 0
				}
			},
		},
		csscomb: {
			options: {
				config: '.csscomb.json'
			},
			css: {
				files: [{
					expand: true,
					cwd: 'css',
					src: ['*.css', '!*.min.css'],
					dest: 'css',
					ext: '.css',
					extDot : 'last'
				}]
			},
		},
		jshint: {
			options : {
				jshintrc : '.jshintrc',
				reporter: require('jshint-html-reporter'),
				reporterOutput: 'tests/results/jshint-report.html',
				force: true
			},
			all : ['js/*.js']
		},
	});

	// Custom Tasks
	grunt.registerTask(
		'build-css',
		'Builds, cleans, and optmiizes the CSS from .less files',
		['less', 'cssmin', 'csscomb', 'jsbeautifier:css']
	);
	grunt.registerTask(
		'build-js',
		'Builds, cleans, and optmiizes the JS from .coffee files',
		['coffee', 'concat', 'uglify', 'jsbeautifier:js']
	);

	grunt.registerTask( 'build', [ 'build-css', 'build-js' ] );
	grunt.registerTask( 'dev', [ 'less', 'coffee' ] );
	grunt.registerTask( 'default', [ 'watch' ] );

};
