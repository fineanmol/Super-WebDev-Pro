import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupCSSInspector() {
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
    drawerHeader.querySelector("#drawer-close-btn").onclick = deactivateCurrentTool;

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

  const PROPERTIES_BY_TAB = {
    all: ["display", "position", "top", "right", "bottom", "left", "width", "height", "margin", "padding", "color", "background-color", "border", "border-radius", "font-family", "font-size", "line-height", "font-weight", "text-align", "box-shadow", "opacity", "cursor", "z-index"],
    "web-layout": ["display", "position", "top", "right", "bottom", "left", "width", "height", "margin", "padding", "box-sizing", "overflow", "z-index"],
    typography: ["font-family", "font-size", "line-height", "font-weight", "text-align", "color", "letter-spacing", "text-transform", "white-space", "word-break"],
    color: ["color", "border-color", "outline-color", "text-decoration-color"],
    effects: ["box-shadow", "opacity", "mix-blend-mode", "filter", "backdrop-filter", "transform", "transition"],
    background: ["background-color", "background-image", "background-size", "background-position", "background-repeat"],
    grid: ["grid-template-columns", "grid-template-rows", "grid-gap", "align-items", "justify-content", "flex-direction", "flex-wrap"]
  };


export   function parseValAndUnit(valStr) {
    if (!valStr) return { value: 0, unit: "px" };
    const match = String(valStr).trim().match(/^([\d.]+)([a-zA-Z%]*)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || "px" };
    }
    const valOnly = parseFloat(valStr);
    return { value: isNaN(valOnly) ? 0 : valOnly, unit: "px" };
  }


export   function renderCSSDetailsInDrawer() {
    const el = state.selectedElementForCss;
    if (!el || !state.drawerEl) return;

    // Self-heal: if drawer was closed or content cleared, re-inject the guide HTML
    // so that #inspector-element-details always exists before we try to use it.
    let detailsSlot = state.shadowRoot.getElementById("inspector-element-details");
    if (!detailsSlot) {
      const guideHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>🔍</span> Element Selector Active
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
            Click to lock an element and edit styles in this drawer.
          </p>
        </div>
        <div id="inspector-element-details" style="display: none; margin-top: 14px;"></div>
      `;
      openDrawer("CSS Inspector", "Computed values & Live CSS overrides", guideHTML);
      detailsSlot = state.shadowRoot.getElementById("inspector-element-details");
      if (!detailsSlot) return; // should never happen, but safety guard
    }

    // Ensure drawer is visible (in case it was closed without clearing the slot HTML)
    if (state.drawerEl && !state.drawerEl.classList.contains("visible")) {
      state.drawerEl.classList.add("visible");
    }

    detailsSlot.style.display = "block";

    // Initialize state
    state.activeInspectorTab = state.activeInspectorTab || "all";
    if (!state.disabledStyles) state.disabledStyles = new WeakMap();
    if (!state.disabledStyleValues) state.disabledStyleValues = new WeakMap();
    if (!state.originalStyles) state.originalStyles = new WeakMap();

    if (!state.originalStyles.has(el)) {
      state.originalStyles.set(el, el.getAttribute("style") || "");
    }

    let disabledSet = state.disabledStyles.get(el);
    if (!disabledSet) {
      disabledSet = new Set();
      state.disabledStyles.set(el, disabledSet);
    }

    let valuesMap = state.disabledStyleValues.get(el);
    if (!valuesMap) {
      valuesMap = {};
      state.disabledStyleValues.set(el, valuesMap);
    }

    const computed = window.getComputedStyle(el);
    const tagName = el.tagName.toLowerCase();
    const idAttr = el.id ? `#${el.id}` : "";
    
    let classesAttr = "";
    if (el.classList && el.classList.length > 0) {
      const cls = Array.from(el.classList)
        .filter(c => typeof c === "string" && c.trim() && !c.startsWith("super-webdev-"))
        .join(".");
      if (cls) classesAttr = `.${cls}`;
    }

    const rect = el.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    detailsSlot.innerHTML = `
      <div class="inspector-drawer-container">
        <!-- Header -->
        <div class="inspector-meta-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="inspector-meta-tag" style="color:var(--accent-purple); font-weight:600; font-family:monospace; font-size:12px;">${tagName}</div>
            <div style="color:var(--accent-yellow); font-family:monospace; font-size:11px;">${idAttr}</div>
          </div>
          <div class="inspector-meta-right" style="display:flex; align-items:center; gap:10px; color:var(--text-secondary); font-size:11px; font-family:monospace;">
            <span>${width} × ${height}</span>
            <button class="inspector-meta-btn" id="inspector-copy-sel-btn" title="Copy selector" style="background:none; border:none; color:inherit; cursor:pointer;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button class="inspector-meta-btn" id="inspector-reset-el-btn" title="Reset styles" style="background:none; border:none; color:inherit; cursor:pointer;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
            </button>
          </div>
        </div>
        
        <!-- Selector input bar -->
        <input type="text" class="inspector-selector-bar" value="${classesAttr ? tagName + classesAttr : tagName}" readonly style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:6px 12px; font-family:monospace; font-size:11px; color:#fff; width:100%; margin-bottom:16px;" />

        <!-- 9 Tabs filter -->
        <div class="inspector-filter-tabs" style="display:flex; gap:6px; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px;">
          <button class="inspector-filter-btn ${state.activeInspectorTab === "all" ? "active" : ""}" data-tab="all" title="All properties" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "all" ? "var(--accent-purple)" : "rgba(255,255,255,0.05)"}; color:#fff; cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "web-layout" ? "active" : ""}" data-tab="web-layout" title="Web Layout" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "web-layout" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "typography" ? "active" : ""}" data-tab="typography" title="Typography" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "typography" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <span style="font-family:serif; font-size:12px; font-weight:bold; line-height:14px;">Aa</span>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "color" ? "active" : ""}" data-tab="color" title="Colors" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "color" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "effects" ? "active" : ""}" data-tab="effects" title="Effects" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "effects" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.18 4.18l15.64 15.64M4.18 19.82l15.64-15.64"></path></svg>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "background" ? "active" : ""}" data-tab="background" title="Background" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "background" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "grid" ? "active" : ""}" data-tab="grid" title="Grid" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "grid" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button class="inspector-filter-btn ${state.activeInspectorTab === "code" ? "active" : ""}" data-tab="code" title="Code Mode" style="padding:6px; border-radius:6px; border:none; background:${state.activeInspectorTab === "code" ? "var(--accent-purple)" : "none"}; color:var(--text-secondary); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </button>
        </div>

        <!-- Properties list -->
        <div class="inspector-properties-list custom-scroll" id="inspector-props-list-slot"></div>

        <!-- Add Property row -->
        <button class="add-prop-btn" id="inspector-add-prop-btn">
          <span>+</span> Add property
        </button>

        <!-- CSS Code Pane -->
        <div class="inspector-css-pane" id="inspector-css-pane-slot">
          <div class="inspector-css-pane-header">
            <span class="inspector-css-pane-title">css</span>
            <div class="inspector-css-pane-actions">
              <button class="inspector-css-btn" id="inspector-css-reset-btn">Reset</button>
              <button class="inspector-css-btn" id="inspector-css-copy-btn">Copy</button>
            </div>
          </div>
          <div class="inspector-css-code-box custom-scroll" id="inspector-css-code-slot"></div>
        </div>

        <!-- Footer keys -->
        <div class="inspector-drawer-footer">
          <div><span class="inspector-footer-key">Esc</span> close</div>
          <div><span class="inspector-footer-key">⌘K</span> switch tool</div>
        </div>
      </div>
    `;

    // Wire up header actions
    detailsSlot.querySelector("#inspector-copy-sel-btn").onclick = () => {
      const sel = classesAttr ? tagName + classesAttr : tagName;
      navigator.clipboard.writeText(sel);
      showToast("Selector copied!");
    };

    const resetStyles = () => {
      el.setAttribute("style", state.originalStyles.get(el));
      state.disabledStyles.set(el, new Set());
      showToast("Element styles reset!");
      renderCSSDetailsInDrawer();
      const newRect = el.getBoundingClientRect();
      showHighlight(newRect, "");
    };

    detailsSlot.querySelector("#inspector-reset-el-btn").onclick = resetStyles;
    detailsSlot.querySelector("#inspector-css-reset-btn").onclick = resetStyles;

    detailsSlot.querySelector("#inspector-css-copy-btn").onclick = () => {
      const codeSlot = detailsSlot.querySelector("#inspector-css-code-slot");
      navigator.clipboard.writeText(codeSlot.innerText);
      showToast("CSS copied to clipboard!");
    };

    // Wire up tabs
    const tabBtns = detailsSlot.querySelectorAll(".inspector-filter-btn");
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeInspectorTab = btn.getAttribute("data-tab");
        renderPropertiesList();
      };
    });

    // Wire up Add Property
    detailsSlot.querySelector("#inspector-add-prop-btn").onclick = () => {
      const listSlot = detailsSlot.querySelector("#inspector-props-list-slot");
      
      // Remove any existing add row first
      const existingAddRow = listSlot.querySelector(".add-prop-input-row");
      if (existingAddRow) {
        existingAddRow.scrollIntoView({ behavior: "smooth" });
        return;
      }

      const addRow = document.createElement("div");
      addRow.className = "inspector-prop-row add-prop-input-row";
      addRow.style.marginTop = "6px";
      addRow.innerHTML = `
        <div class="inspector-prop-left" style="flex:1;">
          <input type="text" placeholder="property-name" class="prop-add-name-input" style="background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:4px 6px; font-family:monospace; font-size:10px; color:#fff; width:100%; outline:none;" />
        </div>
        <div class="inspector-prop-right" style="flex:1.2; justify-content:space-between; gap:6px;">
          <input type="text" placeholder="value" class="prop-add-val-input" style="background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:4px 6px; font-family:monospace; font-size:10px; color:#fff; width:65px; outline:none;" />
          <button class="hud-btn primary" style="padding:4px 8px; font-size:9px; border-radius:4px; height:22px;">Add</button>
        </div>
      `;
      
      const submitBtn = addRow.querySelector("button");
      const nameInput = addRow.querySelector(".prop-add-name-input");
      const valInput = addRow.querySelector(".prop-add-val-input");

      const submitAdd = () => {
        const name = nameInput.value.trim().toLowerCase();
        const val = valInput.value.trim();
        if (name && val) {
          el.style[name] = val;
          showToast(`Added property: ${name}`);
          renderCSSDetailsInDrawer();
          const newRect = el.getBoundingClientRect();
          showHighlight(newRect, "");
        }
      };

      submitBtn.onclick = submitAdd;
      valInput.onkeydown = (e) => { if (e.key === "Enter") submitAdd(); };
      nameInput.onkeydown = (e) => { if (e.key === "Enter") valInput.focus(); };

      listSlot.appendChild(addRow);
      nameInput.focus();
      listSlot.scrollTop = listSlot.scrollHeight;
    };

    function renderPropertiesList() {
      const listSlot = detailsSlot.querySelector("#inspector-props-list-slot");
      const cssPane = detailsSlot.querySelector("#inspector-css-pane-slot");
      const addBtn = detailsSlot.querySelector("#inspector-add-prop-btn");

      const activeTab = state.activeInspectorTab;

      if (activeTab === "code") {
        listSlot.style.display = "none";
        addBtn.style.display = "none";
        cssPane.style.flex = "1";
        cssPane.style.height = "calc(100% - 90px)";
      } else {
        listSlot.style.display = "flex";
        addBtn.style.display = "flex";
        cssPane.style.flex = "none";
        cssPane.style.height = "160px";
      }

      const propNames = PROPERTIES_BY_TAB[activeTab] || PROPERTIES_BY_TAB.all;
      listSlot.innerHTML = "";

      propNames.forEach(propName => {
        let propVal = el.style.getPropertyValue(propName) || computed.getPropertyValue(propName) || computed[propName] || "";
        
        // If property is disabled, we grab the cached value
        const isDisabled = disabledSet.has(propName);
        if (isDisabled) {
          const cached = valuesMap[propName];
          propVal = cached ? (cached.inline || cached.computed) : propVal;
        }

        const row = document.createElement("div");
        row.className = "inspector-prop-row";
        if (isDisabled) row.style.opacity = "0.45";

        // Eye toggle
        const eyeClass = isDisabled ? "prop-eye-toggle" : "prop-eye-toggle active";
        const eyeIcon = isDisabled 
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` 
          : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`; 
        
        // Build edit controls based on property type
        let controlHTML = "";
        
        // Define control type
        let propType = "text";
        let options = [];
        let sliderMin = 0, sliderMax = 100, sliderUnit = "px";

        if (propName === "display") {
          propType = "select";
          options = ["block", "flex", "grid", "inline-block", "inline", "none"];
        } else if (propName === "-webkit-font-smoothing") {
          propType = "select";
          options = ["antialiased", "subpixel-antialiased", "none", "auto"];
        } else if (propName === "box-sizing") {
          propType = "select";
          options = ["border-box", "content-box"];
        } else if (propName === "font-weight") {
          propType = "select";
          options = ["100", "200", "300", "400", "500", "600", "700", "800", "900", "normal", "bold"];
        } else if (propName === "align-items") {
          propType = "select";
          options = ["stretch", "center", "flex-start", "flex-end", "baseline"];
        } else if (propName === "justify-content") {
          propType = "select";
          options = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];
        } else if (propName === "color" || propName === "background-color") {
          propType = "color";
        } else if (propName === "border-radius") {
          propType = "slider";
          sliderMin = 0; sliderMax = 50; sliderUnit = "px";
        } else if (propName === "line-height") {
          propType = "slider";
          sliderMin = 10; sliderMax = 80; sliderUnit = "px";
        } else if (propName === "font-size") {
          propType = "slider";
          sliderMin = 8; sliderMax = 72; sliderUnit = "px";
        }

        // Render HTML for control
        if (propType === "slider") {
          const parsed = parseValAndUnit(propVal);
          controlHTML = `
            <div class="prop-slider-wrap">
              <input type="range" class="prop-slider" min="${sliderMin}" max="${sliderMax}" value="${parsed.value}" ${isDisabled ? "disabled" : ""}>
              <input type="text" class="prop-slider-num-box" value="${parsed.value}" ${isDisabled ? "disabled" : ""}>
              <span class="prop-slider-unit">${parsed.unit}</span>
            </div>
          `;
        } else if (propType === "color") {
          const hexOrRgb = propVal || "transparent";
          controlHTML = `
            <div class="prop-input-wrap">
              <span class="prop-color-picker-swatch" style="background-color: ${hexOrRgb};"></span>
              <input type="text" value="${propVal}" ${isDisabled ? "disabled" : ""} style="padding-left:0;">
            </div>
          `;
        } else if (propType === "select") {
          controlHTML = `
            <div class="prop-input-wrap">
              <select ${isDisabled ? "disabled" : ""}>
                ${options.map(opt => `<option value="${opt}" ${propVal === opt ? "selected" : ""}>${opt}</option>`).join("")}
              </select>
            </div>
          `;
        } else {
          controlHTML = `
            <div class="prop-input-wrap">
              <input type="text" value="${propVal}" ${isDisabled ? "disabled" : ""}>
            </div>
          `;
        }

        row.innerHTML = `
          <div class="inspector-prop-left">
            <button class="${eyeClass}" title="${isDisabled ? "Enable property" : "Disable property"}">${eyeIcon}</button>
            <span class="prop-label-name" title="${propName}">${propName}</span>
          </div>
          <div class="inspector-prop-right">
            ${controlHTML}
          </div>
        `;

        // Wire events for this row
        const eyeBtn = row.querySelector(".prop-eye-toggle");
        eyeBtn.onclick = () => {
          if (isDisabled) {
            // Re-enable: restore the inline override we removed, if any.
            disabledSet.delete(propName);
            const cached = valuesMap[propName];
            if (cached && cached.inline) {
              el.style.setProperty(propName, cached.inline, "important");
            }
            delete valuesMap[propName];
          } else {
            // Disable: drop any inline override so the property reverts to the
            // stylesheet/inherited value. We remember the inline value (if it
            // was set inline) so the toggle is reversible.
            disabledSet.add(propName);
            valuesMap[propName] = {
              inline: el.style.getPropertyValue(propName),
              computed: propVal
            };
            el.style.removeProperty(propName);
          }
          renderPropertiesList();
          const newRect = el.getBoundingClientRect();
          showHighlight(newRect, "");
        };

        const updateStyleValue = (newVal) => {
          if (isDisabled) return;
          el.style.setProperty(propName, newVal, "important");
          updateCodeBox();
          const newRect = el.getBoundingClientRect();
          showHighlight(newRect, "");
        };

        // Inputs wiring
        if (propType === "slider") {
          const slider = row.querySelector(".prop-slider");
          const numBox = row.querySelector(".prop-slider-num-box");
          // Preserve the value's existing unit (e.g. em/%) instead of always
          // forcing px, which would mangle unitless/relative values.
          const parsed = parseValAndUnit(propVal);
          const unit = parsed.unit || sliderUnit;

          slider.oninput = () => {
            numBox.value = slider.value;
            updateStyleValue(slider.value + unit);
          };

          numBox.oninput = () => {
            const n = parseFloat(numBox.value);
            if (isNaN(n)) return;
            slider.value = n;
            updateStyleValue(n + unit);
          };
        } else if (propType === "select") {
          const select = row.querySelector("select");
          select.onchange = () => {
            updateStyleValue(select.value);
          };
        } else if (propType === "color") {
          const textInput = row.querySelector("input");
          const swatch = row.querySelector(".prop-color-picker-swatch");
          textInput.oninput = () => {
            swatch.style.backgroundColor = textInput.value;
            updateStyleValue(textInput.value);
          };
        } else {
          const textInput = row.querySelector("input");
          textInput.oninput = () => {
            updateStyleValue(textInput.value);
          };
        }

        listSlot.appendChild(row);
      });

      updateCodeBox();
    }

    function updateCodeBox() {
      const codeSlot = detailsSlot.querySelector("#inspector-css-code-slot");
      if (!codeSlot) return;

      let classes = "";
      if (el.classList && el.classList.length > 0) {
        const cls = Array.from(el.classList)
          .filter(c => typeof c === "string" && c.trim() && !c.startsWith("super-webdev-"))
          .join(".");
        if (cls) classes = `.${cls}`;
      }
      const selector = `${tagName}${classes}`;

      // Show all properties of "all" tab in code box
      const propNames = PROPERTIES_BY_TAB.all;

      let lines = [];
      const disabledSet = state.disabledStyles.get(el) || new Set();
      const valuesMap = state.disabledStyleValues.get(el) || {};

      propNames.forEach(propName => {
        if (disabledSet.has(propName)) {
          const cached = valuesMap[propName];
          const cachedVal = (cached && (cached.inline || cached.computed)) || computed.getPropertyValue(propName) || "";
          lines.push(`  <span style="color: rgba(255,255,255,0.25); font-style: italic;">/* ${propName}: ${cachedVal}; */</span>`);
        } else {
          const val = el.style.getPropertyValue(propName) || computed.getPropertyValue(propName);
          if (val) {
            const colorVal = extractColor(propName, val);
            let swatch = "";
            if (colorVal) {
              swatch = `<span class="css-p-swatch" style="background-color: ${colorVal};"></span>`;
            }
            lines.push(`  <span style="color: #38bdf8;">${propName}</span>: ${swatch}<span style="color: #f7f7fa;">${val}</span>;`);
          }
        }
      });

      codeSlot.innerHTML = `
<span style="color: #fca5a5;">${selector}</span> {
${lines.join("\n")}
}
      `.trim();
    }

    renderPropertiesList();
  }

  // 2. Live Text Editor

