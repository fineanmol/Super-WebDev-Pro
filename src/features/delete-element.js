import { state } from '../state.js';
import { openDrawer } from '../ui/drawer.js';
export function setupDeleteElement() {
function drawDeleteDrawer() {
      const logsHTML = state.undoStacks.deletedElements.map((del, i) => `
        <div class="drawer-history-item">
          <span class="drawer-history-name">&lt;${del.element.tagName.toLowerCase()}&gt; hidden</span>
          <button class="hud-btn del-single-restore" data-idx="${i}" style="padding:2px 6px; font-size:9px;">Restore</button>
        </div>
      `).join("");

      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>🗑️</span> Element Eraser Active
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
            Click on any webpage element to hide it. Elements are set to <code>display: none</code>.
          </p>
        </div>
        <div style="margin-top:16px;">
          <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 8px;">Hidden components (${state.undoStacks.deletedElements.length}):</span>
          <div class="custom-scroll" style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;">
            ${logsHTML || `<div style="font-size:10px; color:var(--text-secondary); text-align:center; padding:10px;">No elements hidden.</div>`}
          </div>
        </div>
      `;

      openDrawer("Delete Element", "Hide element components", contentHTML, (slot) => {
        slot.querySelectorAll(".del-single-restore").forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.getAttribute("data-idx"));
            const record = state.undoStacks.deletedElements[idx];
            if (record) {
              record.element.style.display = record.oldDisplay;
              state.undoStacks.deletedElements.splice(idx, 1);
              showToast("Restored hidden element layout");
              drawDeleteDrawer();
            }
          };
        });
      });
    }

    drawDeleteDrawer();

    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target) || e.target === document.body || e.target === document.documentElement) return;
      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, `Delete: ${e.target.tagName.toLowerCase()} (Click to erase)`, "var(--accent-rose)");
    }, true);

    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target)) return;
      hideHighlight();
    }, true);

    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      state.undoStacks.deletedElements.push({
        element: e.target,
        oldDisplay: e.target.style.display
      });

      e.target.style.display = "none";
      hideHighlight();
      showToast("Element hidden/deleted");
      drawDeleteDrawer();
    }, true);
  }

