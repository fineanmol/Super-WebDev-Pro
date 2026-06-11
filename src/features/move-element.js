import { state } from '../state.js';
import { openDrawer } from '../ui/drawer.js';
export function setupMoveElement() {
function drawMoveDrawer() {
      const logsHTML = state.undoStacks.movedElements.map((move, i) => `
        <div class="drawer-history-item">
          <span class="drawer-history-name">&lt;${move.element.tagName.toLowerCase()}&gt; translated</span>
          <button class="hud-btn move-single-restore" data-idx="${i}" style="padding:2px 6px; font-size:9px;">Reset</button>
        </div>
      `).join("");

      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>🖱️</span> Reposition layout modules
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
            1. Hover and **click** an element to select it.
            <br>2. **Drag it** around the screen, or use **Keyboard Arrows** (Shift for 10px increments) to shift its position.
            <br>3. Click again to release.
          </p>
        </div>
        <div style="margin-top:16px;">
          <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 8px;">Moved components (${state.undoStacks.movedElements.length}):</span>
          <div class="custom-scroll" style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;">
            ${logsHTML || `<div style="font-size:10px; color:var(--text-secondary); text-align:center; padding:10px;">No components moved.</div>`}
          </div>
        </div>
      `;

      openDrawer("Move Element", "Drag & Drop layouts positioner", contentHTML, (slot) => {
        slot.querySelectorAll(".move-single-restore").forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.getAttribute("data-idx"));
            const record = state.undoStacks.movedElements[idx];
            if (record) {
              record.element.style.transform = record.oldTransform;
              state.undoStacks.movedElements.splice(idx, 1);
              showToast("Restored translation position");
              drawMoveDrawer();
            }
          };
        });
      });
    }

    drawMoveDrawer();

    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target) || e.target === document.body || e.target === document.documentElement) return;
      if (state.selectedElementForMove) return;

      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, `${e.target.tagName.toLowerCase()} (Click to select)`);
    }, true);

    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target) || state.selectedElementForMove) return;
      hideHighlight();
    }, true);

    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      if (state.selectedElementForMove) {
        state.selectedElementForMove = null;
        hideHighlight();
        showToast("Element released");
      } else {
        state.selectedElementForMove = e.target;
        const rect = e.target.getBoundingClientRect();
        showHighlight(rect, `${e.target.tagName.toLowerCase()} (Ready to move. Drag or Arrows)`, "var(--accent-purple)");
      }
    }, true);

    // Keyboard Arrows adjust
    trackListener(document, "keydown", (e) => {
      if (!state.selectedElementForMove) return;
      const el = state.selectedElementForMove;
      const style = window.getComputedStyle(el);
      
      let tx = 0, ty = 0;
      const matrix = style.transform || style.webkitTransform;
      if (matrix && matrix !== "none") {
        const parts = matrix.split(", ");
        if (parts.length >= 6) {
          tx = parseFloat(parts[4]);
          ty = parseFloat(parts[5]);
        }
      }

      const step = e.shiftKey ? 10 : 1;
      let handled = false;

      switch (e.key) {
        case "ArrowUp": ty -= step; handled = true; break;
        case "ArrowDown": ty += step; handled = true; break;
        case "ArrowLeft": tx -= step; handled = true; break;
        case "ArrowRight": tx += step; handled = true; break;
        case "Escape": 
          state.selectedElementForMove = null; 
          hideHighlight(); 
          showToast("Move ended"); 
          break;
      }

      if (handled) {
        e.preventDefault();
        state.undoStacks.movedElements.push({ element: el, oldTransform: el.style.transform });
        el.style.transform = `translate(${tx}px, ${ty}px)`;
        drawMoveDrawer();
        
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          showHighlight(rect, `${el.tagName.toLowerCase()} (Ready to move. Drag or Arrows)`, "var(--accent-purple)");
        }, 30);
      }
    });

    // Mouse drag support
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let initialTx = 0, initialTy = 0;

    trackListener(document, "mousedown", (e) => {
      if (!state.selectedElementForMove || isHUDElement(e.target)) return;
      if (e.target !== state.selectedElementForMove && !state.selectedElementForMove.contains(e.target)) return;

      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const style = window.getComputedStyle(state.selectedElementForMove);
      const matrix = style.transform || style.webkitTransform;
      initialTx = 0;
      initialTy = 0;

      if (matrix && matrix !== "none") {
        const parts = matrix.split(", ");
        if (parts.length >= 6) {
          initialTx = parseFloat(parts[4]);
          initialTy = parseFloat(parts[5]);
        }
      }

      state.moveStartPos = state.selectedElementForMove.style.transform;
      e.preventDefault();
    }, true);

    trackListener(document, "mousemove", (e) => {
      if (!isDragging || !state.selectedElementForMove) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      state.selectedElementForMove.style.transform = `translate(${initialTx + dx}px, ${initialTy + dy}px)`;

      const rect = state.selectedElementForMove.getBoundingClientRect();
      showHighlight(rect, `${state.selectedElementForMove.tagName.toLowerCase()} (Dragging...)`, "var(--accent-purple)");
    }, true);

    trackListener(document, "mouseup", () => {
      if (isDragging) {
        isDragging = false;
        state.undoStacks.movedElements.push({ element: state.selectedElementForMove, oldTransform: state.moveStartPos });
        drawMoveDrawer();
      }
    }, true);
  }

