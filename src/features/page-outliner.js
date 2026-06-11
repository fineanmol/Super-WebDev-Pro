import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupPageOutliner() {
    function drawOutlinerDrawer() {
      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>🔲</span> Layout Outlines Active
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 12px 0;">
            Webpage DOM nodes are marked with dashed outline boundaries to analyze padding/margins layouts alignment.
          </p>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size: 11px; color: var(--text-secondary);">Outline Border Color:</span>
            <select id="outliner-color-select" class="css-editor-textarea" style="height:32px; font-size:11px; font-family:inherit; padding: 4px;">
              <option value="rgba(184, 163, 252, 0.65)">Purple Accent (Default)</option>
              <option value="rgba(110, 231, 168, 0.65)">Emerald Green</option>
              <option value="rgba(244, 114, 182, 0.65)">Rose Pink</option>
              <option value="rgba(99, 102, 241, 0.65)">Indigo Accent</option>
              <option value="random">Randomized Color Swatches</option>
            </select>
          </div>
        </div>
      `;

      openDrawer("Page Outliner", "Inspect alignment shapes", contentHTML, (slot) => {
        const select = slot.querySelector("#outliner-color-select");
        select.value = state.outlinerColor;
        select.onchange = (e) => {
          state.outlinerColor = e.target.value;
          applyOutlinerBorders();
        };
      });
    }

    function applyOutlinerBorders() {
      if (state.customStyleElement && state.customStyleElement.parentNode) {
        state.customStyleElement.parentNode.removeChild(state.customStyleElement);
      }

      state.customStyleElement = document.createElement("style");
      if (state.outlinerColor === "random") {
        let randomCSS = "";
        const tags = ["div", "section", "article", "aside", "header", "footer", "p", "span", "a", "button", "input", "img"];
        tags.forEach(t => {
          const col = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
          randomCSS += `${t} { outline: 1px dashed ${col} !important; }\n`;
        });
        randomCSS += "#super-webdev-hud-host * { outline: none !important; }\n";
        state.customStyleElement.textContent = randomCSS;
      } else {
        state.customStyleElement.textContent = `
          * {
            outline: 1px dashed ${state.outlinerColor} !important;
          }
          #super-webdev-hud-host * {
            outline: none !important;
          }
        `;
      }
      document.head.appendChild(state.customStyleElement);
    }

    drawOutlinerDrawer();
    applyOutlinerBorders();
  }

  // 13. Image Replacer

