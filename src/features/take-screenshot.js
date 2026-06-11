import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupTakeScreenshot() {
    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>📸</span> Capturer Tool
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 12px 0;">
          Capture visible viewport and stage png downloads.
        </p>
        <button id="ss-action-capture-btn" class="hud-btn primary" style="width:100%; justify-content:center; padding:10px;">📸 Take Screenshot</button>
      </div>
    `;

    openDrawer("Screenshot", "Web page viewport captures", contentHTML, (slot) => {
      slot.querySelector("#ss-action-capture-btn").onclick = () => {
        showToast("Capturing viewport screenshot...");
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "takeScreenshot" }, (response) => {
            if (chrome.runtime.lastError || !response || !response.screenshotUrl) {
              showToast("Screenshot capture failed on this tab!");
              return;
            }
            openScreenshotPreviewModal(response.screenshotUrl);
          });
        }, 300);
      };
    });
  }


export   function openScreenshotPreviewModal(url) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";

    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "90%";
    img.style.maxHeight = "80%";
    img.style.border = "4px solid var(--accent-purple, #b8a3fc)";
    img.style.borderRadius = "8px";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close Preview";
    closeBtn.style.marginTop = "16px";
    closeBtn.style.padding = "8px 16px";
    closeBtn.style.background = "#fff";
    closeBtn.style.color = "#000";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => overlay.remove();

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    state.shadowRoot.appendChild(overlay);
  }

  // Dashboard welcome page

