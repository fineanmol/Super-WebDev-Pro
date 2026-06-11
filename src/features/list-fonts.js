import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupListFonts() {
    const fontsMap = {};
    const allElements = document.getElementsByTagName("*");

    for (let i = 0; i < allElements.length; i++) {
      const style = window.getComputedStyle(allElements[i]);
      const fontFamily = style.fontFamily;
      if (fontFamily) {
        const cleanFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
        fontsMap[cleanFont] = (fontsMap[cleanFont] || 0) + 1;
      }
    }

    const fontList = Object.entries(fontsMap).sort((a, b) => b[1] - a[1]);

    const cardsHTML = fontList.map(([fontName, count]) => `
      <div class="font-card" style="font-family: '${fontName}', sans-serif; cursor: default;">
        <div class="font-card-name">${fontName}</div>
        <div class="font-card-preview">Used on ${count} element(s)</div>
      </div>
    `).join("");

    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">📋 Typography Audit</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
          Analyzed all unique font families currently loaded and active on this webpage.
        </p>
      </div>
      <div class="fonts-grid custom-scroll" style="max-height: 320px; overflow-y: auto;">
        ${cardsHTML || '<div style="font-size:11px; color:var(--text-secondary); text-align:center; padding:20px;">No fonts detected.</div>'}
      </div>
    `;

    openDrawer("Fonts List", "Typography usage diagnostics", contentHTML);
  }

  // 6. Color Palette

