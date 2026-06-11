import { state } from '../state.js';
export function showToast(msg) {
    ensureHUD();
    const txt = state.shadowRoot.getElementById("toast-text-slot");
    txt.textContent = msg;
    state.toastEl.classList.add("visible");
    setTimeout(() => {
      state.toastEl.classList.remove("visible");
    }, 2500);
  }

