import { state } from '../state.js';
import { deactivateCurrentTool } from '../core/tool-manager.js';
export function setupTakeScreenshot() {
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

