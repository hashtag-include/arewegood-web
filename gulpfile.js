'use strict';

var gulp = require('gulp');
var merge = require('merge-stream');
var opn = require('opn');
var $ = require('gulp-load-plugins')();

// config loading - this will later be replaced with conar and hulksmash will be removed
process.env.NODE_ENV = 'development';
var config = require('./config');



gulp.task('styles', function() {
    return gulp.src('app/public/styles/**/*.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.csso())
        .pipe($.concat('arewegood.min.css'))
        .pipe(gulp.dest('.build/public/styles'))
        .pipe($.size());
});

gulp.task('scripts', function() {
    return gulp.src('app/public/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.uglify())
        .pipe($.concat('arewegood.min.js'))
        .pipe(gulp.dest('.build/public/scripts'))
        .pipe($.size());
});

gulp.task('views', function() {
    return gulp.src(['app/views/**/*.jade'])
        .pipe(gulp.dest('.build/views'))
        .pipe($.size());
});

gulp.task('routes', function() {
    return gulp.src(['app/routes/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest('.build/routes'));
});

gulp.task('models', function() {
    return gulp.src(['app/models/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest('.build/models'));
});

gulp.task('helpers', function() {
    return gulp.src(['app/helpers/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest('.build/helpers'));
});

gulp.task('images', function() {
    return gulp.src('app/public/images/**/*')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('.build/public/images'))
        .pipe($.size());
});

gulp.task('fonts', function() {
    return gulp.src('app/public/fonts/**/*')
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('.build/public/fonts'))
        .pipe($.size());
});

gulp.task('extras', function() {
    return merge(
        gulp.src(['app/*.*'], { dot: true })
            .pipe(gulp.dest('.build')),
        gulp.src(['app/public/*.*'], { dot: true })
            .pipe(gulp.dest('.build/public'))
    );
});

gulp.task('clean', function() {
    return gulp.src(['.build', '.sass-cache'], { read: false }).
        pipe($.clean());
});

gulp.task('build', ['views', 'styles', 'scripts', 'images', 'fonts', 'extras', 'routes', 'models', 'helpers']);

gulp.task('blah', ['clean']);

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});

gulp.task('connect', ['default'], function() {
    $.nodemon({
        script: './bin/www',
        env: {
            'NODE_ENV': 'development'
        },
        nodeArgs: ['--debug']
    });
});

gulp.task('serve', ['connect'], function() {
    // open the browser too soon and you'll hit the page before connect can run (hardcode ftw)
    setTimeout(function() {
        var browserString;

        switch(process.platform) {
            // Windows OS
            case 'win32':
                browserString = 'chrome';
                break;
            // Mac OS
            case 'darwin':
                browserString = 'google chrome';
                break;
            // Linux OS
            case 'linux':
                browserString = 'google-chrome';
                break;
            // Edge case, launch using default browser
            default:
                browserString = null;
                break;
        }

        opn(config.environment.fullUrl, browserString);
    }, 2500);
});

gulp.task('test', ['connect'], function() {
    // same as task.serve -- wait until previous tasks are done before running the tests. Shouldn't be required after gulp v4
    setTimeout(function() {
        gulp.src('./test', { read: false })
            .pipe($.mocha())
            .once('end', function() {
                process.exit();
            });
    }, 2500);
});

gulp.task('watch', ['serve'], function() {
    // watch for changes
    gulp.watch('app/public/styles/**/*.scss', ['styles']);
    gulp.watch('app/public/scripts/**/*.js', ['scripts']);
    gulp.watch('app/public/images/**/*', ['images']);
    gulp.watch('app/public/fonts/**/*', ['fonts']);
    gulp.watch('app/views/**/*.jade', ['views']);
    gulp.watch('app/routes/**/*.js', ['routes']);
    gulp.watch('app/models/**/*.js', ['models']);
    gulp.watch('app/helpers/**/*.js', ['helpers']);

    gulp.watch(['.build/views/**/*.jade', '.build/routes/**/*.js', '.build/models/**/*.js', '.build/helpers/**/*.js']);
});