'use strict';
var GitHubStrategy = require('passport-github').Strategy;
var request = require('request');

var User = require('../models/user');
var Account = require('../models/account');
var config = require('../../config');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        User.findById(user._id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GitHubStrategy({
        clientID: config.authentication.github.clientId,
        clientSecret: config.authentication.github.clientSecret,
        scope: 'repo, user'
    },
    function(accessToken, refreshToken, githubProfile, done) {
        User.findOne({ 'githubId': githubProfile.id }, function(err, user) {
            if (err) return handleError(err);

            if (user) {
                return done(null, user);
            } else {
                var newAccount = new Account({
                    name: 'hashtag-include'
                });

                // save the user
                newAccount.save(function(err) {
                    if (err) return handleError(err);

                    var newUser = new User({
                        githubId: githubProfile.id,
                        username: githubProfile._json.login,
                        name: githubProfile._json.name,
                        avatar: githubProfile._json.avatar_url, // jshint ignore:line
                        account: newAccount._id
                    });

                    // retrieve the user's email address
                    var requestOptions = {
                        url: 'https://api.github.com/user/emails?access_token=' + accessToken,
                        headers: {
                            'User-Agent': 'hashtag-include'
                        }
                    };
                    request(requestOptions, function (err, res, body) {
                        if (!err && res.statusCode == 200) {
                            var emails = JSON.parse(body);
                            for(var i = 0; i < emails.length; i++) {
                                if(emails[i]['primary']) {
                                    newUser.email = emails[i]['email'];
                                    break;
                                }
                            }
                        }
                        
                        newUser.save(function(err) {
                            if (err) return handleError(err);

                            newAccount.users.push(newUser);
                            newAccount.save(function(err) {
                                if (err) return handleError(err);

                                return done(null, newUser);
                            });
                        });
                    });
                    
                });
            }
        });
    }));
};