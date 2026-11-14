# Developer Website (Google Play Console Ready)

Minimalist, macOS-inspired static developer website for your Android + Mac companion app.

## Files
- `config.js` — **Edit this single file** to set your confirmed `appName`, `developerName`, `supportEmail`, `websiteDomain`, and store/download links.
- `index.html` — Minimalist landing page with interactive Mac window preview, features, setup steps, privacy summary, and developer info.
- `privacy.html` — Play-Store-ready Privacy Policy covering local-only peer-to-peer architecture and Android permissions (`SMS`, `NotificationListenerService`, `CAMERA`, screen projection/accessibility, mDNS/BLE).
- `support.html` — Developer support contact, FAQ, and system requirements.
- `terms.html` — Terms of Use.
- `styles.css` & `app.js` — Zero-dependency styling (system SF-style fonts, light/dark mode) and config binding.

## Local Preview
Run from the workspace root:
```sh
python3 -m http.server 8080 -d developer-site
```
Then open `http://localhost:8080`.

## Google Play Console URLs
After deploying the `developer-site/` folder to Cloudflare Pages, Vercel, Netlify, or GitHub Pages:
- **Developer Website:** `https://yourdomain.com/`
- **Privacy Policy URL:** `https://yourdomain.com/privacy.html`
- **Support / Help URL:** `https://yourdomain.com/support.html`
- **Support Email:** Matches `supportEmail` in `config.js` (also use a real monitored email address for Google Play verification).
