import React, { useState, useEffect, useRef } from 'react';
import 'mind-ar/dist/mindar-image.prod.js';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './index.css';

const TOTAL_FRAMES = 12;
const EASTER_EGG_INDEX = 12;

function App() {
    const [screen, setScreen] = useState('landing'); // landing, scanning, collection, victory
    const [foundFrames, setFoundFrames] = useState([]);
    const [isGlitchMode, setIsGlitchMode] = useState(false);
    const [justFound, setJustFound] = useState(null);
    const [userId] = useState(localStorage.getItem('anifilm_user_id') || `user_${Date.now()}`);

    useEffect(() => {
        localStorage.setItem('anifilm_user_id', userId);
        const saved = JSON.parse(localStorage.getItem('anifilm_found_frames') || '[]');
        setFoundFrames(saved);
        if (saved.includes(EASTER_EGG_INDEX)) setIsGlitchMode(true);
        if (saved.filter(i => i < TOTAL_FRAMES).length === TOTAL_FRAMES) setScreen('victory');
    }, [userId]);

    useEffect(() => {
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));
    }, [foundFrames]);

    const handleTargetFound = (index) => {
        if (!foundFrames.includes(index)) {
            setFoundFrames(prev => [...prev, index]);
            setJustFound(index);
            setTimeout(() => setJustFound(null), 2000);

            if (navigator.vibrate) navigator.vibrate(200);
            if (index === EASTER_EGG_INDEX) setIsGlitchMode(true);

            const normalCount = [...foundFrames, index].filter(i => i < TOTAL_FRAMES).length;
            if (normalCount === TOTAL_FRAMES) {
                setTimeout(() => setScreen('victory'), 1000);
            }
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
            alert("✓ Submitted! Check the CRT display.");
        } catch (error) {
            alert("× Connection error");
        }
    };

    const progress = foundFrames.filter(i => i < TOTAL_FRAMES).length;

    if (screen === 'landing') {
        return (
            <div className="screen landing">
                <div className="content">
                    <h1>ANIFILM<br />AR HUNT</h1>
                    <p>Find and scan 12 hidden posters around the festival</p>
                    <button className="btn-primary" onClick={() => setScreen('scanning')}>
                        START HUNTING
                    </button>
                    {progress > 0 && (
                        <div className="resume">You have {progress}/12 frames</div>
                    )}
                </div>
            </div>
        );
    }

    if (screen === 'collection') {
        return (
            <div className="screen collection">
                <div className="header">
                    <button onClick={() => setScreen('scanning')}>← Back</button>
                    <h2>{progress}/{TOTAL_FRAMES}</h2>
                </div>
                <div className="grid">
                    {[...Array(TOTAL_FRAMES)].map((_, i) => (
                        <div key={i} className={`slot ${foundFrames.includes(i) ? 'found' : ''}`}>
                            {foundFrames.includes(i) ? '●' : (i + 1)}
                        </div>
                    ))}
                </div>
                {isGlitchMode && <div className="easter">★ Easter Egg Found</div>}
            </div>
        );
    }

    if (screen === 'victory') {
        return (
            <div className="screen victory">
                <div className="content">
                    <div className="celebration">🎬</div>
                    <h1>COMPLETE!</h1>
                    <p>All {TOTAL_FRAMES} frames collected</p>
                    <button className="btn-primary" onClick={handleSubmit}>
                        SUBMIT YOUR FILM
                    </button>
                    <button className="btn-secondary" onClick={() => setScreen('collection')}>
                        View Collection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="screen scanning">
            <a-scene
                mindar-image="imageTargetSrc: ./targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights; alpha: false;"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false">

                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                {[...Array(TOTAL_FRAMES + 1)].map((_, index) => (
                    <a-entity
                        key={index}
                        mindar-image-target={`targetIndex: ${index}`}
                        onTargetFound={() => handleTargetFound(index)}>
                        <a-plane color="#00ff00" opacity="0.3" position="0 0 0" height="0.552" width="1"></a-plane>
                    </a-entity>
                ))}
            </a-scene>

            <div className="ui">
                <div className="top-bar">
                    <button onClick={() => setScreen('collection')}>{progress}/{TOTAL_FRAMES}</button>
                </div>

                {justFound !== null && (
                    <div className="found-notification">
                        <div className="icon">{justFound === EASTER_EGG_INDEX ? '★' : '●'}</div>
                        <div className="text">
                            {justFound === EASTER_EGG_INDEX ? 'Easter Egg!' : `Frame ${justFound + 1}`}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
