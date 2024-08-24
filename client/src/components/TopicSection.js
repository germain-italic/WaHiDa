import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Row, Col, Card, Alert, Button, Modal, Form } from 'react-bootstrap';
import { Folder } from 'lucide-react';

const TopicSection = ({ topic, filter, onChannelMoved, refreshKey }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [topics, setTopics] = useState([]);
  const [newTopicId, setNewTopicId] = useState('');

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
  }, [fetchChannels, refreshKey]); // Add refreshKey to the dependency array

  const handleSetTopic = (channel) => {
    setSelectedChannel(channel);
    setNewTopicId('');
    setShowModal(true);
  };

  const handleSaveTopic = async () => {
    try {
      await axios.patch(`/api/channels/${selectedChannel._id}/move`, { newTopicId }, { withCredentials: true });
      setShowModal(false);
      onChannelMoved();
    } catch (error) {
      console.error('Error moving channel:', error);
      setError('Failed to move channel. Please try again.');
    }
  };

  if (loading) {
    return <Alert variant="info">Loading channels...</Alert>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="mb-5">
      <h2>{topic.name}</h2>
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

export default TopicSection;