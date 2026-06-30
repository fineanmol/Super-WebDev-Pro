import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

// Defaults for every persisted setting. Hoisted to module scope so both the
// first-open (build) path and the reopen path can read them.
const defaultSettings = {
  sidebarPosition: "right",
  colorFormat: "hex",
  colorAutoCopy: true,
  extractBgImages: true,
  extractMetaTags: true,
  screenshotFormat: "png",
  screenshotAutoDownload: true,
  exportInlineCSS: true,
  cssHighlightBoxModel: true,
  deleteConfirm: true
};

// Settings panes — keyed by a stable tab id (NOT button text, which contains
// SVG markup and whitespace and is unreliable to match on).
const contentPanes = {
  "about": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">About</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">SuperDev Pro — an all-in-one browser developer toolkit.</p>
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap:12px;">
      <div>
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #fff;">Status</div>
        <div style="font-size: 12px; color: var(--text-secondary);">
          <span style="color: #4ade80; font-weight: 600;">All tools unlocked</span> · Free · v1.0.0
        </div>
      </div>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
        Every tool — CSS inspection, color tools, screenshots, exports, audits and
        more — is available at no cost. No account or license key is required.
      </div>
    </div>
  `,
  "appearance": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Appearance</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Customize the look and feel of SuperDev Pro.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
        <div>
          <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Sidebar Position</div>
          <div style="font-size:12px; color:var(--text-secondary);">Default docking side for the main HUD.</div>
        </div>
        <select data-setting="sidebarPosition" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
          <option value="right">Right (Default)</option>
          <option value="left">Left</option>
        </select>
      </div>

      <div style="margin-top:24px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08);">
        <div style="font-weight:600; font-size:14px; margin-bottom:4px; color:#ef4444;">Deactivate Extension</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Completely unload WebDev Pro from this webpage. Press Cmd+Shift+E or click the extension icon to restart it.</div>
        <button id="settings-deactivate-btn" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; transition:background 0.2s;">
          Turn Off WebDev Pro
        </button>
      </div>
    </div>
  `,
  "color-picker": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Color Picker Settings</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure how colors are extracted and copied.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
        <div>
          <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Default Color Format</div>
          <div style="font-size:12px; color:var(--text-secondary);">Format copied to clipboard on click.</div>
        </div>
        <select data-setting="colorFormat" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
          <option value="hex">HEX (#FFFFFF)</option>
          <option value="rgb">RGB (rgb(255,255,255))</option>
          <option value="hsl">HSL (hsl(0,0%,100%))</option>
        </select>
      </div>
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="colorAutoCopy" /> Auto-copy to clipboard on click
      </label>
    </div>
  `,
  "extract-images": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Extract Images</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure media scraping defaults.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="extractBgImages" /> Capture background-image CSS properties
      </label>
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="extractMetaTags" /> Capture Favicons & OG Meta tags
      </label>
    </div>
  `,
  "screenshot": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Screenshot Settings</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Manage image capture quality and format.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
        <div>
          <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Format</div>
        </div>
        <select data-setting="screenshotFormat" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
          <option value="png">PNG (High Quality)</option>
          <option value="jpeg">JPEG (Smaller Size)</option>
          <option value="webp">WebP</option>
        </select>
      </div>
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="screenshotAutoDownload" /> Auto-download on capture
      </label>
    </div>
  `,
  "export-element": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Export Element</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure element bundle extraction.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="exportInlineCSS" /> Inline computed CSS into the exported snippet
      </label>
    </div>
  `,
  "css-inspector": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">CSS Inspector</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure layout overlays and property formats.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="cssHighlightBoxModel" /> Highlight element box-model on hover
      </label>
    </div>
  `,
  "delete-element": `
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Delete Element</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configuration for element deletion tool.</p>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
        <input type="checkbox" data-setting="deleteConfirm" /> Require confirmation for container nodes
      </label>
    </div>
  `
};

const defaultContent = `
  <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-secondary); opacity:0.5;">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:16px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    <div style="font-size:16px; font-weight:500;">Settings panel under construction</div>
    <div style="font-size:12px; margin-top:8px;">Detailed configuration options coming soon.</div>
  </div>
`;

function initPaneSettings(p, tabId) {
  if (tabId === "about") {
    return; // Static informational pane — no interactive settings.
  }

  if (tabId === "appearance") {
    const deactBtn = p.querySelector("#settings-deactivate-btn");
    if (deactBtn) {
      deactBtn.onclick = () => {
        import("../ui/hud.js").then(m => m.destroyHUD());
      };
    }
  }

  const elements = p.querySelectorAll("[data-setting]");
  if (elements.length === 0) return;

  const keys = Array.from(elements).map(el => el.getAttribute("data-setting"));
  chrome.storage.local.get(keys, (res) => {
    elements.forEach(el => {
      const key = el.getAttribute("data-setting");
      const savedVal = res[key];
      const defaultVal = defaultSettings[key];
      const currentVal = savedVal !== undefined ? savedVal : defaultVal;

      if (el.type === "checkbox") {
        el.checked = !!currentVal;
      } else if (el.tagName === "SELECT") {
        el.value = currentVal;
      }

      el.onchange = () => {
        const val = el.type === "checkbox" ? el.checked : el.value;
        chrome.storage.local.set({ [key]: val }, () => {
          showToast(`Saved setting: ${key.replace(/([A-Z])/g, ' $1')}`);
          if (key === "sidebarPosition") {
            import("../ui/hud.js").then(m => m.setSidebarPosition(val));
          }
        });
      };
    });
  });
}

// Sidebar navigation items: stable id + label + icon.
const NAV_ITEMS = [
  { id: "about", label: "About", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>` },
  { id: "appearance", label: "Appearance", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>` },
  { id: "css-inspector", label: "CSS Inspector", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` },
  { id: "color-picker", label: "Color Picker", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>` },
  { id: "screenshot", label: "Screenshot", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>` },
  { id: "export-element", label: "Export Element", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>` },
  { id: "extract-images", label: "Extract Images", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` },
  { id: "delete-element", label: "Delete Element", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>` }
];

function renderPane(modal, tabId) {
  const pane = modal.querySelector("#settings-content-pane");
  pane.innerHTML = contentPanes[tabId] || defaultContent;
  initPaneSettings(pane, tabId);
}

export function setupSettings() {
    let modal = state.shadowRoot.getElementById("settings-modal-overlay");
    if (modal) {
      // Modal already built — just re-show it and reset to the first (About) tab.
      modal.style.display = "flex";
      const navBtns = modal.querySelectorAll(".settings-nav-btn");
      navBtns.forEach(b => {
        const isFirst = b.getAttribute("data-tab") === "about";
        b.classList.toggle("active", isFirst);
        b.style.background = isFirst ? "rgba(255,255,255,0.05)" : "none";
        b.style.color = isFirst ? "#fff" : "var(--text-secondary)";
      });
      renderPane(modal, "about");
      return;
    }

    modal = document.createElement("div");
    modal.id = "settings-modal-overlay";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.zIndex = "2147483647";
    modal.style.background = "rgba(10, 10, 15, 0.95)";
    modal.style.display = "flex";
    modal.style.flexDirection = "column";
    modal.style.fontFamily = "var(--font-primary)";
    modal.style.color = "var(--text-primary)";
    modal.style.backdropFilter = "blur(12px)";

    const navHTML = NAV_ITEMS.map((item, i) => `
      <button class="settings-nav-btn ${i === 0 ? "active" : ""}" data-tab="${item.id}" style="background:${i === 0 ? "rgba(255,255,255,0.05)" : "none"}; color:${i === 0 ? "#fff" : "var(--text-secondary)"}; border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
        ${item.icon}
        ${item.label}
      </button>
    `).join("");

    modal.innerHTML = `
      <div style="display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; opacity:0.8;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        <span style="font-size: 16px; font-weight: 600;">Settings</span>
        <div style="width:6px; height:6px; background:#4ade80; border-radius:50%; margin-left:8px; box-shadow:0 0 8px #4ade80;"></div>
        <button id="settings-close-btn" style="margin-left:auto; background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div style="display: flex; flex: 1; overflow: hidden;">
        <div style="width: 250px; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; overflow-y: auto; padding: 16px 0;">
          <div style="padding: 0 20px; font-size: 10px; font-weight: 700; color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 12px;">
            SETTINGS
          </div>
          ${navHTML}
        </div>
        <div id="settings-content-pane" style="flex: 1; padding: 40px; overflow-y: auto; display:flex; flex-direction:column; gap:24px;">
          <!-- Content injects here -->
        </div>
      </div>
    `;
    state.shadowRoot.appendChild(modal);

    renderPane(modal, "about");

    const navBtns = modal.querySelectorAll(".settings-nav-btn");
    navBtns.forEach(btn => {
      btn.onclick = () => {
        navBtns.forEach(b => {
          b.classList.remove("active");
          b.style.background = "none";
          b.style.color = "var(--text-secondary)";
        });
        btn.classList.add("active");
        btn.style.background = "rgba(255,255,255,0.05)";
        btn.style.color = "#fff";
        renderPane(modal, btn.getAttribute("data-tab"));
      };
    });

    modal.querySelector("#settings-close-btn").onclick = () => {
      modal.style.display = "none";
      deactivateCurrentTool();
    };
  }
