'use strict';

var GitHubApi = require('github');

// TODO: On Feb 24th, remove the accept header
// See here for more info: https://developer.github.com/changes/2015-01-07-prepare-for-organization-permissions-changes/

module.exports = function(token) {
    var github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https',
        headers: {
            'user-agent': 'hashtag-include',
            'accept': 'application/vnd.github.moondragon+json'
        }
    });

    github.authenticate({
        type: 'oauth',
        token: token
    });

    return github;
};