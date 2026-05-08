import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'public', 'sequence');
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png')).sort();

let converted = 0;

console.log(`Converting ${files.length} PNG files to WebP...`);

Promise.all(
  files.map((file, idx) => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(inputDir, file.replace('.png', '.webp'));
    
    return sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => {
        converted++;
        if (converted % 20 === 0) {
          console.log(`Converted ${converted}/${files.length}...`);
        }
      });
  })
).then(() => {
  console.log(`✓ All ${converted} files converted to WebP!`);
  console.log('Deleting original PNGs...');
  
  files.forEach(file => {
    fs.unlinkSync(path.join(inputDir, file));
  });
  
  console.log('✓ Original PNGs deleted.');
  
  const newSize = fs.readdirSync(inputDir)
    .reduce((sum, f) => sum + fs.statSync(path.join(inputDir, f)).size, 0) / 1024 / 1024;
  
  console.log(`✓ New total size: ${newSize.toFixed(1)} MB`);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
