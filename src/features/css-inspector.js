import { state } from '../state.js';
import { openDrawer } from '../ui/drawer.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight } from '../ui/highlight.js';
export function setupCSSInspector() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>🔍</span> Element Selector Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Hover over any element on the page to see its outline. Click to lock it and edit styles in this drawer.
        </p>
      </div>
      <div id="inspector-element-details" style="display: none; margin-top: 14px;"></div>
    `;

    openDrawer("CSS Inspector", "Computed values & Live CSS overrides", guideHTML);

    const drawerHeader = state.drawerEl.querySelector(".drawer-header");
    drawerHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 class="drawer-title" style="margin:0; font-size:15px; background:none; -webkit-text-fill-color:var(--text-primary); color:var(--text-primary);">CSS Inspector</h3>
        <div style="width:6px; height:6px; background:#4ade80; border-radius:50%; box-shadow:0 0 8px #4ade80;"></div>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <button style="background:none; border:none; color:var(--text-secondary); cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 14a8 8 0 0 1-8 8"></path><path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1"></path><path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10"></path><path d="M18 11a8 8 0 1 1-15 2.62"></path></svg></button>
        <button style="background:none; border:none; color:var(--accent-purple); cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.87l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg></button>
        <button class="drawer-close" id="drawer-close-btn">&times;</button>
      </div>
    `;
    drawerHeader.querySelector("#drawer-close-btn").onclick = closeDrawer;

    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target) || e.target === document.body || e.target === document.documentElement) return;
      
      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, "");
      updateInspectorTooltip(e.target, e.clientX, e.clientY);
    }, true);

    trackListener(document, "mousemove", (e) => {
      if (isHUDElement(e.target) || e.target === document.body || e.target === document.documentElement) {
        if (state.inspectorTooltip) {
          state.inspectorTooltip.style.display = "none";
        }
        return;
      }
      
      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, "");
      updateInspectorTooltip(e.target, e.clientX, e.clientY);
    }, true);

    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target)) return;
      
      if (state.selectedElementForCss) {
        const rect = state.selectedElementForCss.getBoundingClientRect();
        showHighlight(rect, "");
      } else {
        hideHighlight();
      }
      if (state.inspectorTooltip) {
        state.inspectorTooltip.style.display = "none";
      }
    }, true);

    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      state.selectedElementForCss = e.target;

      // Always ensure the drawer is open with the inspector shell before rendering
      const existingSlot = state.shadowRoot.getElementById("inspector-element-details");
      if (!existingSlot) {
        const guideHTML = `
          <div class="audit-card">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Element Selector Active
            </div>
            <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
              Hover to outline elements. Click to lock and edit styles.
            </p>
          </div>
          <div id="inspector-element-details" style="display: none; margin-top: 14px;"></div>
        `;
        openDrawer("CSS Inspector", "Computed values & Live CSS overrides", guideHTML);
      } else {
        // Drawer shell exists — just make sure drawer panel is visible
        if (state.drawerEl && !state.drawerEl.classList.contains("visible")) {
          state.drawerEl.classList.add("visible");
        }
      }

      renderCSSDetailsInDrawer();

      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, "");
    }, true);

    trackListener(document, "keydown", (e) => {
      if (state.activeTool !== "css-inspector" || !state.selectedElementForCss) return;

      let target = state.selectedElementForCss;
      let nextEl = null;

      if (e.key === "ArrowUp") {
        nextEl = target.parentElement;
        if (nextEl && nextEl !== document.body && nextEl !== document.documentElement && !isHUDElement(nextEl)) {
          e.preventDefault();
          state.selectedElementForCss = nextEl;
          renderCSSDetailsInDrawer();
          
          const rect = nextEl.getBoundingClientRect();
          showHighlight(rect, "");
          if (state.inspectorTooltip) {
            state.inspectorTooltip.style.display = "none";
          }
        }
      } else if (e.key === "ArrowDown") {
        nextEl = target.firstElementChild;
        if (nextEl && !isHUDElement(nextEl)) {
          e.preventDefault();
          state.selectedElementForCss = nextEl;
          renderCSSDetailsInDrawer();
          
          const rect = nextEl.getBoundingClientRect();
          showHighlight(rect, "");
          if (state.inspectorTooltip) {
            state.inspectorTooltip.style.display = "none";
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        state.selectedElementForCss = null;
        hideHighlight();
        const detailsSlot = state.shadowRoot.getElementById("inspector-element-details");
        if (detailsSlot) detailsSlot.style.display = "none";
      }
    });
  }

