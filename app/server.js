var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var subdomain = require('express-subdomain');

var middleware = require('./helpers/middleware');

var server = express();

// configuration ===============================================================
var config = require('../config');
mongoose.connect(config.authentication.database.connect); // connect to our database
require('./helpers/passport')(passport);

// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');

// required for passport
server.use(session({ secret: config.authentication.session.secret, resave: false, saveUninitialized: false })); // session secret
server.use(passport.initialize());
server.use(passport.session()); // persistent login sessions

server.use(favicon(__dirname + '/public/favicon.ico'));
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, 'public')));

// force all routes to use ssl unless in dev environment
server.use(middleware.forceSSL);

// routes ======================================================================
server.use(subdomain('api', require('./routes/api')(passport))); // load our api routes and configure them to use the api subdomain
server.use(require('./routes/main')(passport)); // load our main routes and pass in our fully configured passport

// error handlers ======================================================================
// catch 404 and forward to error handler
server.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (server.get('env') === 'development') {
    server.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = server;