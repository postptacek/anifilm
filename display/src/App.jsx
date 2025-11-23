import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDebug, setIsDebug] = useState(false);
    const videoRef = useRef(null);

    // Fetch playlist
    const fetchPlaylist = async () => {
        try {
            const response = await fetch(`${API_URL}/api/playlist`);
            const data = await response.json();

            if (data && data.length > 0) {
                // New videos at the front
                const existingIds = playlist.map(v => v.id);
                const newVideos = data.filter(v => !existingIds.includes(v.id));

                if (newVideos.length > 0) {
                    console.log('New videos detected:', newVideos.length);
                    setPlaylist(prev => [...newVideos, ...prev]);
                } else if (playlist.length === 0) {
                    // First load
                    setPlaylist(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchPlaylist();
        const interval = setInterval(fetchPlaylist, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Handle video end
    const handleVideoEnd = () => {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
    };

    // Handle keyboard (debug toggle)
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'd') setIsDebug(!isDebug);
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isDebug]);

    // Auto-play when playlist updates
    useEffect(() => {
        if (videoRef.current && playlist.length > 0) {
            videoRef.current.load();
            videoRef.current.play().catch(err => console.warn('Autoplay blocked:', err));
        }
    }, [currentIndex, playlist]);

    const currentVideo = playlist[currentIndex];

    return (
        <div className="display-container">
            {playlist.length === 0 ? (
                <div className="no-content">
                    <div className="loading-text">WAITING FOR CONTENT...</div>
                    <div className="sub-text">Scanning for submissions</div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    className="fullscreen-video"
                    src={`${API_URL}${currentVideo?.url}`}
                    onEnded={handleVideoEnd}
                    loop={playlist.length === 1}
                    muted={false}
                    playsInline
                />
            )}

            {isDebug && (
                <div className="debug-overlay">
                    <div><strong>API:</strong> {API_URL}</div>
                    <div><strong>Playlist:</strong> {playlist.length} videos</div>
                    <div><strong>Current:</strong> {currentIndex + 1}/{playlist.length}</div>
                    <div><strong>Playing:</strong> {currentVideo?.id}</div>
                </div>
            )}
        </div>
    );
}

export default App;
