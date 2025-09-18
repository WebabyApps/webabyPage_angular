
/**
 * Simple scan to catch incorrect Transloco pipe usage like:
 *   {{ key | transloco : {} : { scope: ... } }}
 * The pipe's 3rd arg is a LANGUAGE STRING, not an object.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const badPattern = /\|\s*transloco\s*:\s*\{\s*\}\s*:\s*\{[^}]*scope/;

let badFiles = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(html|ts|tsx|js|jsx)$/.test(name)) {
      const txt = fs.readFileSync(full,'utf8');
      if (badPattern.test(txt)) badFiles.push(full);
    }
  }
}

walk(projectRoot + '/app');
walk(projectRoot + '/assets');

if (badFiles.length) {
  console.error('❌ Found invalid Transloco pipe usages with object as 3rd argument:\n');
  for (const f of badFiles) console.error(' - ' + path.relative(projectRoot, f));
  process.exit(1);
}
console.log('✅ Transloco usage check passed.');
