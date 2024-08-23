import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChannelColumn from './components/ChannelColumn';
import Header from './components/Header';

function App() {
    const [videos, setVideos] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchVideos = async () => {
            const response = await axios.get('/api/videos');
            setVideos(response.data);
        };

        fetchVideos();
    }, []);

    const filteredVideos = videos.filter(video => {
        if (filter === 'unwatched') return !video.watched;
        if (filter === 'watched') return video.watched;
        return true;
    });

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header setFilter={setFilter} />
            <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map((video, index) => (
                    <ChannelColumn key={index} video={video} />
                ))}
            </div>
        </div>
    );
}

export default App;
