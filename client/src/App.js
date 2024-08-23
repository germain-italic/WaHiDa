import React, { useState, useEffect } from 'react';
import { Moon, Sun, Eye, EyeOff, ThumbsUp, Youtube } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import axios from 'axios'; // Add this line

const VideoCard = ({ video }) => (
  <Card className="w-64 m-2">
    <CardContent className="p-0">
      <img src={video.thumbnail} alt={video.title} className="w-full h-36 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
        <div className="flex justify-between items-center">
          <span>{video.duration}</span>
          {video.watched ? <Eye className="text-green-500" /> : <EyeOff className="text-gray-500" />}
          {video.liked && <ThumbsUp className="text-blue-500" />}
        </div>
      </div>
    </CardContent>
  </Card>
);

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/videos');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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

  if (!data) return <div>Loading...</div>;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">WaHiDa</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={toggleDarkMode}>
            {darkMode ? <Sun /> : <Moon />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Show</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setFilter('all')}>Show All</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter('unwatched')}>Show Unwatched</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilter('watched')}>Show Watched</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Youtube className="mr-2" /> Login with Google
          </Button>
        </div>
      </header>
      <main className="p-4">
        {data.topics.map((topic, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{topic.name}</h2>
            <div className="flex flex-wrap">
              {topic.channels.map((channel, channelIndex) => (
                <div key={channelIndex} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
                  <h3 className="text-lg font-medium mb-2">{channel.name}</h3>
                  <div className="space-y-4">
                    {filteredVideos(channel.videos).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default App;
