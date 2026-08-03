import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

const imagesToOptimize = [
  'favicon.png',
  'nintendologo.png',
  'xboxlogo.png',
  'playstationlogo.png',
  'logomp2.png',
  'ChatGPT Image 22_07_2026, 13_07_27.png'
];

async function optimizeImages() {
  for (const img of imagesToOptimize) {
    const inputPath = path.join(publicDir, img);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${img}, file not found.`);
      continue;
    }

    const ext = path.extname(img);
    const basename = path.basename(img, ext);
    
    if (img === 'favicon.png') {
        const outFaviconWebp = path.join(publicDir, `${basename}.webp`);
        await sharp(inputPath)
          .resize({ width: 256, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outFaviconWebp);
        console.log(`Optimized ${img} to ${basename}.webp (favicon size)`);
        
        const outFaviconPng = path.join(publicDir, `favicon_small.png`);
        await sharp(inputPath)
          .resize({ width: 256, withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(outFaviconPng);
        console.log(`Optimized ${img} to favicon_small.png`);
        fs.unlinkSync(inputPath);
        fs.renameSync(outFaviconPng, inputPath);
        continue;
    }

    const outputPath = path.join(publicDir, `${basename}.webp`);
    
    await sharp(inputPath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    console.log(`Optimized ${img} to ${basename}.webp`);
    
    fs.unlinkSync(inputPath);
  }
}

optimizeImages().catch(console.error);
