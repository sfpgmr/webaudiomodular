!function(){
'use strict';

var CSSNEXT_DIR = './src';
var JS_SRC_DIR = './src';
var CSS_RELEASE_DIR = './dist';
var JS_RELEASE_DIR = './dist';
var HTML_SRC_DIR = './src';
var HTML_RELEASE_DIR = './dist';

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
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');


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
    browserify('./src/script.js',{debug:true})
    .transform(babelify)
    .transform({global:true},uglifyify)
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist'));
    
    // gulp.src(path.join(JS_SRC_DIR, 'script.js'))
    // .pipe(sourcemaps.init())
    // .pipe(plumber())
    // .pipe(babel())
    // .pipe(sourcemaps.write())
    // .pipe(gulp.dest(JS_RELEASE_DIR));
});

//HTMLのビルド
gulp.task('html',function(){
  gulp.src('./src/*.html').pipe(gulp.dest('./dist'));
});

// gistディレクトリへのコピー
gulp.task('gist',function(){
  gulp.src('./dist/*.html').pipe(gulp.dest('./gist'));
  gulp.src('./dist/*.css').pipe(gulp.dest('./gist'));
  gulp.src('./dist/*.js').pipe(gulp.dest('./gist'));
});

// ウォッチ
gulp.task('default',['html','js','postcss'],function(){
    gulp.watch(CSSNEXT_DIR + '/**/*.css',['postcss']);
    gulp.watch(JS_SRC_DIR + '/**/*.js',['js']);
    gulp.watch(HTML_SRC_DIR + '/**/*.html',['html']); 
});
}();