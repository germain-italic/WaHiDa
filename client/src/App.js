import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import TopicSection from './components/TopicSection';

function App() {

  const [darkMode, setDarkMode] = useState(true);
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/videos');
        console.log('API Response:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    document.body.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

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