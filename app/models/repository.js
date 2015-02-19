'use strict';

var mongoose = require('mongoose');
var uuid = require('node-uuid');

// validates that a value is not null, undefined, or an empty string
function isNotEmpty(value) {
    return (value !== null && typeof(value) !== 'undefined' && value.length !== 0);
}

var repositorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: [isNotEmpty, 'name required']
    },
    fullName: {
        type: String,
        required: true,
        validate: [isNotEmpty, 'fullName required']
    },
    githubId: {
        type: String,
        required: true,
        validate: [isNotEmpty, 'githubId required']
    },
    key: {
        type: String,
        unique: true,
        default: function () {
            return uuid.v4().replace(/-/g, '');
        }
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    logs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Repository', repositorySchema);