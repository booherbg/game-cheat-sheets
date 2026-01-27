const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const skipDirs = new Set(['node_modules', 'scripts', '.git']);

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function discoverFoldersWithHtml() {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const folders = [];
  for (const e of entries) {
    if (!e.isDirectory() || skipDirs.has(e.name)) continue;
    const dir = path.join(root, e.name);
    const files = fs.readdirSync(dir);
    if (files.some((f) => f.endsWith('.html'))) folders.push(e.name);
  }
  return folders.sort();
}

function generateIndex() {
  const folders = discoverFoldersWithHtml();
  const sections = folders.map((folder) => {
    const dir = path.join(root, folder);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.html'))
      .sort();
    const links = files
      .map((f) => {
        const base = path.basename(f, '.html');
        const href = `${folder}/${f}`;
        return `    <li><a href="${escapeHtml(href)}">${escapeHtml(base)}</a></li>`;
      })
      .join('\n');
    return `  <h2>${escapeHtml(folder)}</h2>\n  <ul>\n${links}\n  </ul>`;
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cheat Sheets</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.15rem; margin-top: 1.5em; margin-bottom: 0.5em; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { margin: 0.25em 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Cheat Sheets</h1>
${sections.join('\n\n')}
</body>
</html>
`;
}

const indexPath = path.join(root, 'index.html');
const html = generateIndex();
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Generated index.html');
