import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Modal, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import TopicSection from './components/TopicSection';

axios.defaults.withCredentials = true;

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [filter, setFilter] = useState('all');
  const [topics, setTopics] = useState([]);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log('Checking login status...');
        const response = await axios.get('http://localhost:5000/auth/status');
        console.log('Login status response:', response.data);
        setIsLoggedIn(response.data.isLoggedIn);
        setUserEmail(response.data.userEmail);
        if (response.data.isLoggedIn) {
          fetchTopics();
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setError('Failed to check login status');
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/topics', { withCredentials: true });
      console.log('Fetched topics:', response.data);
      setTopics(response.data);
      setError(null);
      // Increment refreshKey to trigger a re-render of all TopicSections
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to fetch topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/logout', { withCredentials: true });
      if (response.data.message === 'Logged out successfully') {
        setIsLoggedIn(false);
        setUserEmail('');
        setTopics([]);
      } else {
        throw new Error('Logout unsuccessful');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogin = () => {
    console.log('Attempting to log in');
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleNewTopic = () => {
    setShowNewTopicModal(true);
  };

  const handleCreateTopic = async () => {
    try {
      await axios.post('/api/topics', { name: newTopicName });
      setShowNewTopicModal(false);
      setNewTopicName('');
      fetchTopics();
      setError(null);
    } catch (error) {
      console.error('Error creating topic:', error);
      setError('Failed to create new topic. Please try again.');
    }
  };

  const handleFetchSubscriptions = async () => {
    setIsFetchingSubscriptions(true);
    try {
      await axios.get('http://localhost:5000/api/fetch-subscriptions', { withCredentials: true });
      fetchTopics(); // Refresh the data after fetching subscriptions
      setError(null);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to fetch YouTube subscriptions. Please try again.');
    } finally {
      setIsFetchingSubscriptions(false);
    }
  };

  if (loading) {
    return <Container className="mt-5"><Alert variant="info">Loading...</Alert></Container>;
  }

  return (
    <div className="App">
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setFilter={setFilter}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onNewTopic={handleNewTopic}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      <Container className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}

        {isLoggedIn && (
          <>
            <Button
              onClick={handleFetchSubscriptions}
              disabled={isFetchingSubscriptions}
              className="mb-3 me-2"
            >
              {isFetchingSubscriptions ? 'Fetching...' : 'Fetch YouTube Subscriptions'}
            </Button>
            <Button
              onClick={handleNewTopic}
              className="mb-3"
            >
              Create New Topic
            </Button>
          </>
        )}

        {isLoggedIn && topics.length > 0 ? (
          topics.map((topic) => (
            <TopicSection
              key={`${topic._id}-${refreshKey}`}
              topic={topic}
              filter={filter}
              onChannelMoved={fetchTopics}
              refreshKey={refreshKey}
            />
          ))
        ) : (
          <Alert variant="info">
            {isLoggedIn
              ? "You don't have any topics yet. Create a new topic or fetch your YouTube subscriptions to get started."
              : "Please log in to view your topics and channels."}
          </Alert>
        )}
      </Container>

      <Modal show={showNewTopicModal} onHide={() => setShowNewTopicModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Topic Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewTopicModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateTopic}>
            Create Topic
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;