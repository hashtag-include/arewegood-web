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

module.exports = function(passport) {
    router.get('/', function(req, res) {
        res.render('index');
    });

    router.get('/login', passport.authenticate('github', { session: true }), function() {
        // The request will be redirected to GitHub for authentication, so this function will not be called.
    });

    router.get('/login/callback', passport.authenticate('github', { failureRedirect: '/', session: true }), function(req, res) {
        res.redirect('/profile');
    });

    router.get('/profile', isLoggedIn, function(req, res) {
        Log.find({ 'userId': req.user.id }, function (err, logs) {  // TODO: ajax this in instead of loading server-side
            res.render('profile', {
                user: req.user,
                logs: logs
            });
        });
        
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};