'use strict';

// Node doesn't have this. see https://github.com/mathiasbynens/String.prototype.startsWith
require('string.prototype.startswith');

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Repository = require('../models/repository');
var middleware = require('../helpers/middleware');
var SimpleResponse = require('../helpers/misc').SimpleResponse;

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

            // render the page with the injected content
            res.render('profile', {
                user: user
            });   
        });
    });

    // log the user out and return them to the homepage
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/:owner/:name', middleware.isLoggedIn, function(req, res) {
        Repository.findOne({ 'owner': req.params.owner, 'name': req.params.name }).populate('logs').exec(function(err, repository) {
            if(err) {
                return console.log(err);
            }

            if(!repository) {
                res.render('error', {
                    message: 'Not Found',
                    error: { status: 404}
                });
            }else if(repository.users.indexOf(req.user._id) === -1) {
                res.render('error', {
                    message: 'Unauthorized',
                    error: {}
                });
            } else {
                // render the page with the injected content
                res.render('repository', {
                    user: req.user,
                    repository: repository
                }); 
            }  
        });
    });

    // for repo searching typeahead on the /profile ui page
    // uses ?q=thing+to+search+for syntax
    router.get('/repo-search', middleware.isLoggedIn, function(req, res) {
        var query = req.query.q || null;

        User.findById(req.user._id).populate('repositories').exec(function(err, user) {
            if(err) {
                return res.status(500).json(new SimpleResponse('error', err));
            }
            if (query === null) {
                return res.send({repos: user.repositories});
            }

            var repos = [];
            for (var i = 0; i < user.repositories.length; i++) {
                var repo = user.repositories[i];
                if (repo.name.startsWith(query) || repo.fullName.startsWith(query)) {
                    repos.push(repo);
                }
            }
            res.send({repos: repos});
        });
    });

    return router;
};