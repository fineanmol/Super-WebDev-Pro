import { state } from '../state.js';
import { ensureHUD } from './hud.js';
import { deactivateCurrentTool } from '../core/tool-manager.js';

export function resetDrawerHeader() {
  if (!state.drawerEl) return;
  const titleSlot = state.shadowRoot.getElementById("drawer-title-slot");
  if (titleSlot) return; // Header is intact

  // Recreate default header structure
  const header = state.drawerEl.querySelector(".drawer-header");
  if (header) {
    header.innerHTML = `
      <div>
        <h3 class="drawer-title" id="drawer-title-slot">Tool Details</h3>
        <div class="drawer-subtitle" id="drawer-sub-slot">Select a tool to display diagnostics</div>
      </div>
      <button class="drawer-close" id="drawer-close-btn">&times;</button>
    `;
    
    // Re-wire close button event listener
    header.querySelector("#drawer-close-btn").onclick = () => {
      deactivateCurrentTool();
    };
  }
}

export   function openDrawer(title, subtitle, contentHTML, onRender = null) {
    ensureHUD();
    resetDrawerHeader();
    state.shadowRoot.getElementById("drawer-title-slot").textContent = title;
    state.shadowRoot.getElementById("drawer-sub-slot").textContent = subtitle;
    const slot = state.shadowRoot.getElementById("drawer-content-slot");
    slot.innerHTML = contentHTML;
    state.drawerEl.classList.add("visible");

    if (onRender) onRender(slot);
  }



export   function closeDrawer() {
    if (state.drawerEl) {
      state.drawerEl.classList.remove("visible");
    }
  }


export   function showPremiumLockedDrawer(toolId) {
    const html = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="1.5" style="margin-bottom:16px;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h3 style="font-size:16px; font-weight:600; color:#fff; margin:0 0 8px 0;">Premium Feature</h3>
        <p style="font-size:12px; color:var(--text-secondary); margin:0 0 24px 0;">
          The <b>${toolId}</b> tool requires a SuperDev Pro license to unlock.
        </p>
        <button class="hud-btn primary" style="width:100%;">Unlock Pro</button>
      </div>
    `;
    openDrawer("Feature Locked", "Pro license required", html);
  }

  // Highlight overlays

