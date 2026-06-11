import { state } from '../state.js';
import { ensureHUD } from './hud.js';
export function openDrawer(title, subtitle, contentHTML, onRender = null) {
    ensureHUD();
    state.shadowRoot.getElementById("drawer-title-slot").textContent = title;
    state.shadowRoot.getElementById("drawer-sub-slot").textContent = subtitle;
    const slot = state.shadowRoot.getElementById("drawer-content-slot");
    slot.innerHTML = contentHTML;
    state.drawerEl.classList.add("visible");

    if (onRender) onRender(slot);
  }
export function closeDrawer() {
    if (state.drawerEl) {
      state.drawerEl.classList.remove("visible");
    }
  }

