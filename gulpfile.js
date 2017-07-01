'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: true });
var args = require('yargs').argv;

gulp.task('zip', () => {

  return gulp
    .src('./build/**/')
    .pipe($.zip('archive.zip'))
    .pipe(gulp.dest('./'))
});

gulp.task('build', ['clean'], () => {

  var uglifyjs = require('uglify-es');
  var composer = require('gulp-uglify/composer');
  var minify = composer(uglifyjs, console);

  var checkJsCondition = function (file) {
    if (!(args.production)) {
      return false;
    }
    return /^(?:(?!\.min).)*\.js$/.test(file.history[0]);
  }

  return gulp
    .src('./src/**/*.*', { base: './src/' })
    .pipe($.if(args.verbose, $.print()))
    .pipe($.if('*.html', $.minifyHtml({ empty: true })))
    .pipe($.if('*.css', $.csso()))
    .pipe($.if(checkJsCondition, minify().on('error', function (err) {
      $.util.log($.util.colors.red('[Error]'), err.toString());
    })))
    .pipe(gulp.dest('./build/'));
});

gulp.task('clean', (cb) => {

  var rimraf = require('rimraf');

  log('Clean task is started...');
  rimraf('./build', cb);
});

gulp.task('vet', () => {

  return gulp
    .src('./src/js/*.js')
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }))
    .pipe($.jshint.reporter('fail'));
});

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}
