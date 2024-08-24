import React, { useState, useEffect, useCallback } from 'react';
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
      const sortedTopics = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setTopics(sortedTopics);
      setError(null);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to fetch topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelMoved = (channel, oldTopicId, newTopicId) => {
    setTopics(prevTopics =>
      prevTopics.map(topic => {
        if (topic._id === oldTopicId) {
          return { ...topic, incomingChannel: null };
        } else if (topic._id === newTopicId) {
          return { ...topic, incomingChannel: channel };
        }
        return topic;
      })
    );
  };


  const handleTopicRenamed = (updatedTopic) => {
    setTopics(prevTopics => {
      const updatedTopics = prevTopics.map(t =>
        t._id === updatedTopic._id ? updatedTopic : t
      );
      return updatedTopics.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

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

  const handleCreateTopic = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await axios.post('/api/topics', { name: newTopicName });

      if (response.status === 201) { // Check if the topic creation was successful
        setShowNewTopicModal(false);
        setNewTopicName('');

        // Fetch topics to update the dropdown
        fetchTopics();

        setError(null);
      } else {
        setError('Failed to create new topic. Please try again.');
      }

    } catch (error) {
      console.error('Error creating topic:', error);
      setError('Failed to create new topic. Please try again.');
    }
  };

  const handleTopicDeleted = useCallback(async (deletedTopicId) => {
    console.log('handleTopicDeleted called with id:', deletedTopicId);
    try {
      console.log('Removing deleted topic from state');
      setTopics(prevTopics => {
        const newTopics = prevTopics.filter(topic => topic._id !== deletedTopicId);
        console.log('Topics after removal:', newTopics);
        return newTopics;
      });

      console.log('Fetching updated topics from server');
      const response = await axios.get('http://localhost:5000/api/topics', { withCredentials: true });
      console.log('Fetched topics:', response.data);

      const updatedTopics = response.data.sort((a, b) => a.name.localeCompare(b.name));
      console.log('Sorted topics:', updatedTopics);

      console.log('Setting new topics state');
      setTopics(updatedTopics);
      console.log('State update called. Current topics state:', topics);

      // Force a re-render
      setError('');
      console.log('Forced re-render by setting error state');
    } catch (error) {
      console.error('Error handling topic deletion:', error);
      setError('Failed to update topics after deletion. Please refresh the page.');
    }
  }, [topics]);

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
              key={`${topic._id}-${topics.length}`}  // Add this line
              topic={topic}
              filter={filter}
              onChannelMoved={handleChannelMoved}
              onTopicRenamed={handleTopicRenamed}
              onTopicDeleted={handleTopicDeleted}
              fetchTopics={fetchTopics}
              topicsList={topics}
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
        <Form onSubmit={handleCreateTopic}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Topic Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewTopicModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Create Topic
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
