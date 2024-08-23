import React from 'react';

const ChannelColumn = ({ video }) => {
    return (
        <div className="bg-gray-800 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">{video.channelTitle}</h2>
            <div className="flex items-center mb-2">
                <img src={video.thumbnail} alt={video.title} className="w-16 h-16 mr-4" />
                <div>
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-400">{new Date(video.publishedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <button className={`px-4 py-2 rounded ${video.watched ? 'bg-green-500' : 'bg-red-500'}`}>
                    {video.watched ? 'Watched' : 'Unwatched'}
                </button>
            </div>
        </div>
    );
};

export default ChannelColumn;
