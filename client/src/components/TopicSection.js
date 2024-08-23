import React from 'react';
import { Row, Col } from 'react-bootstrap';
import VideoCard from './VideoCard';

const TopicSection = ({ topic, filter }) => {
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

  return (
    <div className="mb-5">
      <h2>{topic.name}</h2>
      {topic.channels.map((channel, channelIndex) => (
        <div key={channelIndex} className="mb-4">
          <h3 className="h5">{channel.name}</h3>
          <Row xs={2} sm={3} md={4} lg={6} className="g-3">
            {filteredVideos(channel.videos).map((video) => (
              <Col key={video.id}>
                <VideoCard video={video} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default TopicSection;