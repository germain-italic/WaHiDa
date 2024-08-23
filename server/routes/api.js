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
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
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
        name: 'Uncategorized',
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
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// Get all topics for the logged-in user
router.get('/topics', ensureAuth, async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user.id });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new topic
router.post('/topics', ensureAuth, async (req, res) => {
  const topic = new Topic({
    name: req.body.name,
    user: req.user.id
  });

  try {
    const newTopic = await topic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    res.status(400).json({ message: err.message });
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