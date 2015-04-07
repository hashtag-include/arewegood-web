'use strict';

var Q = require('q');
var GitHubStrategy = require('passport-github').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');
var Repository = require('../models/repository');
var config = require('../../config');

// retrieves the authenticated user's primary github email
var getUserEmail = function(accessToken) {
    var deferred = Q.defer();
    var github = require('./github')(accessToken);

    // retrieve the user's email addresses
    github.user.getEmails({}, function(err, githubEmails) {
        if (err) {
            deferred.reject(err);
        }

        if(!githubEmails || !githubEmails.length) {
            deferred.reject('no primary email');
        }

        // iterate through the githubEmails and find their primary
        for(var i = 0; i < githubEmails.length; i++) {
            if(githubEmails[i].primary) {
                // return the user's primary email
                deferred.resolve(githubEmails[i].email);
            }
        }
        deferred.reject('no primary email');
    });

    return deferred.promise;
};

// retrieves the authenticated user's github repositories
// TODO: implement pagination, as right now it is limited to 100 repos
var getUserRepositories = function(accessToken) {
    var deferred = Q.defer();
    var github = require('./github')(accessToken);

    // TODO: On Feb 24th, remove the accept header
    // See here for more info: https://developer.github.com/changes/2015-01-07-prepare-for-organization-permissions-changes/
    github.config.headers.accept = 'application/vnd.github.moondragon+json';

    // retrieve the user's repos
    github.repos.getAll({}, function(err, githubRepos) {
        if (err) {
            deferred.reject(err);
        }

        var repositories = [];

        // iterate through the githubRepos and keep track of the names
        for(var i = 0; i < githubRepos.length; i++) {
            // repository doesn't exist, so create it
            repositories.push(new Repository({
                githubId: githubRepos[i].id,
                fullName: githubRepos[i].full_name, // jshint ignore:line
                owner: githubRepos[i].owner.login,
                name: githubRepos[i].name
            }));
        }
        deferred.resolve(repositories);
    });

    return deferred.promise;
};

// checks if a new repository already exists in the DB
// if it exists, it returns the existing one, otherwise returns the new (unsaved) one
var getRepository = function(repository) {
    var deferred = Q.defer();

    // check if the repo already exists
    Repository.findOne({ 'githubId': repository.githubId }, function(err, newRepository) {
        if (err) {
            deferred.reject(err);
        }

        // repo already exists, so return the existing one
        if(newRepository) {
            deferred.resolve(newRepository);
        }

        // repo doesn't exist, so return the newly created one
        deferred.resolve(repository);
    });

    return deferred.promise;
};

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
        scope: config.constants.github.scope
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
                    html_url: githubProfile._json.html_url,// jshint ignore:line
                    avatar: githubProfile._json.avatar_url // jshint ignore:line
                });


                // retrieve the user's email
                getUserEmail(accessToken).then(function(email) {
                    // update the newly created user with the retrieved email
                    newUser.email = email;

                    // pull the user's repositories
                    getUserRepositories(accessToken).then(function(repositories) {
                        if(repositories && repositories.length) {
                            var repoPromises = [];

                            // initiate promises for saving each repository
                            for(var i = 0; i < repositories.length; i++) {
                                var deferred = Q.defer();

                                // check if the repo already exists
                                getRepository(repositories[i]).then(function(repository) {
                                    repository.users.push(newUser._id); // add a reference of the new user to repo
                                    newUser.repositories.push(repository._id); // add a reference of the repository to the new user

                                    // save the new or updated repo
                                    repository.save(function(err) {
                                        if(err) {
                                            return done(err);
                                        }
                                    });
                                }).then(deferred.resolve); // jshint ignore:line

                                repoPromises.push(deferred.promise);
                            }

                            // wait for all repos to be saved
                            Q.all(repoPromises).then(function() {
                                console.log('done!');
                                // save the new user
                                newUser.save(function(err) {
                                    if(err) {
                                        return done(err);
                                    }

                                    // return the user to be serialized into the session
                                    return done(null, newUser);
                                });
                            }).fail(function(err) {
                                return done(err);
                            });
                        }
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