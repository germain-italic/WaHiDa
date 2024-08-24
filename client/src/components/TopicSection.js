import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Row, Col, Card, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { Folder, PenSquare, Trash2 } from 'lucide-react';

const TopicSection = ({ topic, filter, onChannelMoved, onTopicRenamed, onTopicDeleted }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [topics, setTopics] = useState([]);
  const [newTopicId, setNewTopicId] = useState('');
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newTopicName, setNewTopicName] = useState(topic.name);
  const [showIcons, setShowIcons] = useState(false);

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

  const fetchTopics = async () => {
    try {
      const response = await axios.get('/api/topics', { withCredentials: true });
      setTopics(response.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to fetch topics. Please try again.');
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchTopics();
  }, [fetchChannels]);

  const handleSetTopic = (channel) => {
    setSelectedChannel(channel);
    setNewTopicId('');
    setShowModal(true);
  };

  const handleSaveTopic = async () => {
    try {
      await axios.patch(`/api/channels/${selectedChannel._id}/move`, { newTopicId }, { withCredentials: true });
      setShowModal(false);

      // Remove the channel from the current topic's channel list
      setChannels(prevChannels => prevChannels.filter(ch => ch._id !== selectedChannel._id));

      // Notify parent component about the change
      onChannelMoved(selectedChannel, topic._id, newTopicId);
    } catch (error) {
      console.error('Error moving channel:', error);
      setError('Failed to move channel. Please try again.');
    }
  };

  // Handle incoming channels
  useEffect(() => {
    if (topic.incomingChannel) {
      setChannels(prevChannels => [...prevChannels, topic.incomingChannel]);
    }
  }, [topic.incomingChannel]);

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

  const handleDeleteTopic = async () => {
    if (window.confirm(`Are you sure you want to delete the topic "${topic.name}"?`)) {
      try {
        const response = await axios.delete(`/api/topics/${topic._id}`, { withCredentials: true });
        console.log('Delete topic response:', response);
        onTopicDeleted(topic._id);
      } catch (error) {
        console.error('Error deleting topic:', error.response ? error.response.data : error.message);
        setError(`Failed to delete topic. ${error.response ? error.response.data.message : error.message}`);
      }
    }
  };

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
                  alt={channel.name + " Thumbnail"}
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
                {topics.map((t) => (
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