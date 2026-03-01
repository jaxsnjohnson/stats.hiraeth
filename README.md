# D&D 5e Stat Block Generator

Static, single-page web app for creating, previewing, sharing, and printing custom D&D 5e-style stat blocks.

## Features

- Live stat block rendering from form inputs
- Dynamic sections for:
  - Spellcasting
  - Traits
  - Actions
  - Bonus Actions
  - Reactions
  - Legendary Actions
  - Mythic Actions
  - Lair Actions
  - Regional Effects
- Markdown-style links in text fields (`[text](URL)`)
- Clickable dice notation in rendered text (for example, `2d6+3`) with roll modal
- URL-backed state sharing
- View-only and embed link modes
- Print-friendly output
- Light/dark theme toggle with persisted preference

## Quick Start

### Option A: Open directly

Open [`index.html`](./index.html) in your browser.

### Option B: Serve locally (recommended)

From the repo root:

```bash
python3 -m http.server 8000
```

Then open: <http://localhost:8000>

Using a local server can make clipboard and browser behavior more predictable than opening a file directly.

## How to Use

1. Fill out the form fields in the editor.
2. Click **Apply Changes** to re-render the stat block preview.
3. Click **Update URL** to encode current state into the query string.
4. Use:
   - **Copy View-Only Link** for a read-only shared page
   - **Copy Embed Link** for minimal embedded output
5. Click **Print** for paper/PDF output.
6. Click **Clear** to reset inputs and URL state.

## Query Parameters

The app reads/writes URL query parameters as its data model.

### Mode parameters

- `view=1` or `view=true`: hides editor and tips for read-only viewing
- `embed=1` or `embed=true`: minimal embed mode (no editor/tips/theme button)
- `demo=1`: loads demo/test sample data
- `debug=1`: enables debug logging and placeholder assertions in console

### Content parameters

Most content parameters map directly to form fields (for example: `name`, `ac`, `hp`, `cr`, `desc`, `source`, etc.).

Dynamic list sections are stored as JSON arrays in query values. Each item uses:

```json
{ "name": "Entry Name", "text": "Entry text" }
```

Dynamic section params:

- `spellcasting`
- `traits`
- `actions`
- `bonus`
- `reactions`
- `legendary`
- `mythic`
- `lair`
- `regional`

## Project Structure

- [`index.html`](./index.html): entire app (HTML, CSS, JavaScript)
- [`CNAME`](./CNAME): custom domain binding for GitHub Pages (`stats.hiraeth.wiki`)

## Deployment / Hosting

This project is static and can be hosted on:

- GitHub Pages
- Netlify
- Cloudflare Pages
- Any static web host

If you fork this repository:

- Update or remove [`CNAME`](./CNAME) unless you also control `stats.hiraeth.wiki`.

## Development Notes

- No build step
- No package manager required
- No framework dependency
- Core JavaScript responsibilities in `index.html` include:
  - Form -> data extraction and data -> form hydration
  - Rendering stat block sections
  - Query-string encode/decode and URL updates
  - View/embed mode handling
  - Dice parsing and modal roll display
  - Clipboard link generation

## Known Limitations

- Large stat blocks can produce very long URLs.
- Dynamic sections are query-encoded JSON, which can become hard to read manually.
- Clipboard copy behavior may be limited by browser permissions/context.

## License

No license file is currently present in this repository.

If you intend others to reuse this project, add a `LICENSE` file (for example: MIT, Apache-2.0, or GPL-3.0) and update this section.
