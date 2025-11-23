import React, { useState, useEffect, useRef } from 'react';
import 'mind-ar/dist/mindar-image.prod.js';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './index.css';

const TOTAL_FRAMES = 12;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/submit';

function App() {
    const [foundFrames, setFoundFrames] = useState(() => {
        return JSON.parse(localStorage.getItem('anifilm_found_frames')) || [];
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const sceneRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));
    }, [foundFrames]);

    useEffect(() => {
        const sceneEl = sceneRef.current;
        if (!sceneEl) return;

        const handleTargetFound = (event) => {
            const index = parseInt(event.target.getAttribute('data-index'));
            console.log(`Target ${index} found`);

            setFoundFrames(prev => {
                if (!prev.includes(index)) {
                    return [...prev, index];
                }
                return prev;
            });
        };

        // Attach listeners to entities
        // Note: In React with A-Frame, it's safer to attach events via ref or standard addEventListener
        // after the scene is loaded.
        const entities = sceneEl.querySelectorAll('a-entity[mindar-image-target]');
        entities.forEach(entity => {
            entity.addEventListener('targetFound', handleTargetFound);
        });

        return () => {
            entities.forEach(entity => {
                entity.removeEventListener('targetFound', handleTargetFound);
            });
        };
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const userId = localStorage.getItem('anifilm_user_id') || `user_${Date.now()}`;
            localStorage.setItem('anifilm_user_id', userId);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    foundAll: true,
                    glitchMode: false // Can add toggle later
                })
            });

            const data = await response.json();
            if (data.success) {
                setHasSubmitted(true);
                alert('Sent to the Ether!');
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            alert('Error sending: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isComplete = foundFrames.length >= TOTAL_FRAMES;

    return (
        <>
            <div className="ui-layer">
                <div className="grid-container">
                    {Array.from({ length: TOTAL_FRAMES }).map((_, i) => (
                        <div key={i} className={`grid-item ${foundFrames.includes(i) ? 'found' : ''}`}>
                            {i + 1}
                        </div>
                    ))}
                </div>
                {!isComplete && <div className="scan-overlay"></div>}
            </div>

            {isComplete && (
                <div className="victory-screen">
                    <h1>COLLECTION COMPLETE</h1>
                    <p>You found all 12 frames!</p>
                    <button onClick={handleSubmit} disabled={isSubmitting || hasSubmitted}>
                        {isSubmitting ? 'SENDING...' : hasSubmitted ? 'SENT!' : 'SUBMIT TO ETHER'}
                    </button>
                </div>
            )}

            <a-scene
                ref={sceneRef}
                mindar-image="imageTargetSrc: ./targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false"
            >
                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                {Array.from({ length: TOTAL_FRAMES }).map((_, i) => (
                    <a-entity key={i} mindar-image-target={`targetIndex: ${i}`} data-index={i}>
                        <a-plane color="cyan" opacity="0.5" height="1" width="1"></a-plane>
                        <a-text value={`FRAME ${i + 1}`} align="center" color="white"></a-text>
                    </a-entity>
                ))}
            </a-scene>
        </>
    );
}

export default App;
