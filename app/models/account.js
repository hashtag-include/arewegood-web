var mongoose = require('mongoose');

var accountSchema = mongoose.Schema({
    name: String,
    key: mongoose.Schema.ObjectId,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Account', accountSchema);