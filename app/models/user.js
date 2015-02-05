var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    id: String,
    username: String,
    email: String,
    name: String,
    avatar: String
});

module.exports = mongoose.model('User', userSchema);