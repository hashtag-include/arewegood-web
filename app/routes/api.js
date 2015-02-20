'use strict';

var express = require('express');
var router = express.Router();

var Repository = require('../models/repository');
var Log = require('../models/log');
var middleware = require('../helpers/middleware');
var SimpleResponse = require('../helpers/misc').SimpleResponse;

module.exports = function(passport) {
    // logs ======================================================================
    router.post('/logs/', passport.authenticate('bearer', { session: false }), middleware.forceJSON, function(req, res) {
        // make sure logs are present in the request
        if(!req.body.logs) {
            return res.status(400).json(new SimpleResponse('error', 'invalid body content'));
        }

        // look up the repository by api key
        Repository.findOne({ 'key': req.user.key }, function(err, repository) {
            if(err) {
                return res.status(500).json(new SimpleResponse('error', err));
            }

            // iterate over each log in the request
            req.body.logs.forEach(function(log) {
                // create a new log using the repository id
                var newLog = new Log({
                    type: log.type.toLowerCase(),
                    data: JSON.stringify(log.data),
                    repository: repository._id
                });

                // validate that each log has both type and data
                if(!newLog.type || !newLog.data) {
                    return res.status(400).json(new SimpleResponse('error', 'invalid body content'));
                }

                // save the new log in the DB
                newLog.save(function(err) {
                    if (err) {
                        return res.status(500).json(new SimpleResponse('error', err));
                    }

                    // add the id of the new log as a reference in the repository
                    repository.logs.push(newLog);
                });
            });

            // save the updated repository
            repository.save(function(err) {
                if (err) {
                    return console.log(err);
                }

                res.send(200);
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