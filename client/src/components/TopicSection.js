import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Row, Col, Card, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { Folder, PenSquare, Trash2 } from 'lucide-react';

const TopicSection = ({ topic, filter, onChannelMoved, onTopicRenamed, onTopicDeleted, refreshDefaultTopic, fetchTopics }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [newTopicId, setNewTopicId] = useState('');
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newTopicName, setNewTopicName] = useState(topic.name);
  const [showIcons, setShowIcons] = useState(false);
  const [allTopics, setAllTopics] = useState([]); // State for storing all topics

  // Fetch channels for the current topic
  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/channels/${topic._id}`, { withCredentials: true });
      setChannels(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError('Failed to fetch channels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topic._id]);

  // Ensure the dropdown list is always up-to-date by fetching topics dynamically
  const fetchAllTopics = useCallback(async () => {
    try {
        const response = await axios.get('/api/topics', { withCredentials: true });
        setAllTopics(response.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
        console.error('Error fetching topics:', error);
        setError('Failed to fetch topics. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchAllTopics(); // Fetch topics list whenever component mounts or updates
  }, [fetchChannels, fetchAllTopics]);

  // Handle the event when the "Set Topic" button is clicked
  const handleSetTopic = (channel) => {
    setSelectedChannel(channel);
    setNewTopicId('');
    fetchAllTopics(); // Fetch topics right when the modal is triggered
    setShowModal(true);
  };

  // Handle saving the selected topic for a channel
  const handleSaveTopic = async () => {
    try {
      await axios.patch(`/api/channels/${selectedChannel._id}/move`, { newTopicId }, { withCredentials: true });
      setShowModal(false);

      // Remove the channel from the current topic's channel list
      setChannels((prevChannels) => prevChannels.filter((ch) => ch._id !== selectedChannel._id));

      // Notify parent component about the change
      onChannelMoved(selectedChannel, topic._id, newTopicId);

      // Refresh topics list after moving channel
      fetchAllTopics(); // Ensure topics list is up-to-date

    } catch (error) {
      console.error('Error moving channel:', error);
      setError('Failed to move channel. Please try again.');
    }
  };


  // Handle renaming the topic
  const handleRenameTopic = async () => {
    try {
      console.log(`Sending PATCH request to /api/topics/${topic._id}`);
      const response = await axios.patch(`/api/topics/${topic._id}`, { name: newTopicName }, { withCredentials: true });
      console.log('Rename response:', response.data);
      setShowRenameInput(false);
      onTopicRenamed(response.data);
    } catch (error) {
      console.error('Error renaming topic:', error.response ? error.response.data : error.message);
      setError('Failed to rename topic. Please try again.');
    }
  };

  // Handle deleting the topic
  const handleDeleteTopic = async () => {
    if (topic.isDefault) {
      setError('The default topic cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the topic "${topic.name}"? All channels in this topic will be moved to the default topic.`)) {
      try {
        const response = await axios.delete(`/api/topics/${topic._id}`, { withCredentials: true });
        console.log('Delete topic response:', response);
        onTopicDeleted(topic._id);
        refreshDefaultTopic();
      } catch (error) {
        console.error('Error deleting topic:', error.response ? error.response.data : error.message);
        setError(`Failed to delete topic. ${error.response ? error.response.data.message : error.message}`);
      }
    }
  };

  // Handle incoming channels (when a channel is moved to this topic)
  useEffect(() => {
    if (topic.incomingChannel) {
      setChannels((prevChannels) => [...prevChannels, topic.incomingChannel]);
    }
  }, [topic.incomingChannel]);

  if (loading && channels.length === 0) {
    return <Alert variant="info">Loading channels...</Alert>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="mb-5" onMouseEnter={() => setShowIcons(true)} onMouseLeave={() => setShowIcons(false)}>
      {showRenameInput ? (
        <InputGroup className="mb-3">
          <Form.Control
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRenameTopic()}
          />
          <Button variant="outline-secondary" onClick={handleRenameTopic}>
            Save
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowRenameInput(false)}>
            Cancel
          </Button>
        </InputGroup>
      ) : (
        <h2 className="d-flex align-items-center">
          <Folder size={24} className="me-2" />
          {topic.name}
          {showIcons && !topic.isDefault && (
            <>
              <PenSquare
                size={20}
                className="ms-2 cursor-pointer"
                onClick={() => setShowRenameInput(true)}
              />
              <Trash2
                size={20}
                className="ms-2 cursor-pointer"
                onClick={handleDeleteTopic}
              />
            </>
          )}
        </h2>
      )}
      {channels.length > 0 ? (
        <Row xs={1} md={3} lg={4} xl={6} className="g-4">
          {channels.map((channel) => (
            <Col key={channel._id}>
              <Card>
                <Card.Img
                  variant="top"
                  src={channel.thumbnailUrl.replace('s88-c', 's240-c')}
                  alt={channel.name + ' Thumbnail'}
                />
                <Card.Body>
                  <Card.Title>{channel.name}</Card.Title>
                  <Card.Text>
                    {channel.description.length > 150
                      ? channel.description.substring(0, 150) + '...'
                      : channel.description}
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    onClick={() => handleSetTopic(channel)}
                    className="mt-2"
                  >
                    <Folder size={18} className="me-1" /> Set Topic
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>No channels in this topic yet.</p>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Topic for {selectedChannel?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Topic</Form.Label>
              <Form.Control
                as="select"
                value={newTopicId}
                onChange={(e) => setNewTopicId(e.target.value)}
              >
                <option value="">Choose a topic...</option>
                {allTopics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveTopic} disabled={!newTopicId}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default React.memo(TopicSection);
