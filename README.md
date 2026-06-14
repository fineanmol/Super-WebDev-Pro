# ⚡ SuperDev Pro — The Ultimate Web Developer Extensions Suite

[![Manifest Version](https://img.shields.io/badge/manifest-v3-blue.svg?style=flat-square)](#)
[![Bundler](https://img.shields.io/badge/bundler-esbuild-yellow.svg?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Platform Compatibility](https://img.shields.io/badge/platform-chrome%20%7C%20firefox%20%7C%20edge-orange.svg?style=flat-square)](#)

SuperDev Pro is a premium, all-in-one browser extension that packs **50+ web developer & designer tools** directly inside a sleek, responsive sidebar HUD. Completely modularized and sandboxed in a clean Shadow DOM, it replaces dozens of standalone extensions, letting you inspect, edit, design, and audit any webpage without ever opening your browser's dev tools console.

---

## 🚀 Key Features Catalog

SuperDev Pro is structured into core feature areas accessible through a floating HUD or options panel:

### 🔍 1. Inspect & Edit
* **CSS Inspector**: Inspect and modify CSS properties live with autocompletion. Save, copy, or export modifications in real-time.
* **Live Text Editor**: Instantly edit page copy/text content in a single click with deep history tracking.
* **Export Element**: Extract any HTML/CSS node bundle and export it directly to CodePen or as a local file.
* **Image Swap**: Swap image assets on the fly with local files or remote URLs.
* **Delete Element**: Safely clear unwanted or blocking elements from the DOM with full undo history.

### 🎨 2. Colors & Typography
* **Color Picker**: Pixel-level eyedropper tool to capture colors and auto-copy them in HEX, RGB, or HSL format.
* **Color Palette**: Automatically extract the primary color schemes and palettes used across the active webpage.
* **Font Changer**: Instantly preview and apply over 1,100+ Google Fonts and local font weights.
* **List Fonts**: Map every font family used on the page, with rendering specs, sizes, and font-weight breakdowns.

### 📏 3. Layout & Diagnostics
* **Page Ruler**: Measure pixel distances and coordinates between elements with extreme precision.
* **Outliner**: Outline elements to visualize layouts, flexbox flows, and CSS grid boundaries.
* **Move Element**: Drag and reposition DOM elements dynamically while maintaining baseline styles.
* **Responsive Viewer**: Multi-device viewport simulator with fluid resizing, device catalogs, and synchronous scrolling.

### 💻 4. Audits & Utilities
* **Tech Stack Detector**: Analyze frameworks, libraries, analytical scripts, and tools a site is built with.
* **SEO Meta Inspector**: Instant reporting on headings hierarchy, canonical tags, description lengths, and social graphs.
* **Accessibility Audit**: Real-time evaluation of ARIA attributes, image alt tags, tap targets, and contrast ratios.
* **Command Palette**: Run actions and trigger tools instantly via an interactive search palette.

---

## ⌨️ Global Keyboard Shortcuts

Control the extension instantly from any page using standard, non-conflicting keyboard shortcuts:

| Action | macOS Shortcut | Windows / Linux Shortcut |
| :--- | :--- | :--- |
| **Toggle Sidebar** | `Command` + `Shift` + `E` | `Ctrl` + `Shift` + `E` |
| **Open Command Palette** | `Command` + `Shift` + `P` | `Ctrl` + `Shift` + `P` |
| **Close Active Tool** | `Escape` | `Escape` |

---

## 📦 Architecture & Directory Structure

SuperDev Pro uses a highly decoupled, state-driven architecture. All tool UI panels, canvases, and guidelines are isolated inside a **Shadow DOM** (`#super-webdev-hud-host`) to prevent styling bleed or page-level conflicts.

```
super-web-dev-extension/
├── manifest.json            # MV3 extension configuration
├── background.js            # Background worker (CORS downloads, capture context)
├── popup.html               # Dropdown option panel markup
├── popup.js                 # Popup triggers and local activation checks
├── styles.css               # Popup and Options stylesheets
├── dist/
│   └── content.js           # Compiled esbuild target bundle
└── src/                     # Source directory
    ├── content.js           # Extension entry point & message router
    ├── state.js             # Global reactive state definitions
    ├── utils.js             # Side-effect-free helpers (HTML escaping, color conversions)
    ├── core/
    │   └── tool-manager.js  # Tool activator/deactivator registry
    ├── ui/
    │   ├── drawer.js        # Info panel drawer rendering
    │   ├── highlight.js     # Highlight guidelines & tooltip box
    │   ├── hud.js           # Core sidebar initialization and toggle managers
    │   └── toast.js         # User action feedback toast banner
    └── features/            # Feature modules (CSS Inspector, Ruler, A11y, etc.)
```

---

## ⚙️ Installation & Development Setup

### Prerequisites
* **Node.js** (v16+)
* **npm**

### 1. Build from Source
First, clone the repository and install dev dependencies (used for esbuild):
```bash
git clone https://github.com/fineanmol/Super-WebDev-Pro.git
cd Super-WebDev-Pro
npm install
```

Compile the modular source scripts into the final content bundle:
```bash
# One-time build
npm run build

# Development watch mode
npm run watch
```

### 2. Load the Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Turn on the **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left.
4. Select the root `super-web-dev-extension` project folder.

---

## 🛡️ Security, Privacy, and Performance

* **Sanitized Interpolations**: Incorporates a strict `escapeHTML` helper to sanitize all page-controlled variables (e.g. document titles, meta descriptors, headings) preventing HTML/XSS injection on target websites.
* **CORS Bypass via Service Worker**: Image extraction downloads are routed through background message passing utilizing `chrome.downloads` in `background.js` to ensure reliable cross-origin downloads without violating browser security sandboxes.
* **Local CSP Compliance**: Google Fonts `@import` references have been replaced with beautiful, modern local font stacks to adhere to MV3 content security rules.
* **Persistent Deactivation**: Closing the extension sidebar commits a `hudEnabled: false` setting to `chrome.storage.local`. The extension remains unloaded on subsequent tabs and refreshes until explicitly reactivated.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
