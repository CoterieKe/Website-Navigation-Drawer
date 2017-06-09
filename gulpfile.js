const elixir = require('laravel-elixir');

var Task = Elixir.Task;
var closureCompiler = require('gulp-closure-compiler');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var pkg = require('./package.json');
var dateFormat = require('dateformat');
var version = pkg.version;

/**
 * This text that will be added to the minified files and may
 * contain author, license, version, website and other information
 * you would like displayed to anyone looking at the file.
 * I like to include information about when the file was last generated as
 * well
 *
 * @type {string}
 */
var banner = ['/*!\n',
    ' * <%= pkg.name %> v<%= pkg.version %>\n',
    ' * Copyright ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> \n',
    ' * Compiled '+ dateFormat() +'\n',
    ' */\n',
    ''
].join('');

/**
 * This task minifies the css file and appends the banner text declared above
 */
Elixir.extend('minifyCss', function( opt_source, opt_destination) {

    var paths = {
        'src': opt_source || './dist/css/style.css',
        'output': opt_destination || './dist/css'
    };

    new Task('minifyCss', function()
    {
        return gulp.src(this.src)
            .pipe(cleanCSS({ compatibility: 'ie8' }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(banner, { pkg: pkg }))
            .pipe(gulp.dest(this.output));
    }, paths);

});

/**
 * This task compiles, optimises and minifies your javascript
 */
Elixir.extend('compile', function( opt_namespace, opt_sources ) {

    var sources = opt_sources || [];

    var namespace = opt_namespace || 'coterie.init';

    var paths = {
        'src':sources,
        'output':'dist/js'
    };

    sources.push('src/js/**/*.js');

    sources.push('./node_modules/google-closure-library/closure/goog/**/*.js');

    new Task('compile', function()
    {
        return gulp.src(this.src)
            .pipe(closureCompiler({
                compilerPath: './node_modules/google-closure-compiler/compiler.jar',
                fileName: 'core.min.js',
                compilerFlags: {
                    closure_entry_point: namespace,
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    define: [
                        "goog.DEBUG=false"
                    ],
                    externs: [
                        //'bower_components/este-library/externs/react.js'
                    ],
                    extra_annotation_name: 'jsx',
                    only_closure_dependencies: true,
                    // .call is super important, otherwise Closure Library will not work in strict mode.
                    output_wrapper: '(function(){%output%}).call(window);',
                    warning_level: 'VERBOSE'
                }
            }))
            .pipe(header(banner, { pkg: pkg }))
            .pipe(gulp.dest(this.output));
    }, paths);

});



elixir(function(mix)
{
    mix.sass('./src/scss/style.scss','./dist/css/style.css');
    mix.minifyCss();
    mix.compile();
});
