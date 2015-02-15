'use strict';

var express = require('express');
var router = express.Router();

var Log = require('../models/log');

// logs ======================================================================
router.post('/logs', function(req, res) {
    // force application/json content-type
    if(req.headers["content-type"] !== 'application/json') {
        return res.status(400).send('Error: content-type must be application/json');
    }

    var userId = req.body.userId;
    var logs = req.body.logs;

    if(!userId || !logs) {
        return res.status(400).send('Error: invalid body content');
    }

    logs.forEach(function(log) {
        var newLog = new Log();

        newLog.userId = userId;
        newLog.type = log.type;
        newLog.data = JSON.stringify(log.data);

        if(!newLog.type || !newLog.data) {
            return res.status(400).send('Error: invalid body content');
        }

        newLog.save(function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
    });

    res.send(200);
});

router.get('/logs/:apiKey', function(req, res) {
    // make sure an api key is supplied 
    if(!req.params.apiKey) {
        return res.status(400).send('Error: invalid parameter');
    }

    Log.find({ 'userId': req.params.apiKey }, function (err, logs) {
        res.send(logs);
    });
});

router.get('/', function(req, res) {
    res.send('Welcome to our API!');
});

module.exports = router;