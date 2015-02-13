'use strict';
var GitHubStrategy = require('passport-github').Strategy;

var User = require('../models/user');
var config = require('../../config');

// expose this function to our app using module.exports
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        User.findOne({ 'id':  user.id }, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GitHubStrategy({
        clientID: config.authentication.github.clientId,
        clientSecret: config.authentication.github.clientSecret,
        callbackURL: '/login/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({ 'id':  profile.id }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (user) {
                    return done(null, user);
                } else {
                    var newUser = new User();

                    newUser.id = profile.id;
                    newUser.username = profile.login;
                    newUser.email = profile.email;
                    newUser.name = profile.name;
                    newUser.avatar = profile.avatar_url; // jshint ignore:line

                    // save the user
                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        
                        return done(null, newUser);
                    });
                }
            });
        }); 
    }));
};