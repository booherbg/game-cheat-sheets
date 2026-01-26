# Prompts & Responses

Documentation of the prompts used to build the game-cheat-sheets project and a concise summary of each response.

---

## 1. Markdown → HTML via npm

**Prompt**

> What's the best way to port markdown to html via npm?

**Summary.** Compared three options: **marked** (simple, fast, good default), **markdown-it** (plugin-friendly), and **remark** (unified/doc-pipeline). Recommended `marked` for straightforward conversion and noted it supports GFM. Gave minimal `npm install` + `marked.parse()` examples for each.

---

## 2. `npm run build:euchre` to port `euchre.md` → `euchre.html`

**Prompt**

> I want to simply be able to run something like `npm build:euchre` which ports euchre/euchre.md into euchre/euchre.html

**Summary.** Added `package.json` with a `build:euchre` script and `marked` as a dev dependency. Implemented `scripts/build-euchre.js` to read `euchre/euchre.md`, convert with `marked`, wrap the result in a minimal HTML document (charset, viewport, basic CSS), and write `euchre/euchre.html`. Raw HTML in the Markdown (e.g. page-break divs) is preserved. Documented `npm install` and `npm run build:euchre` in the README.

---

## 3. Generic build script and title from Markdown

**Prompt**

> I want the build script to be generic. Just use the title in the euchre.md for the html title doc. We'll have more cheat sheets here eventually.

**Summary.** Replaced the euchre-specific script with `scripts/build.js`, which takes a sheet name as an argument (e.g. `node scripts/build.js euchre`). It reads `{name}/{name}.md` and writes `{name}/{name}.html`. The HTML `<title>` is taken from the first `#` heading in the Markdown (fallback: sheet name), with proper escaping. Updated `package.json` to `build:euchre` → `node scripts/build.js euchre`. Removed `build-euchre.js`. Described how to add future sheets (e.g. cribbage) with a matching folder and optional `build:cribbage` script.

---

## 4. `.gitignore` best practices

**Prompt**

> Update .gitignore with best practices

**Summary.** Expanded `.gitignore` with: `node_modules/`; npm logs and `.npm`; Yarn 2+–style paths (for later use); `.env`, `.env.local`, `.env.*.local`; `.DS_Store`, `Thumbs.db`; `*.log`; `.idea/`, `.vscode/`, Vim swap files; and `coverage/`, `.nyc_output/` for future tests.

---

## 5. README: use and adding a new game

**Prompt**

> Fill out very simple README.md with instructions for use and how to add a new card game

**Summary.** Wrote a short README with a **Use** section (`npm install`, `npm run build:euchre`, and where the HTML goes) and an **Add a new card game** section: create `{name}/{name}.md`, start with `#` title, optionally add `build:cribbage` in `package.json`, then run the build. Used cribbage as the example.

---

## 6. `build:all`, folder-based build, multiple `.md` per folder

**Prompt**

> Add instruction for `build:all` and include euchre, update README. Also update script so it knows to use the name for the folder, but will port each .md file into its own .html file regardless of name once the folder is found

**Summary.** Reworked `scripts/build.js` to be folder-based: you pass a folder name (e.g. `euchre`); it finds every `*.md` in that folder and emits a matching `*.html` (e.g. `rules.md` → `rules.html`). With no argument, it discovers all top-level folders (except `node_modules`, `scripts`, `.git`) that contain `.md` and builds each. Added `build:all` to `package.json` (runs `node scripts/build.js`). Updated the README to document `build:euchre` and `build:all`, and to explain that a game folder can hold multiple `.md` files (names need not match the folder) and that optional `build:foo` scripts can target a single game.

---

## 7. Document this conversation

**Prompt**

> Great. As the final act, let's document this conversation. Take every prompt that I had and keep it verbatim (including this one), along with a summary of the LLM response that is clear and topical. Create docs/prompts.md with smart formatting so we can document this work we did together.

**Summary.** Added `docs/prompts.md` with each user prompt quoted verbatim and a short, topical summary of the corresponding response. Used numbered sections, blockquotes for prompts, and horizontal rules between exchanges so the log is easy to scan and reuse.

---

## 8. Serve cheat sheets for review

**Prompt**

> Finally - create a way to serve out these cheat sheets for easy review. Should present an index page with each html file available as a link, with each sub-folder availble as an h2 with links to the files below it. `npm serve` should run this.

**Summary.** Added `scripts/serve.js`, a small Node HTTP server (no extra deps) that serves on port 3000 (or `PORT`). The index at `/` is generated: it discovers all top-level folders that contain `.html` (same skip list as build), renders each folder as an **h2**, and lists links to every `.html` in that folder below it. Routes like `/{folder}/{file}.html` serve only those HTML files from allowlisted folders; path traversal is blocked. Added a `serve` script to `package.json` (`npm run serve`). Updated the README with serve instructions.

---

## 9. Security audit of serve.js

**Prompt**

> As a follow-up, please model a cybersecurity researcher who is sensitive to exploiting web servers to gain unauthorized access. Audit build/serve.js to make sure we're not accidentally opening us up to common attacks.

**Summary.** Wrote `docs/SECURITY-AUDIT-serve.md` auditing path traversal, symlink escape, XSS, bind exposure, null bytes, HTTP method, info disclosure, and related issues. Hardened `scripts/serve.js`: `escapeHtml` now escapes `'`; listen on `HOST` (default `127.0.0.1`) instead of all interfaces; reject `filename` containing `\0`; return 405 with `Allow: GET` for non-GET. Verified path traversal and method handling with curl. Existing allowlist + `startsWith` checks already mitigated traversal and symlink escape.
