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
    // force all routes to use ssl unless in dev environment
    forceSSL: function(req, res, next) {
        if (req.headers['x-forwarded-proto'] === 'https' || req.headers['x-arr-ssl'] || req.secure || process.env.NODE_ENV === 'development'){
            return next();
        }
        res.redirect('https://' + req.headers.host + req.url);
    },
    // validates that a user is currently signed in
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('/');
    }
};