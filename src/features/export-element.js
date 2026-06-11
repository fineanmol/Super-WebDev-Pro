import { state } from '../state.js';
import { openDrawer } from '../ui/drawer.js';
export function setupExportElement() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>📤</span> Code Exporter Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Hover and click on any webpage layout segment to download its clean HTML/CSS source packages or open in CodePen.
        </p>
      </div>
      <div id="export-element-details" style="display: none; margin-top: 14px;"></div>
    `;

    openDrawer("Export Element", "Build standalone layouts code", guideHTML);

    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target) || e.target === document.body || e.target === document.documentElement) return;
      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, `Export: ${e.target.tagName.toLowerCase()}`, "var(--accent-emerald)");
    }, true);

    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target)) return;
      hideHighlight();
    }, true);

    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      renderExportDetailsInDrawer(e.target);
    }, true);
  }

