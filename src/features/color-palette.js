import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupColorPalette() {
    const colorsMap = {};
    const bgColorsMap = {};
    const allElements = document.getElementsByTagName("*");

    for (let i = 0; i < allElements.length; i++) {
      const style = window.getComputedStyle(allElements[i]);
      const color = style.color;
      const bgColor = style.backgroundColor;

      if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
        colorsMap[color] = (colorsMap[color] || 0) + 1;
      }
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        bgColorsMap[bgColor] = (bgColorsMap[bgColor] || 0) + 1;
      }
    }

    const textList = Object.entries(colorsMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const bgList = Object.entries(bgColorsMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const textSwatchesHTML = textList.map(([col, count]) => `
      <div class="swatch-card" data-color="${col}">
        <div class="swatch-color" style="background-color: ${col};"></div>
        <div class="swatch-text">${col}</div>
        <div style="font-size: 8px; color: var(--text-secondary);">${count} times</div>
      </div>
    `).join("");

    const bgSwatchesHTML = bgList.map(([col, count]) => `
      <div class="swatch-card" data-color="${col}">
        <div class="swatch-color" style="background-color: ${col};"></div>
        <div class="swatch-text">${col}</div>
        <div style="font-size: 8px; color: var(--text-secondary);">${count} times</div>
      </div>
    `).join("");

    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">🎨 Color Scheme Extractor</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
          Extracted most frequent colors. Click on any color card below to copy its value to the clipboard.
        </p>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="font-size: 10px; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 6px; font-weight: 700;">Text Colors</span>
        <div class="color-swatches-grid custom-scroll" style="max-height: 150px; overflow-y: auto;">
          ${textSwatchesHTML || '<div style="font-size:11px; color:var(--text-secondary); padding:10px;">No text colors extracted.</div>'}
        </div>
      </div>

      <div>
        <span style="font-size: 10px; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 6px; font-weight: 700;">Background Colors</span>
        <div class="color-swatches-grid custom-scroll" style="max-height: 150px; overflow-y: auto;">
          ${bgSwatchesHTML || '<div style="font-size:11px; color:var(--text-secondary); padding:10px;">No background colors extracted.</div>'}
        </div>
      </div>
    `;

    openDrawer("Color Palette", "Dominant page style colors", contentHTML, (slot) => {
      slot.querySelectorAll(".swatch-card").forEach(swatch => {
        swatch.onclick = () => {
          const colorVal = swatch.getAttribute("data-color");
          navigator.clipboard.writeText(colorVal);
          showToast(`Copied color: ${colorVal}`);
        };
      });
    });
  }

  // 10. Extract Images

