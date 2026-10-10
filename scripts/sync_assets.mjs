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

// Copy all assets from assets/gender to public/assets/gender
let copiedCount = 2; // started with 2 base images
for (const g of ['male', 'female']) {
  const gSrc = path.join(rootDir, 'assets', g);
  const gDest = path.join(publicDir, g);
  if (fs.existsSync(gSrc)) {
    const files = fs.readdirSync(gSrc).filter(f => f.endsWith('.png'));
    for (const f of files) {
      fs.copyFileSync(path.join(gSrc, f), path.join(gDest, f));
      copiedCount++;
    }
  }
}

// Copy scene SVG/JPG/PNG backgrounds
const scenesSrcDir = path.join(rootDir, 'assets', 'scenes');
const scenesTargetDir = path.join(publicDir, 'scenes');
fs.mkdirSync(scenesTargetDir, { recursive: true });

if (fs.existsSync(scenesSrcDir)) {
  const sceneFiles = fs.readdirSync(scenesSrcDir).filter(f => f.endsWith('.svg') || f.endsWith('.jpg') || f.endsWith('.png'));
  for (const file of sceneFiles) {
    fs.copyFileSync(path.join(scenesSrcDir, file), path.join(scenesTargetDir, file));
  }
}

// Copy audio assets
const audioSrcDir = path.join(rootDir, 'assets', 'audio');
const audioTargetDir = path.join(publicDir, 'audio');
fs.mkdirSync(audioTargetDir, { recursive: true });

if (fs.existsSync(audioSrcDir)) {
  const audioFiles = fs.readdirSync(audioSrcDir);
  for (const file of audioFiles) {
    fs.copyFileSync(path.join(audioSrcDir, file), path.join(audioTargetDir, file));
  }
}

// Copy branding assets
const brandingSrcDir = path.join(rootDir, 'assets', 'branding');
const brandingTargetDir = path.join(publicDir, 'branding');
fs.mkdirSync(brandingTargetDir, { recursive: true });

if (fs.existsSync(brandingSrcDir)) {
  const brandingFiles = fs.readdirSync(brandingSrcDir);
  for (const file of brandingFiles) {
    fs.copyFileSync(path.join(brandingSrcDir, file), path.join(brandingTargetDir, file));
  }
}

// Copy demo assets
const demoSrcDir = path.join(rootDir, 'assets', 'demo');
const demoTargetDir = path.join(publicDir, 'demo');
fs.mkdirSync(demoTargetDir, { recursive: true });

if (fs.existsSync(demoSrcDir)) {
  const demoFiles = fs.readdirSync(demoSrcDir);
  for (const file of demoFiles) {
    fs.copyFileSync(path.join(demoSrcDir, file), path.join(demoTargetDir, file));
  }
}

console.log(`Synced character assets, scenes, audio, branding, and demo samples to public/assets/.`);

