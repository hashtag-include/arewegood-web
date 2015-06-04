'use strict';

var argv = require('yargs').argv;
var gulp = require('gulp');
var merge = require('merge-stream');
var opn = require('opn');
var $ = require('gulp-load-plugins')();

// config loading - this will later be replaced with conar and hulksmash will be removed
process.env.NODE_ENV = argv.production ? 'production' : 'development';
var config = require('./config');

gulp.task('styles', function() {
    var theme = gulp.src('app/public/styles/theme/**/*.css')
        .pipe($.if(argv.production, $.csso()))
        .pipe($.concat('theme.min.css'))
        .pipe(gulp.dest('.build/public/styles'))
        .pipe($.size());

    var custom = gulp.src(['app/public/styles/**/[^_]*.scss', '!app/public/styles/theme/**/[^_]*.scss'])
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.if(argv.production, $.csso()))
        .pipe($.concat('arewegood.min.css'))
        .pipe(gulp.dest('.build/public/styles'))
        .pipe($.size());

    return merge(custom, theme);
});

gulp.task('scripts', function() {
    var theme = gulp.src(['app/public/scripts/theme/metronic.js', 'app/public/scripts/theme/**/*.js'])
        .pipe($.if(argv.production, $.uglify()))
        .pipe($.concat('theme.min.js'))
        .pipe(gulp.dest('.build/public/scripts'))
        .pipe($.size());

    var custom = gulp.src(['app/public/scripts/**/*.js', '!app/public/scripts/theme/**/*.js'])
        .pipe($.if(!argv.production, $.jshint()))
        .pipe($.if(!argv.production, $.jshint.reporter(require('jshint-stylish'))))
        .pipe($.if(argv.production, $.uglify()))
        .pipe($.concat('arewegood.min.js'))
        .pipe(gulp.dest('.build/public/scripts'))
        .pipe($.size());
    
    return merge(custom, theme);
});

gulp.task('views', function() {
    return gulp.src(['app/views/**/*.jade'])
        .pipe(gulp.dest('.build/views'))
        .pipe($.size());
});

gulp.task('routes', function() {
    return gulp.src(['app/routes/**/*.js'])
        .pipe($.if(!argv.production, $.jshint()))
        .pipe($.if(!argv.production, $.jshint.reporter(require('jshint-stylish'))))
        .pipe(gulp.dest('.build/routes'));
});

gulp.task('models', function() {
    return gulp.src(['app/models/**/*.js'])
        .pipe($.if(!argv.production, $.jshint()))
        .pipe($.if(!argv.production, $.jshint.reporter(require('jshint-stylish'))))
        .pipe(gulp.dest('.build/models'));
});

gulp.task('helpers', function() {
    return gulp.src(['app/helpers/**/*.js'])
        .pipe($.if(!argv.production, $.jshint()))
        .pipe($.if(!argv.production, $.jshint.reporter(require('jshint-stylish'))))
        .pipe(gulp.dest('.build/helpers'));
});

gulp.task('images', function() {
    var theme = gulp.src('app/public/images/theme/**/*')
        .pipe($.if(argv.production, $.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('.build/public/images/theme'))
        .pipe($.size());
        
    var custom = gulp.src(['app/public/images/**/*', '!app/public/images/theme/**/*'])
        .pipe($.if(argv.production, $.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
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
        gulp.src(['app/public/plugins/**/*.*'], { dot: true })
            .pipe(gulp.dest('.build/public/plugins')),
        gulp.src(['app/*.*'], { dot: true })
            .pipe(gulp.dest('.build')),
        gulp.src(['app/public/*.*'], { dot: true })
            .pipe(gulp.dest('.build/public'))
    );
});

gulp.task('clean', function() {
    return gulp.src(['.build', '.sass-cache', '!.build/'], { read: false }).
        pipe($.clean());
});

gulp.task('build', ['views', 'styles', 'scripts', 'images', 'fonts', 'extras', 'routes', 'models', 'helpers']);

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

// This should be calling 'connect' before-hand, not 'up'
gulp.task('serve', ['connect'], function() {
    // open the browser too soon and you'll hit the page before connect can run (hardcode ftw)
    setTimeout(function() {
        var browserString = process.platform == 'win32' ? 'chrome'  // Windows
            : process.platform == 'darwin' ? 'google chrome'        // Mac OS
            : process.platform == 'linux' ? 'google-chrome'         // Linux OS
            : null;

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
    gulp.watch(['app/public/styles/**/*.scss', 'app/public/styles/**/*.css'], ['styles']);
    gulp.watch('app/public/scripts/**/*.js', ['scripts']);
    gulp.watch('app/public/images/**/*', ['images']);
    gulp.watch('app/public/fonts/**/*', ['fonts']);
    gulp.watch('app/public/plugins/**/*.*', ['extras']);
    gulp.watch('app/views/**/*.jade', ['views']);
    gulp.watch('app/routes/**/*.js', ['routes']);
    gulp.watch('app/models/**/*.js', ['models']);
    gulp.watch('app/helpers/**/*.js', ['helpers']);

    gulp.watch(['.build/views/**/*.jade', '.build/routes/**/*.js', '.build/models/**/*.js', '.build/helpers/**/*.js']);
});