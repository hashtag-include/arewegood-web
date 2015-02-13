'use strict';

var express = require('express');
var router = express.Router();

var Log = require('../models/log');

// logs ======================================================================
router.post('/logs', function(req, res) {
    var userId = req.body.userId;

    req.body.logs.forEach(function(log) {
        var newLog = new Log();

        newLog.userId = userId;
        newLog.type = log.type;
        newLog.data = JSON.stringify(log.data);

        newLog.save(function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
    });

    res.send(200);
});

router.get('/logs', function(req, res) {
    Log.find({ 'userId': req.query.userId }, function (err, logs) {
        res.send(logs);
    });
});

router.get('/', function(req, res) {
    res.send('Welcome to our API!');
});

module.exports = router;