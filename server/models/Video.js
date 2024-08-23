const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    videoId: String,
    title: String,
    thumbnail: String,
    publishedAt: Date,
    watched: Boolean,
    channelId: String,
    channelTitle: String
});

module.exports = mongoose.model('Video', VideoSchema);
