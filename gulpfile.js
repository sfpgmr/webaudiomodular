!function(){
'use strict';

var CSSNEXT_DIR = './src';
var JS_SRC_DIR = './src';
var CSS_RELEASE_DIR = './';
var JS_RELEASE_DIR = './';

var path = require('path');
var gulp = require('gulp');
var logger = require('gulp-logger');
var watch = require('gulp-watch');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var atImport = require('postcss-import');
var source = require('vinyl-source-stream');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps')

// CSSのビルド
gulp.task('postcss', function() {
    gulp.src(path.join(CSSNEXT_DIR, '/**/*.css'), { base: CSSNEXT_DIR })
        .pipe(plumber())
        .pipe(postcss([
            atImport(),
            require('postcss-mixins')(),
            require('postcss-nested')(),
            require('postcss-simple-vars')(),
            require('cssnext')(),
//            require('cssnano')(),
            autoprefixer({ browsers: ['last 2 versions'] })
        ]))
        .pipe(gulp.dest(CSS_RELEASE_DIR))
        .pipe(logger({ beforeEach: '[postcss] wrote: ' }));
});
	
// JSのビルド
gulp.task('js',function(){
    gulp.src(path.join(JS_SRC_DIR, '/**/*.js'))
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(JS_RELEASE_DIR));
});

// ウォッチ
gulp.task('default',['js','postcss'],function(){
    gulp.watch(CSSNEXT_DIR + '/**/*.css',['postcss']);
    gulp.watch(JS_SRC_DIR + '/**/*.js',['js']);
});
}();