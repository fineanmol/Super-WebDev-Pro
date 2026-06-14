import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupImageReplacer() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>🔄</span> Image Replacer Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Hover and click on any image tag (or layout container styled with background-image) to change its content src.
        </p>
      </div>
      <div id="image-replacer-details" style="display: none; margin-top: 14px;"></div>
    `;

    openDrawer("Image Swap", "Visual staging assets updater", guideHTML);

    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target)) return;
      
      let isImg = e.target.tagName.toLowerCase() === "img";
      let isBg = false;

      if (!isImg) {
        const bg = window.getComputedStyle(e.target).backgroundImage;
        if (bg && bg !== "none" && bg.startsWith("url(")) isBg = true;
      }

      if (isImg || isBg) {
        const rect = e.target.getBoundingClientRect();
        showHighlight(rect, `Replace: ${isImg ? "Image Tag" : "Background-Image"} (Click)`, "var(--accent-purple)");
      }
    }, true);

    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target)) return;
      hideHighlight();
    }, true);

    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;

      let isImg = e.target.tagName.toLowerCase() === "img";
      let isBg = false;
      let bgUrl = "";

      if (!isImg) {
        const bg = window.getComputedStyle(e.target).backgroundImage;
        if (bg && bg !== "none" && bg.startsWith("url(")) {
          isBg = true;
          const match = bg.match(/url\(["']?([^"']*)["']?\)/);
          bgUrl = match ? match[1] : "";
        }
      }

      if (isImg || isBg) {
        e.preventDefault();
        e.stopPropagation();
        renderImageSwapDetailsInDrawer(e.target, isBg, isBg ? bgUrl : e.target.src);
      }
    }, true);
  }


export   function renderImageSwapDetailsInDrawer(element, isBg, currentSource) {
    const detailsSlot = state.shadowRoot.getElementById("image-replacer-details");
    if (!detailsSlot) return;

    detailsSlot.style.display = "block";

    detailsSlot.innerHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top:12px;">Stage replacement image path:</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button id="repl-file-btn" class="hud-btn primary" style="justify-content:center; padding:10px;">📁 Select Local Image</button>
        <input type="file" id="repl-file-input" accept="image/*" style="display:none;">
        <div style="font-size:11px; color:var(--text-secondary); margin-top:8px;">Or enter web URL:</div>
        <input type="text" id="repl-url-input" class="css-editor-textarea" style="height:38px;" placeholder="https://example.com/logo.png">
        <button id="repl-url-btn" class="hud-btn" style="justify-content:center; padding:8px;">Apply URL</button>
      </div>
      <div style="margin-top:16px;">
        <span style="font-size:11px; color:var(--text-secondary); display:block; margin-bottom:6px;">Current Source:</span>
        <div style="font-size:10px; font-family:monospace; background:rgba(0,0,0,0.2); padding:6px; border-radius:4px; word-break:break-all; color:var(--text-secondary);">
          ${currentSource}
        </div>
      </div>
    `;

    const fileInput = detailsSlot.querySelector("#repl-file-input");
    const fileBtn = detailsSlot.querySelector("#repl-file-btn");
    const urlInput = detailsSlot.querySelector("#repl-url-input");
    const urlBtn = detailsSlot.querySelector("#repl-url-btn");

    fileBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => applyImageReplacement(element, isBg, currentSource, ev.target.result);
      reader.readAsDataURL(file);
    };

    urlBtn.onclick = () => {
      const url = urlInput.value.trim();
      if (url) applyImageReplacement(element, isBg, currentSource, url);
    };
  }

  // 14. Take Screenshot


export function applyImageReplacement(element, isBg, currentSource, newSource) {
  if (isBg) {
    element.style.setProperty("background-image", "url('"+newSource+"')", "important");
  } else {
    element.src = newSource;
  }
  
  state.undoStacks.swappedImages.push({
    element,
    isBg,
    oldSource: currentSource,
    newSource: newSource
  });
  
  showToast("Image replaced successfully!");
}
