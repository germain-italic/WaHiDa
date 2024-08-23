import React, { useState } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { PlusCircle } from 'lucide-react';
import VideoCard from './VideoCard';
import axios from 'axios';

const TopicSection = ({ topic, filter, onChannelMoved }) => {
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelYoutubeId, setNewChannelYoutubeId] = useState('');

  const filteredVideos = (videos) => {
    switch (filter) {
      case 'unwatched':
        return videos.filter(v => !v.watched);
      case 'watched':
        return videos.filter(v => v.watched);
      default:
        return videos;
    }
  };

  const handleCreateChannel = async () => {
    try {
      await axios.post(`/api/topics/${topic._id}/channels`, {
        name: newChannelName,
        youtubeId: newChannelYoutubeId
      });
      setShowNewChannelModal(false);
      setNewChannelName('');
      setNewChannelYoutubeId('');
      if (onChannelMoved) {
        onChannelMoved();
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const handleMoveChannel = async (channelId, newTopicId) => {
    try {
      await axios.patch(`/api/channels/${channelId}/move`, { newTopicId });
      if (onChannelMoved) {
        onChannelMoved();
      }
    } catch (error) {
      console.error('Error moving channel:', error);
    }
  };

  return (
    <div className="mb-5">
      <h2>{topic.name}</h2>
      <Button variant="outline-primary" className="mb-3" onClick={() => setShowNewChannelModal(true)}>
        <PlusCircle size={18} /> Add Channel
      </Button>
      {topic.channels && topic.channels.map((channel, channelIndex) => (
        <div key={channelIndex} className="mb-4">
          <h3 className="h5">{channel.name}</h3>
          <Row xs={2} sm={3} md={4} lg={6} className="g-3">
            {filteredVideos(channel.videos || []).map((video) => (
              <Col key={video.id}>
                <VideoCard video={video} />
              </Col>
            ))}
          </Row>
        </div>
      ))}

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