import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Regex to match relative imports: import ... from './...' or '../...'
  const importRegex = /(import\s+.*?from\s+['"])(\.[^'"]+)(['"])/g;
  
  let changed = false;
  const newContent = content.replace(importRegex, (match, p1, p2, p3) => {
    // If it already has .js or .json extension, skip
    if (p2.endsWith('.js') || p2.endsWith('.json') || p2.endsWith('.ts')) {
      return match;
    }
    changed = true;
    return `${p1}${p2}.js${p3}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') && !fullPath.endsWith('.d.ts')) {
      processFile(fullPath);
    }
  }
}

walk('./api');
walk('./src/application');
walk('./src/infrastructure');
walk('./src/domain');
