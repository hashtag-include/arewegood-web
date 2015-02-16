'use strict';

var express = require('express');
var router = express.Router();

var Account = require('../models/account');
var Log = require('../models/log');

module.exports = function(passport) {
    // logs ======================================================================
    router.post('/logs/', passport.authenticate('bearer', { session: false }), function(req, res) {
        // force application/json content-type
        if(req.headers["content-type"] !== 'application/json') {
            return res.status(400).send('Error: content-type must be application/json');
        }

        if(!req.body.logs) {
            return res.status(400).send('Error: invalid body content');
        }

        Account.findOne({ 'key': req.user.key }, function(err, account) {
            if(err) {
                return res.status(500).send(err);
            }

            req.body.logs.forEach(function(log) {
                var newLog = new Log({
                    type: log.type,
                    data: JSON.stringify(log.data),
                    account: account._id
                });

                if(!newLog.type || !newLog.data) {
                    return res.status(400).send('Error: invalid body content');
                }

                newLog.save(function(err) {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    account.logs.push(newLog);

                    account.save(function(err) {
                        if (err) {
                            return handleError(err);
                        }

                        res.send(200);
                    });
                });
            });
        });
    });

    router.get('/logs', passport.authenticate('bearer', { session: false }), function(req, res) {
        Account.findOne({ 'key': req.user.key }).populate('logs').exec(function(err, account) {
            if(err) {
                return handleError(err);
            }

            res.send(account.logs);
        });
    });

    router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
        res.send('Welcome to our API!');
    });

    return router;
}