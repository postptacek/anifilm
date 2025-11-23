// Configuration
const API_URL = 'http://localhost:3000/api/playlist';
const POLL_INTERVAL = 30000; // 30 seconds

// State
let playlist = []; // All known videos
let queue = []; // Playback queue
let currentVideoId = null;

// Elements
const player = document.getElementById('player');
const debugEl = document.getElementById('debug');

// Utils
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const log = (msg) => {
    console.log(msg);
    debugEl.innerText = msg + '\n' + debugEl.innerText;
};

// Fetch Playlist
const fetchPlaylist = async () => {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        return data; // Array of { id, url, ... }
    } catch (err) {
        log('Error fetching playlist: ' + err.message);
        return [];
    }
};

// Update Logic
const updateLibrary = async () => {
    log('Polling for new videos...');
    const serverList = await fetchPlaylist();

    // Find new items
    const newItems = serverList.filter(item => !playlist.find(p => p.id === item.id));

    if (newItems.length > 0) {
        log(`Found ${newItems.length} new videos!`);
        playlist = [...playlist, ...newItems];

        // Add new items to the FRONT of the queue (Priority)
        // But after the current one if playing?
        // Actually, just unshift them into the queue.
        // If queue is empty, they will play next.
        // If queue has items, they go to the top.
        queue.unshift(...newItems);
    } else {
        log('No new videos.');
    }

    // If queue is empty and we have a playlist, refill queue from playlist (Shuffle)
    if (queue.length === 0 && playlist.length > 0) {
        log('Queue empty. Refilling from library (Shuffled).');
        const refill = [...playlist];
        shuffle(refill);
        queue.push(...refill);
    }

    // If we were idle (no video playing), start playing
    if (player.paused || player.ended || !player.src) {
        playNext();
    }
};

// Play Next
const playNext = () => {
    if (queue.length === 0) {
        log('Queue empty, waiting...');
        return;
    }

    const nextVideo = queue.shift();
    currentVideoId = nextVideo.id;

    // Construct absolute URL if needed, or relative
    // Server returns "/videos/..."
    const src = `http://localhost:3000${nextVideo.url}`;

    log(`Playing: ${nextVideo.id}`);
    player.src = src;
    player.play().catch(e => log('Play error: ' + e.message));
};

// Events
player.addEventListener('ended', () => {
    log('Video ended.');
    playNext();
});

player.addEventListener('error', (e) => {
    log('Video error. Skipping.');
    playNext();
});

// Init
const init = async () => {
    await updateLibrary();

    // Start Polling
    setInterval(updateLibrary, POLL_INTERVAL);

    // Toggle Debug
    window.addEventListener('keydown', (e) => {
        if (e.key === 'd') {
            debugEl.style.display = debugEl.style.display === 'none' ? 'block' : 'none';
        }
    });
};

init();
