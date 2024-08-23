import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import TopicSection from './components/TopicSection';

const MOCK_DATA = {
  topics: [
    {
      name: "Football Videos",
      channels: [
        {
          name: "UEFA",
          videos: [
            { id: 1, title: "Champions League Highlights", thumbnail: "https://via.placeholder.com/320x180.png?text=CL+Highlights", duration: "10:30", watched: false, liked: false },
            { id: 2, title: "Euro 2024 Qualifiers", thumbnail: "https://via.placeholder.com/320x180.png?text=Euro+2024", duration: "15:45", watched: true, liked: true },
          ]
        },
        {
          name: "FIFA",
          videos: [
            { id: 3, title: "World Cup 2026 News", thumbnail: "https://via.placeholder.com/320x180.png?text=WC+2026", duration: "8:20", watched: false, liked: false },
            { id: 4, title: "Best Goals of 2023", thumbnail: "https://via.placeholder.com/320x180.png?text=Best+Goals", duration: "12:10", watched: true, liked: false },
            { id: 3, title: "World Cup 2026 News", thumbnail: "https://via.placeholder.com/320x180.png?text=WC+2026", duration: "8:20", watched: false, liked: false },
            { id: 4, title: "Best Goals of 2023", thumbnail: "https://via.placeholder.com/320x180.png?text=Best+Goals", duration: "12:10", watched: true, liked: false },
            { id: 3, title: "World Cup 2026 News", thumbnail: "https://via.placeholder.com/320x180.png?text=WC+2026", duration: "8:20", watched: false, liked: false },
            { id: 4, title: "Best Goals of 2023", thumbnail: "https://via.placeholder.com/320x180.png?text=Best+Goals", duration: "12:10", watched: true, liked: false },
            { id: 3, title: "World Cup 2026 News", thumbnail: "https://via.placeholder.com/320x180.png?text=WC+2026", duration: "8:20", watched: false, liked: false },
            { id: 4, title: "Best Goals of 2023", thumbnail: "https://via.placeholder.com/320x180.png?text=Best+Goals", duration: "12:10", watched: true, liked: false },
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
            { id: 5, title: "Top Hits This Week", thumbnail: "https://via.placeholder.com/320x180.png?text=Top+Hits", duration: "20:15", watched: false, liked: false },
            { id: 6, title: "New Artist Spotlight", thumbnail: "https://via.placeholder.com/320x180.png?text=New+Artist", duration: "7:30", watched: true, liked: true },
          ]
        },
        {
          name: "Billboard",
          videos: [
            { id: 7, title: "Hot 100 Countdown", thumbnail: "https://via.placeholder.com/320x180.png?text=Hot+100", duration: "18:45", watched: false, liked: false },
            { id: 8, title: "Artist Interviews", thumbnail: "https://via.placeholder.com/320x180.png?text=Interviews", duration: "25:00", watched: true, liked: false },
          ]
        }
      ]
    }
  ]
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState(MOCK_DATA);

  useEffect(() => {
    // Here you would fetch data from your API and update the state
    // For now, we're using mock data
    setData(MOCK_DATA);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="App">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} setFilter={setFilter} />
      <Container className="mt-4">
        {data.topics.map((topic, index) => (
          <TopicSection key={index} topic={topic} filter={filter} />
        ))}
      </Container>
    </div>
  );
}

export default App;