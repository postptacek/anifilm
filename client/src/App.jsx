import React, { useState, useEffect } from 'react';
import 'mind-ar/dist/mindar-image.prod.js';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './index.css';

const TOTAL_FRAMES = 12;
const EASTER_EGG_INDEX = 12;

function App() {
    const [started, setStarted] = useState(false);
    const [foundFrames, setFoundFrames] = useState([]);
    const [isGlitchMode, setIsGlitchMode] = useState(false);
    const [lastFound, setLastFound] = useState(null);
    const [userId] = useState(localStorage.getItem('anifilm_user_id') || `user_${Date.now()}`);

    useEffect(() => {
        localStorage.setItem('anifilm_user_id', userId);
        const saved = JSON.parse(localStorage.getItem('anifilm_found_frames') || '[]');
        setFoundFrames(saved);
        if (saved.includes(EASTER_EGG_INDEX)) setIsGlitchMode(true);
    }, [userId]);

    useEffect(() => {
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));
    }, [foundFrames]);

    const handleTargetFound = (index) => {
        if (!foundFrames.includes(index)) {
            setFoundFrames(prev => [...prev, index]);
            setLastFound(index);
            setTimeout(() => setLastFound(null), 3000);

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
    const isComplete = progress === TOTAL_FRAMES;

    if (!started) {
        return (
            <div className="screen start" onClick={() => setStarted(true)}>
                <div className="start-text">TAP TO START</div>
            </div>
        );
    }

    return (
        <div className="screen scanning">
            <a-scene
                mindar-image="imageTargetSrc: ./targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights; alpha: true;"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false">

                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                {[...Array(TOTAL_FRAMES + 1)].map((_, index) => (
                    <a-entity
                        key={index}
                        mindar-image-target={`targetIndex: ${index}`}
                        onTargetFound={() => handleTargetFound(index)}>
                        {/* Minimal feedback: Just a white outline */}
                        <a-plane color="#ffffff" opacity="0.1" position="0 0 0" height="0.552" width="1"></a-plane>
                        <a-ring color="#ffffff" radius-inner="0.5" radius-outer="0.51" position="0 0 0.1"></a-ring>
                    </a-entity>
                ))}
            </a-scene>

            {/* Minimal HUD */}
            <div className="hud">
                <div className="top-indicator">
                    {progress} / {TOTAL_FRAMES}
                </div>

                {/* Detection Feedback */}
                {lastFound !== null && (
                    <div className="feedback">
                        FRAME {lastFound + 1}
                    </div>
                )}

                {/* Completion Button */}
                {isComplete && (
                    <button className="submit-btn" onClick={handleSubmit}>
                        SUBMIT
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;
