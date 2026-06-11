import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupLiveTextEditor() {
    document.body.contentEditable = "true";

    function drawTextEditorDrawer() {
      const logsHTML = state.undoStacks.textEdits.map((edit, i) => `
        <div class="drawer-history-item">
          <span class="drawer-history-name">&lt;${edit.element.tagName.toLowerCase()}&gt; modified</span>
          <button class="hud-btn te-single-restore" data-idx="${i}" style="padding:2px 6px; font-size:9px;">Undo</button>
        </div>
      `).join("");

      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>📝</span> Live Text Editor Active
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
            Click on any heading, paragraph, or text on the page to change it live.
          </p>
          <button id="te-reset-all-btn" class="hud-btn danger" style="width:100%; justify-content:center;" ${state.undoStacks.textEdits.length === 0 ? "disabled" : ""}>Reset Webpage Text</button>
        </div>
        <div style="margin-top: 16px;">
          <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 8px;">Edits History (${state.undoStacks.textEdits.length}):</span>
          <div class="custom-scroll" style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;">
            ${logsHTML || `<div style="font-size:10px; color:var(--text-secondary); text-align:center; padding:10px;">No edits logged.</div>`}
          </div>
        </div>
      `;

      openDrawer("Text Editor", "Modify webpage text content", contentHTML, (slot) => {
        slot.querySelector("#te-reset-all-btn").onclick = () => {
          while (state.undoStacks.textEdits.length > 0) {
            const edit = state.undoStacks.textEdits.pop();
            edit.element.innerHTML = edit.oldHTML;
          }
          showToast("Webpage text reset completed!");
          drawTextEditorDrawer();
        };

        slot.querySelectorAll(".te-single-restore").forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.getAttribute("data-idx"));
            const edit = state.undoStacks.textEdits[idx];
            if (edit) {
              edit.element.innerHTML = edit.oldHTML;
              state.undoStacks.textEdits.splice(idx, 1);
              showToast("Edit reverted");
              drawTextEditorDrawer();
            }
          };
        });
      });
    }

    drawTextEditorDrawer();

    trackListener(document, "focusin", (e) => {
      if (isHUDElement(e.target) || !e.target.dataset) return;
      e.target.dataset.oldText = e.target.innerHTML;
    });

    trackListener(document, "focusout", (e) => {
      if (isHUDElement(e.target) || !e.target.dataset || !e.target.dataset.oldText) return;
      const oldVal = e.target.dataset.oldText;
      const newVal = e.target.innerHTML;

      if (oldVal !== newVal) {
        state.undoStacks.textEdits.push({
          element: e.target,
          oldHTML: oldVal,
          newHTML: newVal
        });
        drawTextEditorDrawer();
      }
      delete e.target.dataset.oldText;
    });
  }

  // 5. Color Picker

