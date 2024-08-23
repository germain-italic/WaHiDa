const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
  youtubeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  thumbnailUrl: String,
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Channel', ChannelSchema);