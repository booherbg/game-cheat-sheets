const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/build.js <sheet-name>');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const src = path.join(root, name, `${name}.md`);
const out = path.join(root, name, `${name}.html`);

if (!fs.existsSync(src)) {
  console.error(`No such file: ${name}/${name}.md`);
  process.exit(1);
}

marked.setOptions({ gfm: true });

const md = fs.readFileSync(src, 'utf8');
const titleMatch = md.match(/^#\s+(.+)$/m);
const title = titleMatch ? titleMatch[1].trim() : name;

const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; font-size: 16px; line-height: 1.5; max-width: 48rem; margin: 0 auto; padding: 1.5rem; }
    h1 { font-size: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25em; }
    h2 { font-size: 1.25rem; margin-top: 1.5em; }
    h3 { font-size: 1.1rem; margin-top: 1em; }
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
console.log(`Built ${name}/${name}.html from ${name}/${name}.md`);

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
