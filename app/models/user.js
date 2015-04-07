'use strict';

var mongoose = require('mongoose');

// validates that a value is not null, undefined, or an empty string
function isNotEmpty(value) {
    return (value !== null && typeof(value) !== 'undefined' && value.length !== 0);
}

var userSchema = mongoose.Schema({
    githubToken: {
        type: String,
        required: true,
        validate: [isNotEmpty, 'githubToken required']
    },
    githubId: {
        type: String,
        required: true,
        unique: true,
        validate: [isNotEmpty, 'githubId required']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: [isNotEmpty, 'username required']
    },
    email: {
        type: String,
        required: true,
        validate: [isNotEmpty, 'email required']
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    repositories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);