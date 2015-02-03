'use strict';
var Log = require('../models/log');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}

module.exports = function(server, passport) {
    server.get('/', function(req, res) {
        res.render('index');
    });

    server.get('/login', passport.authenticate('github'), function() {
        // The request will be redirected to GitHub for authentication, so this function will not be called.
    });

    server.get('/login/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res) {
        res.redirect('/profile');
    });

    server.get('/profile', isLoggedIn, function(req, res) {
        Log.find({ 'userId': req.user.id }, function (err, logs) {
            res.render('profile', {
                user: req.user,
                logs: logs
            });
        });
        
    });

    server.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // logs ======================================================================
    server.post('/logs', function(req, res) {
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

    server.get('/logs', function(req, res) {
        Log.find({ 'userId': req.query.userId }, function (err, logs) {
            res.send(logs);
        });
    });
};