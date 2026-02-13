# Secure Domain Search Extension

Privacy-first domain availability checker for Chrome and Firefox, aiming to reduce the risk of [domain frontrunning](https://en.wikipedia.org/wiki/Domain_name_front_running).

## What It Does

- Checks domain availability only using DNS (DoH) and RDAP.
- Does not use registrar or 3rd party APIs to check domain availability.
- Supports batch lookups for multiple names/TLDs.
- Stores preferences and wishlist locally in extension storage.

## Project Structure

- `src/` - React app + domain check services.
- `public/` - extension manifests, icons, static assets.
- `dist/chrome/` - built Chrome extension.
- `dist/firefox/` - built Firefox extension.

## Requirements

- Node.js 18+ (recommended)
- npm

## Install

```bash
npm install
```

## Development

```bash
# Chrome watch build
npm run dev:chrome

# Firefox watch build
npm run dev:firefox
```

## Production Build

```bash
# Chrome only
npm run build:chrome

# Firefox only
npm run build:firefox

# Both
npm run build:all
```

## Load Locally

### Chrome

1. Go to `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `dist/chrome`.

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on...".
3. Select `dist/firefox/manifest.json`.

## License

This project is licensed under the Apache License 2.0.
See `LICENSE` and `NOTICE` for details.

This project powers the official **Secure Domain Search** Chrome/Firefox Extension. If you find forks or copies, ensure they comply with the Apache 2.0 license.