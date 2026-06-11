import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export function setupSettings() {
    let modal = state.shadowRoot.getElementById("settings-modal-overlay");
    if (!modal) {
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
            <div style="padding: 0 20px; font-size: 10px; font-weight: 700; color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 12px; display:flex; align-items:center; gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              SETTINGS
            </div>
            
            <button class="settings-nav-btn active" style="background:rgba(255,255,255,0.05); color:#fff; border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Account
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              Appearance
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              Screenshot
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Color Picker
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Webpage → Markdown
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15v-6h3c1.66 0 3 1.34 3 3s-1.34 3-3 3H9z"></path></svg>
              Save as PDF
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Export Element
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              AI Assistant
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              CSS Inspector
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Extract Images
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
              Delete Element
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              JSON Formatter
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
              Tab Manager
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              Reader Mode
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              World Clock
            </button>
          </div>
          <div id="settings-content-pane" style="flex: 1; padding: 40px; overflow-y: auto; display:flex; flex-direction:column; gap:24px;">
            <!-- Content injects here -->
          </div>
        </div>
      `;
      state.shadowRoot.appendChild(modal);

      const defaultSettings = {
        licenseKey: "",
        theme: "dark",
        sidebarPosition: "right",
        colorFormat: "hex",
        colorAutoCopy: true,
        extractBgImages: true,
        extractMetaTags: true,
        extractZip: false,
        screenshotFormat: "png",
        screenshotAutoDownload: true,
        markdownImages: true,
        markdownTables: true,
        pdfStripStyle: true,
        exportInlineCSS: true,
        exportPrettier: false,
        aiModel: "gpt-4o",
        cssHighlightBoxModel: true,
        deleteConfirm: true,
        jsonIndent: "2",
        tabSuspend: true,
        readerFont: "serif",
        clock24h: true
      };

      const contentPanes = {
        "Account": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Account</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Manage your SuperDev Pro license key.</p>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap:16px;">
            <div id="license-status-container">
              <!-- Dynamically loaded -->
            </div>
            <div style="display:flex; gap:10px;">
              <input type="text" id="settings-license-input" placeholder="Enter License Key (e.g. WEBDEVPRO2026)" style="flex:1; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px; outline:none;" />
              <button id="settings-license-btn" style="border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                Verify
              </button>
            </div>
          </div>
        `,
        "Appearance": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Appearance</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Customize the look and feel of SuperDev Pro.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Theme</div>
                <div style="font-size:12px; color:var(--text-secondary);">Choose your preferred color scheme.</div>
              </div>
              <select data-setting="theme" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="dark">Dark Mode (Default)</option>
                <option value="light">Light Mode</option>
                <option value="system">System Auto</option>
              </select>
            </div>
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
          </div>
        `,
        "Color Picker": `
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
        "Extract Images": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Extract Images</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure media scraping defaults.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="extractBgImages" /> Capture background-image CSS properties
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="extractMetaTags" /> Capture Favicons & OG Meta tags
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="extractZip" /> Zip downloads automatically
            </label>
          </div>
        `,
        "Screenshot": `
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
        "Webpage → Markdown": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Webpage → Markdown</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure markdown extraction formatting.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="markdownImages" /> Include images as markdown links
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="markdownTables" /> Preserve table structures
            </label>
          </div>
        `,
        "Save as PDF": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Save as PDF</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure PDF print properties.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="pdfStripStyle" /> Strip unnecessary styling (Reader view)
            </label>
          </div>
        `,
        "Export Element": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Export Element</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure element bundle extraction.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="exportInlineCSS" /> Inline CSS into style tags
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="exportPrettier" /> Pre-format using Prettier
            </label>
          </div>
        `,
        "AI Assistant": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">AI Assistant</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure AI integration features.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Language Model</div>
              </div>
              <select data-setting="aiModel" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="gpt-4o">GPT-4o (Premium)</option>
                <option value="claude-3-5">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>
        `,
        "CSS Inspector": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">CSS Inspector</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure layout overlays and property formats.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="cssHighlightBoxModel" /> Highlight element box-model on hover
            </label>
          </div>
        `,
        "Delete Element": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Delete Element</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configuration for element deletion tool.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="deleteConfirm" /> Require confirmation for container nodes
            </label>
          </div>
        `,
        "JSON Formatter": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">JSON Formatter</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure indentation and auto-formatting.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Indentation Space</div>
              </div>
              <select data-setting="jsonIndent" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tabs">Tabs</option>
              </select>
            </div>
          </div>
        `,
        "Tab Manager": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Tab Manager</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure tab suspended and memory management.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="tabSuspend" /> Automatically suspend inactive tabs after 15 mins
            </label>
          </div>
        `,
        "Reader Mode": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Reader Mode</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure reading typography and layout.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Font Preference</div>
              </div>
              <select data-setting="readerFont" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="serif">Serif (Georgia)</option>
                <option value="sans">Sans-Serif (Inter)</option>
              </select>
            </div>
          </div>
        `,
        "World Clock": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">World Clock</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure timezone defaults.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="clock24h" /> Use 24-hour time format
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

      function initPaneSettings(p, tabLabel) {
        if (tabLabel === "Account") {
          initAccountPane(p);
          return;
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

            el.onchange = (e) => {
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

      function initAccountPane(p) {
        const statusContainer = p.querySelector("#license-status-container");
        const input = p.querySelector("#settings-license-input");
        const btn = p.querySelector("#settings-license-btn");

        function renderStatus() {
          chrome.storage.local.get(["premium", "licenseKey"], (res) => {
            const isPro = res.premium !== false; // Align with default true in content script
            const key = res.licenseKey || "";
            input.value = key;
            
            if (isPro) {
              statusContainer.innerHTML = `
                <div>
                  <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #fff;">Status</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    <span style="color: #4ade80; font-weight: 600;">SuperDev Pro Active</span> · Lifetime License · 1/3 devices
                  </div>
                </div>
              `;
              btn.textContent = "Deactivate";
              btn.style.background = "rgba(239, 68, 68, 0.2)";
              btn.style.border = "1px solid rgba(239, 68, 68, 0.4)";
              btn.style.color = "#ef4444";
            } else {
              statusContainer.innerHTML = `
                <div>
                  <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #fff;">Status</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    <span style="color: var(--text-secondary); font-weight: 500;">Free Version (Limited Features)</span>
                  </div>
                </div>
              `;
              btn.textContent = "Activate";
              btn.style.background = "var(--accent-purple)";
              btn.style.border = "none";
              btn.style.color = "#000";
            }
          });
        }

        btn.onclick = () => {
          chrome.storage.local.get(["premium"], (res) => {
            const isPro = res.premium !== false;
            if (isPro) {
              chrome.storage.local.set({ premium: false, licenseKey: "" }, () => {
                showToast("Pro license deactivated.");
                state.isPremium = false;
                renderStatus();
              });
            } else {
              const key = input.value.trim().toUpperCase();
              if (key === "WEBDEVPRO2026") {
                chrome.storage.local.set({ premium: true, licenseKey: key }, () => {
                  showToast("SuperDev Pro activated successfully!");
                  state.isPremium = true;
                  renderStatus();
                });
              } else {
                showToast("Invalid key. Try WEBDEVPRO2026");
              }
            }
          });
        };

        renderStatus();
      }

      const pane = modal.querySelector("#settings-content-pane");
      pane.innerHTML = contentPanes["Account"];
      initPaneSettings(pane, "Account");

      const navBtns = modal.querySelectorAll(".settings-nav-btn");
      navBtns.forEach(btn => {
        btn.onclick = () => {
          // Update active styling
          navBtns.forEach(b => {
            b.classList.remove("active");
            b.style.background = "none";
            b.style.color = "var(--text-secondary)";
          });
          btn.classList.add("active");
          btn.style.background = "rgba(255,255,255,0.05)";
          btn.style.color = "#fff";

          // Parse label
          const label = btn.textContent.trim();
          pane.innerHTML = contentPanes[label] || defaultContent.replace("Settings panel", label + " settings");
          initPaneSettings(pane, label);
        };
      });

      modal.querySelector("#settings-close-btn").onclick = () => {
        modal.style.display = "none";
        deactivateCurrentTool();
      };
    } else {
      modal.style.display = "flex";
      const pane = modal.querySelector("#settings-content-pane");
      pane.innerHTML = contentPanes["Account"];
      initPaneSettings(pane, "Account");
    }
  }
