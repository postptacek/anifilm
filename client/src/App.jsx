import React, { useState, useEffect, useRef } from 'react';
import 'mind-ar/dist/mindar-image.prod.js';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './index.css';

const TOTAL_FRAMES = 12;
const EASTER_EGG_INDEX = 12; // 13th frame (0-indexed)

function App() {
    const [foundFrames, setFoundFrames] = useState([]);
    const [isGlitchMode, setIsGlitchMode] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem('anifilm_user_id') || `user_${Math.random().toString(36).substr(2, 9)}`);
    const sceneRef = useRef(null);

    // Load progress from local storage
    useEffect(() => {
        localStorage.setItem('anifilm_user_id', userId);
        const saved = JSON.parse(localStorage.getItem('anifilm_found_frames') || '[]');
        setFoundFrames(saved);

        if (saved.includes(EASTER_EGG_INDEX)) setIsGlitchMode(true);
        if (saved.length >= TOTAL_FRAMES && !saved.includes(EASTER_EGG_INDEX)) {
            // Check if they have all normal frames (0-11)
            const normalFrames = saved.filter(id => id < TOTAL_FRAMES);
            if (normalFrames.length === TOTAL_FRAMES) setShowVictory(true);
        }
    }, []);

    // Save progress
    useEffect(() => {
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));

        const normalFrames = foundFrames.filter(id => id < TOTAL_FRAMES);
        if (normalFrames.length === TOTAL_FRAMES) {
            setShowVictory(true);
        }
    }, [foundFrames]);

    const handleTargetFound = (index) => {
        if (!foundFrames.includes(index)) {
            setFoundFrames(prev => [...prev, index]);

            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(200);

            if (index === EASTER_EGG_INDEX) {
                setIsGlitchMode(true);
                alert("👁️ GLITCH MODE UNLOCKED 👁️");
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/submit';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    foundAll: true,
                    glitchMode: isGlitchMode
                })
            });

            if (response.ok) {
                alert("📡 TRANSMISSION SUCCESSFUL. Check the CRT Display.");
                // Optional: Reset or show final state
            } else {
                alert("Transmission failed. Try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection error. Check your internet.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="app-container">
            {/* AR Scene */}
            <a-scene
                ref={sceneRef}
                mindar-image="imageTargetSrc: ./targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false">

                <a-assets>
                    {/* Add assets here if needed */}
                </a-assets>

                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                {/* Generate targets 0-12 */}
                {[...Array(TOTAL_FRAMES + 1)].map((_, index) => (
                    <a-entity
                        key={index}
                        mindar-image-target={`targetIndex: ${index}`}
                        onTargetFound={() => handleTargetFound(index)}>
                        {/* AR Overlay Content */}
                        <a-plane color={foundFrames.includes(index) ? "#00ff00" : "#ff0000"} opacity="0.5" position="0 0 0" height="0.552" width="1" rotation="0 0 0"></a-plane>
                        <a-text value={foundFrames.includes(index) ? "COLLECTED" : "SCANNING..."} color="white" align="center" position="0 0 0.1" scale="1.5 1.5 1.5"></a-text>
                    </a-entity>
                ))}
            </a-scene>

            {/* HUD (Heads-Up Display) */}
            <div className="hud">
                <div className="hud-top">
                    <div className="logo">ANIFILM AR</div>
                    <div className="progress-container">
                        <div className="progress-text">{foundFrames.filter(i => i < 12).length} / {TOTAL_FRAMES}</div>
                        <div className="progress-dots">
                            {[...Array(TOTAL_FRAMES)].map((_, i) => (
                                <div key={i} className={`dot ${foundFrames.includes(i) ? 'active' : ''}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Glitch Indicator */}
                {isGlitchMode && <div className="glitch-indicator">GLITCH ACTIVE</div>}
            </div>

            {/* Victory Screen Overlay */}
            {showVictory && (
                <div className="victory-overlay">
                    <div className="victory-content">
                        <h1>SEQUENCE COMPLETE</h1>
                        <p>All frames collected.</p>
                        <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "TRANSMITTING..." : "SUBMIT TO ETHER"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
