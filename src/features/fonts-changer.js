import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupFontsChanger() {
    // Remember the page's original body font so the tool can be fully undone
    // when it is deactivated (handled in deactivateCurrentTool).
    if (state.originalBodyFont === undefined) {
      state.originalBodyFont = document.body.style.fontFamily || "";
    }

    const fonts = [
      { name: "Roboto", sample: "Roboto Typography" },
      { name: "Inter", sample: "Inter Developer" },
      { name: "Montserrat", sample: "Montserrat Accent" },
      { name: "Playfair Display", sample: "Playfair Serif" },
      { name: "Poppins", sample: "Poppins Rounded" },
      { name: "Open Sans", sample: "Open Sans Standard" },
      { name: "Lora", sample: "Lora Modern Serif" },
      { name: "Source Code Pro", sample: "Source Code Monospace" }
    ];

    const cardsHTML = fonts.map(f => `
      <div class="font-card" data-font="${f.name}" style="font-family: '${f.name}', sans-serif;">
        <div class="font-card-name">${f.name}</div>
        <div class="font-card-preview">${f.sample}</div>
      </div>
    `).join("");

    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">🔤 Font Family Changer</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
          Select a typography style below to apply it globally to the webpage body in real-time.
        </p>
      </div>
      <div class="fonts-grid custom-scroll" style="max-height: 320px; overflow-y: auto;">
        ${cardsHTML}
      </div>
    `;

    openDrawer("Font Changer", "Swap global page typography", contentHTML, (slot) => {
      slot.querySelectorAll(".font-card").forEach(card => {
        card.onclick = () => {
          const fontName = card.getAttribute("data-font");
          const linkId = `gfont-${fontName.toLowerCase().replace(/\s+/g, "-")}`;
          // Inject the Google Fonts stylesheet into the page <head> (a sheet in
          // the shadow root would not register @font-face for the document).
          if (!document.getElementById(linkId)) {
            const pageLink = document.createElement("link");
            pageLink.id = linkId;
            pageLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
            pageLink.rel = "stylesheet";
            document.head.appendChild(pageLink);
          }

          document.body.style.fontFamily = `'${fontName}', sans-serif`;
          showToast(`Font changed to ${fontName}`);
        };
      });
    });
  }

  // 4. List Fonts

