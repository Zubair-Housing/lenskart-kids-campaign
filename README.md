# Lenskart Kids Campaign — Landing Page

Campaign landing page for the Lenskart Kids eyewear range launch, with a
free annual power-recheck highlighted throughout.

## Two versions in this repo

- **`docs/`** — static build served via GitHub Pages. No backend: the lead
  form validates and shows the thank-you state entirely in the browser,
  saving the submission to the visitor's own `localStorage` (not centrally
  collected).
- **`server.js` + `public/`** — the real version with a Node backend.
  Validates on the server and persists leads to `leads.json`. Run it with:

  ```
  node server.js
  ```

  Then open http://localhost:3000. No `npm install` required.
