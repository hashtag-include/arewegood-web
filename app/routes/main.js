'use strict';

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var middleware = require('../helpers/middleware');


module.exports = function(passport) {
    // root endpoint, renders the homepage
    router.get('/', function(req, res) {
        res.render('index');
    });

    // the request will be redirected to GitHub for authentication, so this function will not be called.
    router.get('/login', passport.authenticate('github', { session: true }));

    // called by github after the user is authenticated
    router.get('/login/callback', passport.authenticate('github', { failureRedirect: '/', session: true }), function(req, res) {
        res.redirect('/profile');
    });

    // TODO: All of this is temporary strictly for demo and testing purposes, and will eventually be ajaxed in
    //  there should be a separate api endpoint for retrieving user details for ajax, and will use the github module instead of request
    router.get('/profile', middleware.isLoggedIn, function(req, res) {
        User.findById(req.user._id).populate('repositories').exec(function(err, user) {
            if(err) {
                return console.log(err);
            }

            // retrieve the user's email addresses
            var github = require('../helpers/github')(req.user.githubToken);
            github.repos.getAll({}, function(err, repositories) {
                if (err) {
                    return res.status(500).send(err);
                }

                var availableRepositories = [];

                // iterate through the repositories and keep track of the names
                for(var i = 0; i < repositories.length; i++) {
                    availableRepositories.push(repositories[i].full_name); // jshint ignore:line
                }

                // render the page with the injected content
                res.render('profile', {
                    user: user,
                    availableRepositories: JSON.stringify(availableRepositories)
                });                
            });
        });
    });

    // log the user out and return them to the homepage
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};