import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
// Allow all origins for now to support GitHub Pages and local dev
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import { db } from './db.js';
import { generateVideo } from './video-generator.js';
import { v4 as uuidv4 } from 'uuid';

// Submit Endpoint
app.post('/api/submit', async (req, res) => {
    try {
        const { userId, foundAll, glitchMode } = req.body;

        if (!foundAll) {
            return res.status(400).json({ error: 'Must find all frames first' });
        }

        const finalUserId = userId || uuidv4();
        console.log(`Processing submission for user: ${finalUserId}, Glitch: ${glitchMode}`);

        // Generate Video
        const videoUrl = await generateVideo(finalUserId, glitchMode);

        // Save to DB
        const submission = {
            id: finalUserId,
            url: videoUrl,
            glitchMode: !!glitchMode,
            createdAt: new Date().toISOString()
        };

        await db.read();
        db.data.submissions.push(submission);
        await db.write();

        res.json({ success: true, videoUrl });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Playlist Endpoint
app.get('/api/playlist', async (req, res) => {
    await db.read();
    res.json(db.data.submissions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static files from ${join(__dirname, 'public')}`);
});
