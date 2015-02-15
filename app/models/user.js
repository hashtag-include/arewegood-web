var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    githubId: String,
    username: String,
    email: String,
    name: String,
    avatar: String,
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);