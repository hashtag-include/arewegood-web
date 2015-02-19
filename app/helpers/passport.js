'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');
var Repository = require('../models/repository');
var config = require('../../config');

module.exports = function(passport) {
    // serializes the user into the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // deserializes the user from the session into a user model
    passport.deserializeUser(function(user, done) {
        User.findById(user._id, function(err, user) {
            done(err, user);
        });
    });

    // github oauth strategy for passport
    passport.use(new GitHubStrategy({
        clientID: config.authentication.github.clientId,
        clientSecret: config.authentication.github.clientSecret,
        scope: config.constants.github.api.scope
    },
    function(accessToken, refreshToken, githubProfile, done) {
        // retrieve the user from the DB matching the signed in account's github id
        User.findOne({ 'githubId': githubProfile.id }, function(err, user) {
            if (err) { return done(err); }

            // if the user already exists in the DB, update the githubToken as well as avatar
            if (user) {
                user.githubToken = accessToken;
                user.avatar = githubProfile._json.avatar_url // jshint ignore:line

                // save and return the updated user
                user.save(function(err) {
                    if (err) { return done(err); }

                    return done(null, user);
                });
            } else {
                // user doesn't exist, so create it
                var newUser = new User({
                    githubToken: accessToken,
                    githubId: githubProfile.id,
                    username: githubProfile._json.login,
                    name: githubProfile._json.name,
                    avatar: githubProfile._json.avatar_url // jshint ignore:line
                });

                // retrieve the user's email addresses
                var github = require('./github')(accessToken);
                github.user.getEmails({}, function(err, emails) {
                    if (err) { return done(err); }

                    // iterate through the emails and find their primary
                    for(var i = 0; i < emails.length; i++) {
                        if(emails[i].primary) {
                            // update the user with the primary email
                            newUser.email = emails[i].email;
                            break;
                        }
                    }

                    // save the user in the DB and allow it to be serialized
                    newUser.save(function(err) {
                        if (err) {
                            return done(err);
                        }

                        return done(null, newUser);
                    });
                });
            }
        });
    }));

    // bearer strategy for passport, used in the api
    passport.use(new BearerStrategy(
        function(key, done) {
            // validates that the key matches a repository 
            Repository.findOne({ key: key }, function (err, repository) {
                if (err) { return done(err); }

                if (!repository) {
                    return done(null, false);
                }

                return done(null, repository, { scope: 'all' });
            });
        }
    )); 
};