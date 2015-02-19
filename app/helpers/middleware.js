'use strict';

var SimpleResponse = require('./misc').SimpleResponse;

module.exports = {
    // forces an endpoint to use json
    forceJSON: function(req, res, next) {
        // force application/json content-type
        if(!req.headers || !req.headers['content-type'] || req.headers['content-type'].toLowerCase() !== 'application/json') {
            return res.status(400).json(new SimpleResponse('error', 'content-type must be application/json'));
        }

        // force json in the body
        try {
            JSON.parse(req.body);
        } catch (e) {
            return res.status(400).json(new SimpleResponse('error', 'body must be valid json'));
        }

        return next();
    },
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('/');
    }
};