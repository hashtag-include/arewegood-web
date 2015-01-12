'use strict';
var gulp = require('gulp');
var merge = require('merge-stream');
var nodemon = require('gulp-nodemon');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src('app/public/styles/main.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.csso())
        .pipe($.concat('main.css'))
        .pipe(gulp.dest('.build/public/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/public/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.uglify())
        .pipe($.concat('main.js'))
        .pipe(gulp.dest('.build/public/scripts'))
        .pipe($.size());
});

gulp.task('views', function () {
    return gulp.src(['app/views/**/*.jade'])
        .pipe(gulp.dest('.build/views'))
        .pipe($.size());
});

gulp.task('routes', function () {
    return gulp.src(['app/routes/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest('.build/routes'));
});

gulp.task('images', function () {
    return gulp.src('app/public/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('.build/public/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src('app/public/fonts/**/*')
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('.build/public/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return merge(
        gulp.src(['app/*.*'], { dot: true })
            .pipe(gulp.dest('.build')),
        gulp.src(['app/public/*.*'], { dot: true })
            .pipe(gulp.dest('.build/public'))
    );
});

gulp.task('clean', function () {
    return gulp.src(['.build'], { read: false }).pipe($.clean());
});

gulp.task('build', ['views', 'styles', 'scripts', 'images', 'fonts', 'extras', 'routes']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    nodemon({
        script: './bin/www',
        env: {
            'NODE_ENV': 'development'
        },
        nodeArgs: ['--debug']
    });
});

gulp.task('serve', ['default'], function () {
    gulp.start('connect');
    require('opn')('http://localhost:3000');
});

gulp.task('watch', ['serve'], function () {
    // watch for changes
    gulp.watch('app/public/styles/**/*.scss', ['styles']);
    gulp.watch('app/public/scripts/**/*.js', ['scripts']);
    gulp.watch('app/public/images/**/*', ['images']);
    gulp.watch('app/public/fonts/**/*', ['fonts']);
    gulp.watch('app/views/**/*.jade', ['views']);
    gulp.watch('app/routes/**/*.js', ['routes']);

    gulp.watch(['.build/views/**/*.jade', '.build/routes/**/*.js'], ['connect']);
});