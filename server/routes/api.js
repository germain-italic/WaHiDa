const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Topic = require('../models/Topic');
const Channel = require('../models/Channel');

// Middleware to check if user is authenticated
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Fetch and store user's YouTube subscriptions
router.get('/fetch-subscriptions', ensureAuth, async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      '/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    let nextPageToken = '';
    let allSubscriptions = [];

    do {
      const response = await youtube.subscriptions.list({
        part: 'snippet',
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      allSubscriptions = allSubscriptions.concat(response.data.items);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    // Get or create the "Uncategorized" topic
    let uncategorizedTopic = await Topic.findOne({ user: req.user.id, isDefault: true });
    if (!uncategorizedTopic) {
      uncategorizedTopic = await Topic.create({
        name: 'Uncategorized subscriptions',
        user: req.user.id,
        isDefault: true
      });
    }

    // Store subscriptions in the database
    for (const sub of allSubscriptions) {
      await Channel.findOneAndUpdate(
        { youtubeId: sub.snippet.resourceId.channelId, user: req.user.id },
        {
          name: sub.snippet.title,
          description: sub.snippet.description,
          thumbnailUrl: sub.snippet.thumbnails.default.url,
          topic: uncategorizedTopic._id,
          user: req.user.id
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Subscriptions fetched and stored successfully' });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
});

// Get all topics for the logged-in user
router.get('/topics', ensureAuth, async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user._id });
    res.json(topics);
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get channels for a specific topic
router.get('/channels/:topicId', ensureAuth, async (req, res) => {
  try {
    const channels = await Channel.find({ topic: req.params.topicId, user: req.user._id });
    res.json(channels);
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new topic
router.post('/topics', ensureAuth, async (req, res) => {
  const topic = new Topic({
    name: req.body.name,
    user: req.user.id,
    isDefault: req.body.isDefault || false
  });

  try {
    const newTopic = await topic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Renaming a topic
router.patch('/topics/:topicId', ensureAuth, async (req, res) => {
  try {
    const updatedTopic = await Topic.findOneAndUpdate(
      { _id: req.params.topicId, user: req.user.id },
      { name: req.body.name },
      { new: true }
    );
    if (!updatedTopic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(updatedTopic);
  } catch (err) {
    console.error('Error renaming topic:', err);
    res.status(400).json({ message: err.message });
  }
});

// Deleting a topic
router.delete('/topics/:topicId', ensureAuth, async (req, res) => {
  try {
    console.log('Deleting topic:', req.params.topicId);
    const topicToDelete = await Topic.findOne({ _id: req.params.topicId, user: req.user.id });
    if (!topicToDelete) {
      console.log('Topic not found');
      return res.status(404).json({ message: 'Topic not found' });
    }
    console.log('Topic to delete:', topicToDelete);

    const defaultTopic = await Topic.findOne({ user: req.user.id, isDefault: true });
    if (!defaultTopic) {
      console.log('Default topic not found');
      return res.status(400).json({ message: 'Default topic not found' });
    }
    console.log('Default topic:', defaultTopic);

    const updateResult = await Channel.updateMany(
      { topic: topicToDelete._id, user: req.user.id },
      { $set: { topic: defaultTopic._id } }
    );
    console.log('Channels update result:', updateResult);

    const deleteResult = await Topic.deleteOne({ _id: req.params.topicId, user: req.user.id });
    console.log('Topic delete result:', deleteResult);

    res.json({ message: 'Topic deleted successfully' });
  } catch (err) {
    console.error('Error in delete topic route:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all channels for a topic
router.get('/topics/:topicId/channels', ensureAuth, async (req, res) => {
  try {
    const channels = await Channel.find({ topic: req.params.topicId, user: req.user.id });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Move a channel to a different topic
router.patch('/channels/:channelId/move', ensureAuth, async (req, res) => {
  try {
    const channel = await Channel.findOneAndUpdate(
      { _id: req.params.channelId, user: req.user.id },
      { topic: req.body.newTopicId },
      { new: true }
    );
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json(channel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;