import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, 'assets/masters');
const outputDir = join(__dirname, 'public/videos');

ffmpeg.setFfmpegPath(ffmpegPath);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

export const generateVideo = async (userId, glitchMode = false) => {
    const outputPath = join(outputDir, `submission_${userId}.mp4`);
    const publicUrl = `/videos/submission_${userId}.mp4`;

    return new Promise((resolve, reject) => {
        const command = ffmpeg();

        // Input: 12 frames
        // We can use a glob pattern or add inputs sequentially.
        // Since we want specific duration per frame (1/6 sec = ~6 fps), 
        // it's better to use the image2 demuxer with a pattern if they are named sequentially,
        // OR use the concat filter if we want to be explicit.
        // Let's use the pattern approach for simplicity: frame_%d.png

        command
            .input(join(assetsDir, 'frame_%d.png'))
            .inputOptions([
                '-framerate 6', // Input framerate (6 fps)
                '-start_number 1'
            ]);

        // Glitch Mode Logic
        if (glitchMode) {
            // Add some filters for the glitch effect
            // e.g., negate colors, or noise
            command.videoFilters([
                'negate',
                'noise=alls=20:allf=t+u'
            ]);
        }

        command
            .outputOptions([
                '-c:v libx264',
                '-pix_fmt yuv420p', // Important for browser compatibility
                '-r 6', // Output framerate
                '-movflags +faststart' // Web optimization
            ])
            .output(outputPath)
            .on('end', () => {
                console.log(`Video generated: ${outputPath}`);
                resolve(publicUrl);
            })
            .on('error', (err) => {
                console.error('Error generating video:', err);
                reject(err);
            })
            .run();
    });
};
