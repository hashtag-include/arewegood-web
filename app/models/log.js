'use strict';

var mongoose = require('mongoose');

// validates that a value is not null, undefined, or an empty string
function isNotEmpty(value) {
    return (value !== null && typeof(value) !== 'undefined' && value.length !== 0);
}

var logSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        lowercase: true,
        validate: [isNotEmpty, 'name required'],
        enum: ['trace', 'info', 'debug', 'error']
    },
    data: {
        type: String,
        required: true,
        validate: [isNotEmpty, 'name required']
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', logSchema);