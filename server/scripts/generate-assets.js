import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '../assets/masters');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

ffmpeg.setFfmpegPath(ffmpegPath);

console.log('Generating 12 master frames...');

// Generate 12 frames
// We'll generate them one by one or use a complex filter. 
// Simplest is to loop.
const generateFrame = (index) => {
    return new Promise((resolve, reject) => {
        const text = `Frame ${index + 1}`;
        const outputPath = join(assetsDir, `frame_${index + 1}.png`);

        ffmpeg()
            .input('color=c=black:s=1280x720')
            .inputFormat('lavfi')
            .complexFilter([
                `drawtext=text='${text}':fontcolor=white:fontsize=100:x=(w-text_w)/2:y=(h-text_h)/2`
            ])
            .frames(1)
            .output(outputPath)
            .on('end', () => {
                console.log(`Generated ${outputPath}`);
                resolve();
            })
            .on('error', (err) => reject(err))
            .run();
    });
};

const run = async () => {
    for (let i = 0; i < 12; i++) {
        await generateFrame(i);
    }
    console.log('Done!');
};

run();
