# Game Cheat Sheets

Markdown cheat sheets for card games, built to HTML. As an additional feature I included the prompts I used to generate the build system once the first cheat sheet was finished.n

## Use

```bash
npm install
```

**Build** one folder (e.g. euchre or docs):

```bash
npm run build:euchre
npm run build:docs
```

**Build all** folders that contain `.md`:

```bash
npm run build:all
```

**Serve** the built HTML for review:

```bash
npm run serve
```

Then open http://localhost:3000. The index lists each folder with `.html` as an **h2**; links to its files appear below.

Each `.md` in a folder becomes a `.html` with the same base name (e.g. `euchre/euchre.md` → `euchre/euchre.html`). The HTML `<title>` comes from the first `#` heading in the file.

## Add a new card game

1. Create a folder (e.g. `cribbage/`) and add one or more `.md` files. Each will get its own `.html`; names need not match the folder (e.g. `cribbage/rules.md` → `cribbage/rules.html`).
2. Start each file with a level‑1 heading for the doc title: `# Cribbage Cheat Sheet`.
3. Optionally add a build script in `package.json`:

   ```json
   "build:cribbage": "node scripts/build.js cribbage"
   ```

4. Run `npm run build:cribbage` for that game, or `npm run build:all` to build every folder that contains `.md` files.
