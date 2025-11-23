import './style.css';

// Configuration
const TOTAL_FRAMES = 12;
// In a real app, this URL should be configurable (env var)
const API_URL = 'http://localhost:3000/api/submit';

// State
let foundFrames = JSON.parse(localStorage.getItem('anifilm_found_frames')) || [];
let isGlitchMode = localStorage.getItem('anifilm_glitch_mode') === 'true';

// DOM Elements
const landingPage = document.getElementById('landing-page');
const startBtn = document.getElementById('start-btn');
const uiLayer = document.getElementById('ui-layer');
const collectionBtn = document.getElementById('collection-btn');
const collectionView = document.getElementById('collection-view');
const closeCollectionBtn = document.getElementById('close-collection-btn');
const collectionGrid = document.getElementById('collection-grid');
const victoryScreen = document.getElementById('victory-screen');
const submitBtn = document.getElementById('submit-btn');
const sceneEl = document.querySelector('a-scene');

// Initialize UI
function initUI() {
    renderCollection();
    checkCompletion();
}

// Start Hunt Flow
startBtn.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    uiLayer.classList.remove('hidden');
    // Request camera permission if needed (browser handles this via A-Frame usually)
});

// Collection View Toggle
collectionBtn.addEventListener('click', () => {
    renderCollection();
    collectionView.classList.remove('hidden');
});

closeCollectionBtn.addEventListener('click', () => {
    collectionView.classList.add('hidden');
});

// Render Collection Grid
function renderCollection() {
    collectionGrid.innerHTML = '';
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.id = `collection-item-${i}`;
        item.textContent = i + 1;

        if (foundFrames.includes(i)) {
            item.classList.add('found');
        }

        collectionGrid.appendChild(item);
    }
}

// Handle Target Found
function onTargetFound(index) {
    console.log(`Target ${index} found!`);

    if (!foundFrames.includes(index)) {
        foundFrames.push(index);
        localStorage.setItem('anifilm_found_frames', JSON.stringify(foundFrames));

        // Show a toast or visual feedback (optional)
        // For now, we just update the collection state which will be rendered next time it's opened

        // Also check if we should show victory immediately? 
        // Maybe better to let them check collection to see progress.
        // But if it's the last one, we might want to show victory.

        checkCompletion();
    }
}

// Check if all frames are found
function checkCompletion() {
    if (foundFrames.length >= TOTAL_FRAMES) {
        // If we are in the collection view, maybe close it?
        collectionView.classList.add('hidden');
        victoryScreen.classList.remove('hidden');
        uiLayer.classList.add('hidden'); // Hide main UI
    }
}

// Setup AR Events
function setupAREvents() {
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
