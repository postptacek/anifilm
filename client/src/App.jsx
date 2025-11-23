import React, { useState, useEffect, useRef } from 'react';
import 'mind-ar/dist/mindar-image.prod.js';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './index.css';

const TOTAL_FRAMES = 12;
const EASTER_EGG_INDEX = 12;

function App() {
    const [foundFrames, setFoundFrames] = useState([]);
    const [isGlitchMode, setIsGlitchMode] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [lastFound, setLastFound] = useState(null);
    const [userId] = useState(localStorage.getItem('anifilm_user_id') || `user_${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        localStorage.setItem('anifilm_user_id', userId);
        const saved = JSON.parse(localStorage.getItem('anifilm_found_frames') || '[]');
        setFoundFrames(saved);

        if (saved.includes(EASTER_EGG_INDEX)) setIsGlitchMode(true);
    }, [userId]);

    useEffect(() => {
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));
        const normalFrames = foundFrames.filter(id => id < TOTAL_FRAMES);
        if (normalFrames.length === TOTAL_FRAMES) setShowVictory(true);
    }, [foundFrames]);

    const handleTargetFound = (index) => {
        if (!foundFrames.includes(index)) {
            setFoundFrames(prev => [...prev, index]);
            setLastFound(index);
            setTimeout(() => setLastFound(null), 2000);

            if (navigator.vibrate) navigator.vibrate(200);
            if (index === EASTER_EGG_INDEX) setIsGlitchMode(true);
        }
    };

    const handleSubmit = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/submit';
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, foundAll: true, glitchMode: isGlitchMode })
            });
            alert("SUBMITTED");
        } catch (error) {
            alert("ERROR");
        }
    };

    const progress = foundFrames.filter(i => i < TOTAL_FRAMES).length;

    return (
        <div className="container">
            {/* MindAR Scene */}
            <a-scene
                mindar-image="imageTargetSrc: ./targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights; alpha: true; antialias: true;"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false">

                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                {[...Array(TOTAL_FRAMES + 1)].map((_, index) => (
                    <a-entity
                        key={index}
                        mindar-image-target={`targetIndex: ${index}`}
                        onTargetFound={() => handleTargetFound(index)}>
                        {/* Minimal AR overlay */}
                        <a-plane
                            color="#ffffff"
                            opacity="0.1"
                            position="0 0 0"
                            height="0.552"
                            width="1"
                            rotation="0 0 0">
                        </a-plane>
                    </a-entity>
                ))}
            </a-scene>

            {/* Minimal UI Overlay */}
            <div className="ui">
                {/* Top Bar */}
                <div className="top-bar">
                    <span className="counter">{progress}/{TOTAL_FRAMES}</span>
                    {isGlitchMode && <span className="glitch">⚡</span>}
                </div>

                {/* Detection Feedback */}
                {lastFound !== null && (
                    <div className="detection-flash">
                        {lastFound === EASTER_EGG_INDEX ? '★' : '●'}
                    </div>
                )}

                {/* Victory */}
                {showVictory && (
                    <div className="victory">
                        <div className="victory-content">
                            <div className="title">COMPLETE</div>
                            <button className="submit" onClick={handleSubmit}>SUBMIT</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
