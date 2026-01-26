const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = path.resolve(__dirname, '..');
const skipDirs = new Set(['node_modules', 'scripts', '.git']);

marked.setOptions({ gfm: true });

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFile(folder, base) {
  const src = path.join(root, folder, `${base}.md`);
  const out = path.join(root, folder, `${base}.html`);
  const md = fs.readFileSync(src, 'utf8');
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : base;
  const body = marked.parse(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.5; max-width: 48rem; margin: 0 auto; padding: 0rem 1.5rem; }
    h1 { font-size: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25em; }
    h2 { font-size: 1.25rem;}
    h3 { font-size: 1.1rem;}
    ul { padding-left: 1.5em; }
    hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
    .page { page-break-after: always; }
  </style>
</head>
<body>
${body}
</body>
</html>
`;
  fs.writeFileSync(out, html, 'utf8');
  console.log(`Built ${folder}/${base}.html from ${folder}/${base}.md`);
}

function buildFolder(folder) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`No such folder: ${folder}`);
    process.exit(1);
  }
  const entries = fs.readdirSync(dir);
  const mdFiles = entries.filter((e) => e.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.error(`No .md files in ${folder}/`);
    process.exit(1);
  }
  for (const f of mdFiles) {
    const base = path.basename(f, '.md');
    buildFile(folder, base);
  }
}

function discoverFolders() {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const folders = [];
  for (const e of entries) {
    if (!e.isDirectory() || skipDirs.has(e.name)) continue;
    const dir = path.join(root, e.name);
    const files = fs.readdirSync(dir);
    if (files.some((f) => f.endsWith('.md'))) folders.push(e.name);
  }
  return folders.sort();
}

const folder = process.argv[2];
if (folder) {
  buildFolder(folder);
} else {
  const folders = discoverFolders();
  if (folders.length === 0) {
    console.error('No folders with .md files found.');
    process.exit(1);
  }
  for (const f of folders) buildFolder(f);
}
