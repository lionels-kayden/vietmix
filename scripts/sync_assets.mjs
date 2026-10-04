import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const itemsPath = path.join(rootDir, 'data', 'items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

const publicDir = path.join(rootDir, 'public', 'assets');
const maleTargetDir = path.join(publicDir, 'male');
const femaleTargetDir = path.join(publicDir, 'female');

fs.mkdirSync(maleTargetDir, { recursive: true });
fs.mkdirSync(femaleTargetDir, { recursive: true });

// Copy base character PNGs
const maleBaseSrc = path.join(rootDir, 'assets', 'male', 'male_base.png');
const maleBaseDest = path.join(maleTargetDir, 'male_base.png');
if (fs.existsSync(maleBaseSrc)) {
  fs.copyFileSync(maleBaseSrc, maleBaseDest);
}

const femaleBaseSrc = path.join(rootDir, 'assets', 'female', 'female_base.png');
const femaleBaseDest = path.join(femaleTargetDir, 'female_base.png');
if (fs.existsSync(femaleBaseSrc)) {
  fs.copyFileSync(femaleBaseSrc, femaleBaseDest);
}

// Copy known catalog items
let copiedCount = 2; // started with 2 base images
for (const item of items) {
  const gender = item.gender;
  const filename = item.image_file;
  const src = path.join(rootDir, 'assets', gender, filename);
  const dest = path.join(publicDir, gender, filename);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copiedCount++;
  } else {
    console.warn(`Warning: source asset missing: ${src}`);
  }
}

console.log(`Synced ${copiedCount} assets to public/assets/ (expected: 22).`);
