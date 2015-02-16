'use strict';

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Account = require('../models/account');
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
        User.findById(req.user._id).populate('account').exec(function(err, user) {
            if(err) {
                return handleError(err);
            }

            Account.findById(user.account._id).populate('logs').exec(function(err, account) {
                if(err) {
                    return handleError(err);
                }

                user.account = account;
                res.render('profile', {
                    user: user,
                });
            });
        });
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};