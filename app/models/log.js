var mongoose = require('mongoose');

var logSchema = mongoose.Schema({
    userId: String,
    type: String,
    data: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);