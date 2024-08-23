const express = require('express');
const { google } = require('googleapis');
const Video = require('../models/Video');
const router = express.Router();

router.get('/videos', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: req.user.accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    try {
        const subscriptions = await youtube.subscriptions.list({
            mine: true,
            part: 'snippet,contentDetails'
        });

        // Fetch videos for each subscription channel
        const videoData = await Promise.all(subscriptions.data.items.map(async sub => {
            const videos = await youtube.playlistItems.list({
                playlistId: sub.contentDetails.relatedPlaylists.uploads,
                part: 'snippet,contentDetails',
                maxResults: 10
            });
            return videos.data.items.map(video => ({
                channelId: sub.snippet.channelId,
                channelTitle: sub.snippet.title,
                videoId: video.contentDetails.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.default.url,
                publishedAt: video.contentDetails.videoPublishedAt,
                watched: false  // Default watched status (update logic needed)
            }));
        }));

        res.json(videoData.flat());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
