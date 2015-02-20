'use strict';

var GitHubApi = require('github');

module.exports = function(token) {
    var github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https',
        headers: {
            'user-agent': 'hashtag-include'
        }
    });

    github.authenticate({
        type: 'oauth',
        token: token
    });

    return github;
};