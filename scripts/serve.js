const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.resolve(__dirname, '..');
const skipDirs = new Set(['node_modules', 'scripts', '.git']);
const port = Number(process.env.PORT) || 3000;

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
        const href = `/${folder}/${f}`;
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

function send(res, status, body, contentType = 'text/html') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function serveFile(res, folder, filename) {
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename.includes('\0')
  ) {
    send(res, 403, 'Forbidden');
    return;
  }
  const filepath = path.join(root, folder, filename);
  const resolved = path.resolve(filepath);
  if (!resolved.startsWith(path.resolve(root, folder))) {
    send(res, 403, 'Forbidden');
    return;
  }
  if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
    send(res, 404, 'Not Found');
    return;
  }
  const ext = path.extname(filename).toLowerCase();
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
  const contentType = types[ext] || 'application/octet-stream';
  send(res, 200, fs.readFileSync(filepath), contentType);
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url || '/', `http://localhost:${port}`);
  const p = u.pathname.replace(/\/$/, '') || '/';
  if (p === '/' || p === '/index.html') {
    send(res, 200, generateIndex());
    return;
  }
  const parts = p.split('/').filter(Boolean);
  if (parts.length !== 2) {
    send(res, 404, 'Not Found');
    return;
  }
  const [folder, filename] = parts;
  const folders = discoverFoldersWithHtml();
  if (!folders.includes(folder) || !filename.endsWith('.html')) {
    send(res, 404, 'Not Found');
    return;
  }
  serveFile(res, folder, filename);
});

server.listen(port, () => {
  console.log(`Serving at http://localhost:${port}`);
});
