import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rulesPath = path.join(rootDir, 'data', 'rules.json');
const itemsPath = path.join(rootDir, 'data', 'items.json');
const outputPath = path.join(rootDir, 'docs', 'RULES.md');

const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

// Build kind to name_en map
const kindToNameEn = {};
for (const item of items) {
  if (item.kind && item.name_en) {
    kindToNameEn[item.kind] = item.name_en;
  }
}

function formatMatcher(m) {
  if (m.kind) {
    return kindToNameEn[m.kind] || m.kind;
  }
  if (m.attr) {
    if (m.attr === 'stand_collar') return 'garment with stand collar';
    if (m.attr === 'ceremonial') return 'ceremonial garment';
    if (m.attr === 'modern') return 'modern piece';
    return `item with attr "${m.attr}"`;
  }
  if (m.set) {
    return `garment from Set ${m.set}`;
  }
  return JSON.stringify(m);
}

function getCondition(rule) {
  if (rule.type === 'duplicate_slot') {
    return `2 or more items in "${rule.slot}" slot`;
  }
  if (rule.type === 'combo') {
    return rule.all.map(formatMatcher).join(' + ');
  }
  return rule.type;
}

let md = '# Cultural-Fit Rules\n\n';
md += '| ID | Level | Condition (English) | Message (Vietnamese) |\n';
md += '| --- | --- | --- | --- |\n';

for (const rule of rules) {
  const condition = getCondition(rule);
  md += `| ${rule.id} | ${rule.level} | ${condition} | ${rule.message_vi} |\n`;
}

fs.writeFileSync(outputPath, md, 'utf-8');
console.log(`Generated ${outputPath} with ${rules.length} rules.`);
