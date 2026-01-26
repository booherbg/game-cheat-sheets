const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '127.0.0.1';

function send(res, status, body, contentType = 'text/html') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

function serveFile(res, filepath) {
  const resolved = path.resolve(filepath);
  if (!resolved.startsWith(root)) {
    send(res, 403, 'Forbidden');
    return;
  }
  if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
    send(res, 404, 'Not Found');
    return;
  }
  const contentType = getContentType(filepath);
  send(res, 200, fs.readFileSync(filepath), contentType);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' });
    res.end();
    return;
  }
  const u = new URL(req.url || '/', `http://${host}:${port}`);
  let p = u.pathname;
  
  // Normalize path
  if (p === '/') {
    p = '/index.html';
  }
  
  // Remove leading slash and resolve
  const filepath = path.join(root, p.replace(/^\//, ''));
  serveFile(res, filepath);
});

server.listen(port, host, () => {
  console.log(`Serving at http://${host}:${port}`);
});
