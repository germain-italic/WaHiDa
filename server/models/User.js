const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    image: String,
    accessToken: String
});

module.exports = mongoose.model('User', UserSchema);
