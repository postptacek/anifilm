import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/playlist';
const POLL_INTERVAL = 30000;

function App() {
    const [playlist, setPlaylist] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [debugLog, setDebugLog] = useState([]);
    const [showDebug, setShowDebug] = useState(false);
    const videoRef = useRef(null);

    const log = (msg) => {
        console.log(msg);
        setDebugLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 10));
    };

    const fetchPlaylist = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            return data;
        } catch (err) {
            log('Error fetching playlist: ' + err.message);
            return [];
        }
    };

    const updateLibrary = async () => {
        log('Polling...');
        const serverList = await fetchPlaylist();

        setPlaylist(prevPlaylist => {
            const newItems = serverList.filter(item => !prevPlaylist.find(p => p.id === item.id));

            if (newItems.length > 0) {
                log(`Found ${newItems.length} new videos!`);
                setQueue(prevQueue => [...newItems, ...prevQueue]); // Add new items to front
                return [...prevPlaylist, ...newItems];
            }
            return prevPlaylist;
        });
    };

    // Initial Load & Polling
    useEffect(() => {
        updateLibrary();
        const interval = setInterval(updateLibrary, POLL_INTERVAL);

        const handleKey = (e) => {
            if (e.key === 'd') setShowDebug(prev => !prev);
        };
        window.addEventListener('keydown', handleKey);

        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKey);
        };
    }, []);

    // Playback Loop
    useEffect(() => {
        if (!currentVideo && queue.length > 0) {
            const next = queue[0];
            setQueue(prev => prev.slice(1));
            setCurrentVideo(next);
        } else if (!currentVideo && queue.length === 0 && playlist.length > 0) {
            // Refill from playlist (shuffle)
            log('Refilling queue...');
            const shuffled = [...playlist].sort(() => Math.random() - 0.5);
            setQueue(shuffled);
        }
    }, [currentVideo, queue, playlist]);

    const handleEnded = () => {
        log('Video ended');
        setCurrentVideo(null); // Triggers effect to play next
    };

    const handleError = (e) => {
        log('Video error');
        setCurrentVideo(null);
    };

    // Construct URL - Handle absolute vs relative
    // If API_URL is http://myserver.com/api/playlist, video url is /videos/foo.mp4
    // We need http://myserver.com/videos/foo.mp4
    const getVideoSrc = (video) => {
        if (!video) return '';
        if (video.url.startsWith('http')) return video.url;

        const baseUrl = new URL(API_URL).origin;
        return `${baseUrl}${video.url}`;
    };

    return (
        <>
            {showDebug && <div className="debug">{debugLog.join('\n')}</div>}
            <video
                ref={videoRef}
                src={getVideoSrc(currentVideo)}
                autoPlay
                muted
                playsInline
                onEnded={handleEnded}
                onError={handleError}
            />
        </>
    );
}

export default App;
