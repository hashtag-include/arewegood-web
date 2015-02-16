var mongoose = require('mongoose');
var uuid = require('node-uuid');

var accountSchema = mongoose.Schema({
    name: String,
    key: { type: String, default: function () { return uuid.v4(); }},
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Account', accountSchema);