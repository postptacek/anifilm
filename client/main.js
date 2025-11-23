import './style.css';

// Configuration
const TOTAL_FRAMES = 12;
// In a real app, this URL should be configurable (env var)
const API_URL = 'http://localhost:3000/api/submit';

// State
let foundFrames = JSON.parse(localStorage.getItem('anifilm_found_frames')) || [];
let isGlitchMode = localStorage.getItem('anifilm_glitch_mode') === 'true';

// DOM Elements
const gridEl = document.getElementById('grid');
const victoryScreen = document.getElementById('victory-screen');
const submitBtn = document.getElementById('submit-btn');
const sceneEl = document.querySelector('a-scene');

// Initialize UI
function initUI() {
    gridEl.innerHTML = '';
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.id = `grid-item-${i}`;
        item.textContent = i + 1;

        if (foundFrames.includes(i)) {
            item.classList.add('found');
        }

        gridEl.appendChild(item);
    }

    checkCompletion();
}

// Handle Target Found
function onTargetFound(index) {
    console.log(`Target ${index} found!`);

    if (!foundFrames.includes(index)) {
        foundFrames.push(index);
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));

        // Update UI
        const item = document.getElementById(`grid-item-${index}`);
        if (item) item.classList.add('found');

        // Visual feedback in AR (optional, handled by A-Frame entity visibility usually)

        checkCompletion();
    }
}

// Check if all frames are found
function checkCompletion() {
    if (foundFrames.length >= TOTAL_FRAMES) {
        victoryScreen.classList.remove('hidden');
        // Stop AR engine to save battery? 
        // sceneEl.systems['mindar-image-system'].stop(); // Optional
    }
}

// Setup AR Events
function setupAREvents() {
    // We need to attach event listeners to the a-entities
    // Since we might not have all 12 in the HTML yet, let's inject them dynamically if they don't exist
    // or just assume the user will add them. 
    // For this demo, I'll inject the missing entities to make it robust.

    for (let i = 0; i < TOTAL_FRAMES; i++) {
        let entity = document.querySelector(`[mindar-image-target="targetIndex: ${i}"]`);

        if (!entity) {
            entity = document.createElement('a-entity');
            entity.setAttribute('mindar-image-target', `targetIndex: ${i}`);

            const plane = document.createElement('a-plane');
            plane.setAttribute('color', 'lime');
            plane.setAttribute('opacity', '0.5');
            entity.appendChild(plane);

            sceneEl.appendChild(entity);
        }

        entity.addEventListener('targetFound', () => onTargetFound(i));
    }
}

// Submit Logic
submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const userId = localStorage.getItem('anifilm_user_id') || `user_${Date.now()}`;
        localStorage.setItem('anifilm_user_id', userId);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                foundAll: true,
                glitchMode: isGlitchMode
            })
        });

        const data = await response.json();

        if (data.success) {
            submitBtn.textContent = 'SENT! CHECK THE TV';
            alert('Animation sent to the CRT Display!');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error(error);
        submitBtn.textContent = 'RETRY';
        submitBtn.disabled = false;
        alert('Error sending data. Please try again.');
    }
});

// Boot
initUI();
// Wait for scene to load before attaching events
sceneEl.addEventListener('loaded', setupAREvents);

// Debug: Cheat button (hidden) to unlock all
window.unlockAll = () => {
    foundFrames = Array.from({ length: 12 }, (_, i) => i);
    localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));
    initUI();
};
