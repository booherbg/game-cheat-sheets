# Security Audit: `scripts/serve.js`

**Scope:** Local dev server that serves generated cheat-sheet HTML and a dynamic index.  
**Threat model:** Unauthorized access, path traversal, XSS, information disclosure, unintended network exposure.

---

## Findings & Mitigations

### 1. Path traversal (directory traversal)

**Risk:** Requesting `..` or encoded variants (e.g. `%2e%2e%2f`) to read files outside the project root.

**Analysis:**
- URL `pathname` is decoded once by `URL`. We split on `/` and require exactly two segments `[folder, filename]`.
- `folder` must be in the allowlist (from `discoverFoldersWithHtml()`). `..` is never allowlisted.
- `filename` is rejected if it contains `..`, `/`, or `\`.
- `serveFile` builds `filepath = path.join(root, folder, filename)`, resolves it, and checks `resolved.startsWith(path.resolve(root, folder))` so we never serve outside `root/folder`.

**Verdict:** Mitigated. No change required beyond existing checks.

---

### 2. Symlink escape

**Risk:** A symlink inside a served folder (e.g. `euchre/evil`) pointing to `/etc/passwd` could expose external files.

**Analysis:**
- `path.resolve(filepath)` resolves the symlink. We then require `resolved.startsWith(path.resolve(root, folder))`.
- A link to `/etc/passwd` resolves outside `root/folder`, so the check fails and we return 403.

**Verdict:** Mitigated.

---

### 3. Cross-site scripting (XSS) in index

**Risk:** Folder or filename (used in index HTML) contains `<script>`, `"`, etc., leading to injected script.

**Analysis:**
- We use `escapeHtml()` for `href`, link text (`base`), and `h2` (`folder`). We escape `&`, `<`, `>`, `"`.
- Attributes use double quotes; single quotes were not escaped. In standard HTML that’s acceptable, but escaping `'` too is defense-in-depth.

**Verdict:** Low risk. **Fix applied:** Escape `'` as `&#39;` in `escapeHtml`.

---

### 4. Unintended network exposure

**Risk:** `server.listen(port)` binds to all interfaces (`0.0.0.0`). If the host is reachable (LAN, cloud), others can access the server.

**Analysis:**
- This is a “review locally” dev server. Binding to all interfaces increases exposure without clear benefit.

**Verdict:** **Fix applied:** Listen on `HOST` (default `127.0.0.1`) only. Port remains `PORT` (default 3000).

---

### 5. Null bytes in path segments

**Risk:** Filename containing `\0` (e.g. `euchre.html%00`) could confuse `path`/`fs` on some setups or bypass checks.

**Analysis:**
- URL pathname typically doesn’t include nulls, but explicitly rejecting them is simple and robust.

**Verdict:** **Fix applied:** Reject `filename` if it includes `\0`.

---

### 6. HTTP method

**Risk:** We don’t check `req.method`. PUT/POST/DELETE etc. are handled like GET (read-only), but restricting to GET aligns with “static server” and reduces odd behavior.

**Analysis:**
- No state is modified. Restricting to GET is a hygiene improvement.

**Verdict:** **Fix applied:** Return 405 for non-GET with `Allow: GET`. HEAD is not supported.

---

### 7. Information disclosure

**Risk:** Leaking stack traces, internal paths, or directory listings outside allowlisted folders.

**Analysis:**
- We return plain “Not Found” or “Forbidden” with no server-generated details.
- Only allowlisted folders (those containing `.html`) are considered; we never expose `node_modules`, `scripts`, etc.

**Verdict:** Acceptable. No change.

---

### 8. Double URL decoding / encoded path tricks

**Analysis:**
- We use `URL.pathname` only; Node decodes once. We don’t decode again.
- Traversal via encoded `../` still yields two path segments only when we have `folder/filename`; `folder` allowlist and `filename` checks prevent misuse.

**Verdict:** Mitigated.

---

### 9. Content of served HTML files

**Risk:** Built `.html` files may contain arbitrary script (e.g. from markdown or build pipeline). We serve them as-is.

**Analysis:**
- We don’t sanitize file contents. Trust boundary is “content under project control.” This is a conscious tradeoff for a local dev server.

**Verdict:** Accepted. Document as operational note; no code change.

---

## Summary of code changes

| Item | Change |
|------|--------|
| Bind address | Listen on `HOST` (default `127.0.0.1`) instead of all interfaces |
| XSS | Escape `'` in `escapeHtml` |
| Null bytes | Reject `filename` containing `\0` |
| HTTP method | 405 for non-GET, `Allow: GET` |

---

## Operational notes

- **Local use:** Server is intended for local review. Don’t expose it to untrusted networks.
- **Content trust:** Served HTML is not sanitized; ensure built content is trusted.
- **Dependencies:** Uses only Node built-ins (`http`, `fs`, `path`); no additional dependency surface.
