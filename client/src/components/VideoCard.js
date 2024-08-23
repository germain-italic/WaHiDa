import React from 'react';
import { Card } from 'react-bootstrap';

const VideoCard = ({ video }) => (
  <Card className="h-100">
    <Card.Img variant="top" src={video.thumbnail} alt={video.title} />
    <Card.Body>
      <Card.Title>{video.title}</Card.Title>
      <Card.Text>
        Duration: {video.duration}
        <br />
        {video.watched ? '✅ Watched' : '👁️ Unwatched'}
        {video.liked && ' 👍 Liked'}
      </Card.Text>
    </Card.Body>
  </Card>
);

export default VideoCard;