# Game Cheat Sheets

Markdown cheat sheets for card games, built to HTML.

## Use

```bash
npm install
```

Build one game (e.g. euchre):

```bash
npm run build:euchre
```

Build all games:

```bash
npm run build:all
```

Each `.md` in a game folder becomes a `.html` with the same base name (e.g. `euchre/euchre.md` → `euchre/euchre.html`). The HTML `<title>` comes from the first `#` heading in the file.

## Add a new card game

1. Create a folder (e.g. `cribbage/`) and add one or more `.md` files. Each will get its own `.html`; names need not match the folder (e.g. `cribbage/rules.md` → `cribbage/rules.html`).
2. Start each file with a level‑1 heading for the doc title: `# Cribbage Cheat Sheet`.
3. Optionally add a build script in `package.json`:

   ```json
   "build:cribbage": "node scripts/build.js cribbage"
   ```

4. Run `npm run build:cribbage` for that game, or `npm run build:all` to build every folder that contains `.md` files.
