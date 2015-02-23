'use strict';

var SimpleResponse = require('./misc').SimpleResponse;

module.exports = {
    // forces an endpoint to use json
    // tryParse:bool - if set to true, we'll test for valid json with JSON.parse(). default: false
    forceJSON: function(tryParse) {
        tryParse = tryParse || false;

        return function(req, res, next) {
            // force application/json content-type
            if(!req.headers || !req.headers['content-type'] || req.headers['content-type'].toLowerCase() !== 'application/json') {
                return res.status(400).json(new SimpleResponse('error', 'content-type must be application/json'));
            }

            // force json in the body
            if (tryParse) {
                try {
                    JSON.parse(req.body);
                } catch (e) {
                    // respond with actual error, since a) this is user content
                    // and b) it's better to not swallow the contents of this error
                    return res.status(400).json(new SimpleResponse('error', e.message));
                }
            }
            return next();
        };
    },
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('/');
    }
};