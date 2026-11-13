import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

console.log('--- STARTING COMPREHENSIVE CODEBASE & ROUTE AUDIT ---');

let totalFilesChecked = 0;
let errorsFound = [];

function checkFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  totalFilesChecked++;

  // Match import statements: import ... from './...' or '../...'
  const importRegex = /import\s+(?:[\s\S]*?from\s+)?['"](\.[^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const dir = path.dirname(filePath);
    let resolved = path.resolve(dir, importPath);

    // Try extensions: .js, .jsx, /index.js, /index.jsx
    const candidates = [
      resolved,
      resolved + '.js',
      resolved + '.jsx',
      path.join(resolved, 'index.js'),
      path.join(resolved, 'index.jsx'),
    ];

    const exists = candidates.some(c => fs.existsSync(c));
    if (!exists) {
      errorsFound.push({
        file: path.relative(srcDir, filePath),
        importPath,
        msg: `Cannot resolve import: "${importPath}"`
      });
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      checkFileImports(full);
    }
  }
}

walkDir(srcDir);

console.log(`Total JS/JSX files audited for broken import paths: ${totalFilesChecked}`);

if (errorsFound.length === 0) {
  console.log('✅ ZERO BROKEN IMPORTS FOUND ACROSS THE ENTIRE FRONTEND REPOSITORY.');
} else {
  console.error(`❌ FOUND ${errorsFound.length} BROKEN IMPORTS:`);
  errorsFound.forEach(e => console.error(`  - ${e.file}: ${e.msg}`));
  process.exit(1);
}

