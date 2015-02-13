'use strict';

var express = require('express');
var router = express.Router();

var Log = require('../models/log');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}

function isSecure(req, res, next) {
    if (req.headers['x-forwarded-proto'] === 'https' || req.headers['x-arr-ssl'] || process.env.NODE_ENV === 'development'){
        return next();
    }
    res.redirect('https://' + req.headers.host + req.url);
}

module.exports = function(passport) {
    router.get('/', isSecure, function(req, res) {
        res.render('index');
    });

    router.get('/login', isSecure, passport.authenticate('github'), function() {
        // The request will be redirected to GitHub for authentication, so this function will not be called.
    });

    router.get('/login/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res) {
        res.redirect('/profile');
    });

    router.get('/profile', isSecure, isLoggedIn, function(req, res) {
        Log.find({ 'userId': req.user.id }, function (err, logs) {  // TODO: ajax this in instead of loading server-side
            res.render('profile', {
                user: req.user,
                logs: logs
            });
        });
        
    });

    router.get('/logout', isSecure, function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};