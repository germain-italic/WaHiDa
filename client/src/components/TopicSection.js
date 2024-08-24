import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Row, Col, Card, Alert } from 'react-bootstrap';

const TopicSection = ({ topic, filter, onChannelMoved }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      ) : (
        <p>No channels in this topic yet.</p>
      )}
    </div>
  );
};

export default TopicSection;