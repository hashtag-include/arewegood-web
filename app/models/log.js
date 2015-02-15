var mongoose = require('mongoose');

var logSchema = mongoose.Schema({
    type: String,
    data: String,
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);