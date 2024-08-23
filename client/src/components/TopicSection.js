import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Row, Col, Button, Modal, Form, Card, Alert } from 'react-bootstrap';
import { PlusCircle } from 'lucide-react';

const TopicSection = ({ topic, filter, onChannelMoved }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelYoutubeId, setNewChannelYoutubeId] = useState('');

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

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleCreateChannel = async () => {
    try {
      await axios.post(`/api/topics/${topic._id}/channels`, {
        name: newChannelName,
        youtubeId: newChannelYoutubeId
      });
      setShowNewChannelModal(false);
      setNewChannelName('');
      setNewChannelYoutubeId('');
      fetchChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Failed to create channel. Please try again.');
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
      <Button variant="outline-primary" className="mb-3" onClick={() => setShowNewChannelModal(true)}>
        <PlusCircle size={18} /> Add Channel
      </Button>
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
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      ) : (
        <p>No channels in this topic yet.</p>
      )}

      <Modal show={showNewChannelModal} onHide={() => setShowNewChannelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Channel Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>YouTube Channel ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter YouTube channel ID"
                value={newChannelYoutubeId}
                onChange={(e) => setNewChannelYoutubeId(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewChannelModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateChannel}>
            Add Channel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TopicSection;