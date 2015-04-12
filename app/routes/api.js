'use strict';

var Q = require('q');
var express = require('express');
var router = express.Router();

var Repository = require('../models/repository');
var Log = require('../models/log');
var middleware = require('../helpers/middleware');
var SimpleResponse = require('../helpers/misc').SimpleResponse;

module.exports = function(passport) {
    // logs ======================================================================
    router.post('/logs', passport.authenticate('bearer', { session: false }), middleware.forceJSON(), function(req, res) {
console.log(req.body);        
// make sure logs are present in the request
        if(!req.body.logs) {
            res.status(400).json(new SimpleResponse('error', 'invalid body content'));
        }

        // look up the repository by api key
        Repository.findOne({ 'key': req.user.key }, function(err, repository) {
            if(err) {
                return res.status(500).json(new SimpleResponse('error', err));
            }

            var logPromises = [];

            // iterate over each log in the request
            req.body.logs.forEach(function(log) {
                var deferred = Q.defer();

                // create a new log using the repository id
                var newLog = new Log({
                    type: log.type.toLowerCase(),
                    data: JSON.stringify(log.data),
                    repository: repository._id
                });

                // validate that each log has both type and data
                if(!newLog.type || !newLog.data) {
                    deferred.reject('invalid body content');
                }

                // save the new log in the DB
                newLog.save(function(err) {
                    if (err) {
                        deferred.reject(err);
                    }

                    // add the id of the new log as a reference in the repository
                    repository.logs.push(newLog);
                    deferred.resolve();
                });

                logPromises.push(deferred.promise);
            });

            Q.all(logPromises).then(function() {
                // save the updated repository
                repository.save(function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    res.status(200).end();
                });
            }).fail(function(err) {
                return res.status(500).json(new SimpleResponse('error', err));
            });
        });
    });

    router.get('/logs', passport.authenticate('bearer', { session: false }), function(req, res) {
        // look up the repository by api key and populate the logs
        Repository.findOne({ 'key': req.user.key }).populate('logs').exec(function(err, repository) {
            if(err) {
                return res.status(500).json(new SimpleResponse('error', err));
            }

            res.json(repository.logs);
        });
    });

    return router;
};