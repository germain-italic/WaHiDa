const express = require('express');
const router = express.Router();

// Mock data for demonstration
const MOCK_DATA = {
  topics: [
    {
      name: "Football Videos",
      channels: [
        {
          name: "UEFA",
          videos: [
            { id: 1, title: "Champions League Highlights", thumbnail: "/api/placeholder/320/180", duration: "10:30", watched: false, liked: false },
            { id: 2, title: "Euro 2024 Qualifiers", thumbnail: "/api/placeholder/320/180", duration: "15:45", watched: true, liked: true },
          ]
        },
        {
          name: "FIFA",
          videos: [
            { id: 3, title: "World Cup 2026 News", thumbnail: "/api/placeholder/320/180", duration: "8:20", watched: false, liked: false },
            { id: 4, title: "Best Goals of 2023", thumbnail: "/api/placeholder/320/180", duration: "12:10", watched: true, liked: false },
          ]
        }
      ]
    },
    {
      name: "Music Videos",
      channels: [
        {
          name: "Vevo",
          videos: [
            { id: 5, title: "Top Hits This Week", thumbnail: "/api/placeholder/320/180", duration: "20:15", watched: false, liked: false },
            { id: 6, title: "New Artist Spotlight", thumbnail: "/api/placeholder/320/180", duration: "7:30", watched: true, liked: true },
          ]
        },
        {
          name: "Billboard",
          videos: [
            { id: 7, title: "Hot 100 Countdown", thumbnail: "/api/placeholder/320/180", duration: "18:45", watched: false, liked: false },
            { id: 8, title: "Artist Interviews", thumbnail: "/api/placeholder/320/180", duration: "25:00", watched: true, liked: false },
          ]
        }
      ]
    }
  ]
};

router.get('/videos', (req, res) => {
  res.json(MOCK_DATA);
});

module.exports = router;
