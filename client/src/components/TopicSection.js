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
      <Row>
        {topic.channels.map((channel, channelIndex) => (
          <Col key={channelIndex} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <h3 className="h5">{channel.name}</h3>
            {filteredVideos(channel.videos).map((video) => (
              <div key={video.id} className="mb-3">
                <VideoCard video={video} />
              </div>
            ))}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TopicSection;