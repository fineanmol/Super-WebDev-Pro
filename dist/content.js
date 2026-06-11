(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/state.js
  var state;
  var init_state = __esm({
    "src/state.js"() {
      state = {
        isSidebarOpen: false,
        activeTool: null,
        // "css-inspector", "live-text-editor", etc.
        sidebarEl: null,
        drawerEl: null,
        shadowRoot: null,
        hostDiv: null,
        hostEl: null,
        toastEl: null,
        // Tool specific state
        hoverEl: null,
        highlightOverlay: null,
        originalStyles: /* @__PURE__ */ new WeakMap(),
        originalText: /* @__PURE__ */ new WeakMap(),
        selectedElementForCss: null,
        activeInspectorTab: "all",
        outlinerColor: "rgba(184, 163, 252, 0.65)",
        // Responsive Viewer
        activeListeners: [],
        activeIFrames: [],
        deviceList: [],
        // Ruler
        rulerCanvas: null,
        disabledStyles: /* @__PURE__ */ new WeakMap(),
        disabledStyleValues: /* @__PURE__ */ new WeakMap(),
        // Undo stacks for various tools
        undoStacks: {
          textEdits: [],
          deletedElements: [],
          movedElements: [],
          swappedImages: []
        }
      };
    }
  });

  // src/utils.js
  function formatElementSelector(el) {
    if (!el) return "";
    const tagName = el.tagName.toLowerCase();
    let idAttr = el.id ? `#${el.id}` : "";
    let classesAttr = "";
    if (el.classList && el.classList.length > 0) {
      const cls = Array.from(el.classList).filter((c) => typeof c === "string" && c.trim() && !c.startsWith("super-webdev-")).join(".");
      if (cls) classesAttr = `.${cls}`;
    }
    let selector = `${tagName}${idAttr}${classesAttr}`;
    if (selector.length > 30) {
      selector = selector.substring(0, 30) + "...";
    }
    return selector;
  }
  function getFirstFontFamily(fontFamilyStr) {
    if (!fontFamilyStr) return "sans-serif";
    const first = fontFamilyStr.split(",")[0].trim();
    return first.replace(/['"]/g, "");
  }
  function hexToRgb(hex) {
    let c = hex.replace(/^#/, "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    return { r: num >> 16 & 255, g: num >> 8 & 255, b: num & 255 };
  }
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function extractColor(propName, value) {
    if (!value) return null;
    if (propName === "color" || propName === "background-color") {
      return value;
    }
    const match = value.match(/(rgba?\(.*?\)|#[0-9a-fA-F]{3,8})/);
    return match ? match[0] : null;
  }
  function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  var init_utils = __esm({
    "src/utils.js"() {
      init_state();
      init_hud();
    }
  });

  // src/ui/highlight.js
  function showHighlight(rect, labelText, customColor = null) {
    ensureHUD();
    state.highlightOverlay.style.top = `${rect.top}px`;
    state.highlightOverlay.style.left = `${rect.left}px`;
    state.highlightOverlay.style.width = `${rect.width}px`;
    state.highlightOverlay.style.height = `${rect.height}px`;
    state.highlightOverlay.style.display = "block";
    if (customColor) {
      state.highlightOverlay.style.borderColor = customColor;
      if (typeof customColor === "string" && customColor.startsWith("var(")) {
        state.highlightOverlay.style.backgroundColor = "rgba(184, 163, 252, 0.08)";
      } else {
        state.highlightOverlay.style.backgroundColor = `${customColor}0e`;
      }
      state.highlightLabel.style.backgroundColor = customColor;
    } else {
      const defaultBorder = state.activeTool === "css-inspector" ? "#4ade80" : "var(--accent-purple)";
      const defaultBg = state.activeTool === "css-inspector" ? "rgba(74, 222, 128, 0.05)" : "rgba(184, 163, 252, 0.08)";
      state.highlightOverlay.style.borderColor = defaultBorder;
      state.highlightOverlay.style.backgroundColor = defaultBg;
      state.highlightLabel.style.backgroundColor = "var(--accent-purple)";
    }
    if (state.activeTool === "css-inspector") {
      state.highlightOverlay.classList.add("show-guides");
      state.highlightLabel.style.display = "none";
    } else {
      state.highlightOverlay.classList.remove("show-guides");
      state.highlightLabel.textContent = labelText;
      state.highlightLabel.style.top = `${Math.max(rect.top - 20, 2)}px`;
      state.highlightLabel.style.left = `${rect.left}px`;
      state.highlightLabel.style.display = "block";
    }
  }
  function isHUDElement(el) {
    if (!el) return false;
    if (el === state.hostEl || state.hostEl.contains(el)) return true;
    return false;
  }
  function hideHighlight() {
    if (state.highlightOverlay) {
      state.highlightOverlay.style.display = "none";
      state.highlightOverlay.classList.remove("show-guides");
      state.highlightLabel.style.display = "none";
    }
    if (state.inspectorTooltip) {
      state.inspectorTooltip.style.display = "none";
    }
  }
  function updateInspectorTooltip(element, clientX, clientY) {
    if (!state.inspectorTooltip) return;
    const computed = window.getComputedStyle(element);
    const parentSel = element.parentElement ? formatElementSelector(element.parentElement) : "";
    const activeSel = formatElementSelector(element);
    const childSel = element.firstElementChild ? formatElementSelector(element.firstElementChild) : "";
    let hierarchyHTML = "";
    if (parentSel) {
      hierarchyHTML += `<div style="margin-bottom: 2px;">${parentSel}</div>`;
      hierarchyHTML += `<div class="tooltip-hierarchy-active">\u2514 ${activeSel}</div>`;
    } else {
      hierarchyHTML += `<div class="tooltip-hierarchy-active">${activeSel}</div>`;
    }
    if (childSel) {
      hierarchyHTML += `<div style="margin-top: 2px; color: rgba(255,255,255,0.3);">\u2514 ${childSel}</div>`;
    }
    const tagName = element.tagName.toLowerCase();
    const rect = element.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const dimsHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:5px; opacity:0.75;">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
      <span>${width} \xD7 ${height}</span>
    `;
    const firstFont = getFirstFontFamily(computed.fontFamily);
    const fontSize = computed.fontSize;
    const fontWeight = computed.fontWeight;
    const fontHTML = `
      <span style="font-family: serif; font-weight: 800; font-size: 11px; margin-right: 6px; color: rgba(255, 255, 255, 0.45); display: inline-block;">A</span>
      <span>${firstFont} ${fontSize} \xB7 ${fontWeight}</span>
    `;
    const propsToShow = [];
    const isZeroOrNone = (val) => !val || val === "0px" || val === "none" || val === "0px 0px" || val === "0px 0px 0px 0px" || val === "normal";
    propsToShow.push({ name: "color", value: computed.color });
    const bgCol = computed.backgroundColor;
    if (bgCol && bgCol !== "rgba(0, 0, 0, 0)" && bgCol !== "transparent") {
      propsToShow.push({ name: "background-color", value: bgCol });
    }
    const disp = computed.display;
    if (disp && disp !== "block" && disp !== "inline") {
      propsToShow.push({ name: "display", value: disp });
      if (disp.includes("flex") || disp.includes("grid")) {
        const fd = computed.flexDirection;
        if (fd && fd !== "row") propsToShow.push({ name: "flex-direction", value: fd });
        const ai = computed.alignItems;
        if (ai && ai !== "normal" && ai !== "stretch") propsToShow.push({ name: "align-items", value: ai });
        const jc = computed.justifyContent;
        if (jc && jc !== "normal" && jc !== "start" && jc !== "flex-start") propsToShow.push({ name: "justify-content", value: jc });
        const gap = computed.gap;
        if (gap && !isZeroOrNone(gap)) propsToShow.push({ name: "gap", value: gap });
      }
    }
    const pos = computed.position;
    if (pos && pos !== "static") {
      propsToShow.push({ name: "position", value: pos });
      const zIndex = computed.zIndex;
      if (zIndex && zIndex !== "auto") propsToShow.push({ name: "z-index", value: zIndex });
    }
    const margin = computed.margin;
    if (margin && !isZeroOrNone(margin)) propsToShow.push({ name: "margin", value: margin });
    const padding = computed.padding;
    if (padding && !isZeroOrNone(padding)) propsToShow.push({ name: "padding", value: padding });
    const borderStyle = computed.borderStyle;
    const borderWidth = computed.borderWidth;
    const borderColor = computed.borderColor;
    if (borderStyle && borderStyle !== "none" && borderWidth && borderWidth !== "0px") {
      propsToShow.push({ name: "border", value: `${borderWidth} ${borderStyle} ${borderColor}` });
    }
    const borderRadius = computed.borderRadius;
    if (borderRadius && !isZeroOrNone(borderRadius)) propsToShow.push({ name: "border-radius", value: borderRadius });
    const ff = computed.fontFamily;
    if (ff) {
      const ffTrunc = ff.length > 25 ? ff.substring(0, 25) + "..." : ff;
      propsToShow.push({ name: "font-family", value: ffTrunc });
    }
    const lh = computed.lineHeight;
    if (lh && lh !== "normal") propsToShow.push({ name: "line-height", value: lh });
    const bs = computed.boxSizing;
    if (bs) propsToShow.push({ name: "box-sizing", value: bs });
    const wfs = computed.webkitFontSmoothing || computed.getPropertyValue("-webkit-font-smoothing");
    if (wfs && wfs !== "auto") propsToShow.push({ name: "-webkit-font-smoothing", value: wfs });
    propsToShow.sort((a, b) => a.name.localeCompare(b.name));
    let cssHTML = "";
    propsToShow.forEach((prop) => {
      const colorVal = extractColor(prop.name, prop.value);
      let swatch = "";
      if (colorVal) {
        swatch = `<span class="css-p-swatch" style="background-color: ${colorVal};"></span>`;
      }
      cssHTML += `
        <div class="css-p-row">
          <span class="css-p-name">${prop.name}</span>: <span class="css-p-value">${swatch}${prop.value}</span>;
        </div>
      `;
    });
    state.inspectorTooltip.innerHTML = `
      <div class="tooltip-hierarchy">${hierarchyHTML}</div>
      <div class="tooltip-meta">
        <div class="tooltip-tag">${tagName}</div>
        <div class="tooltip-meta-row">${dimsHTML}</div>
        <div class="tooltip-meta-row">${fontHTML}</div>
      </div>
      <div class="tooltip-css-block">${cssHTML}</div>
      <div class="tooltip-footer">Click to lock \xB7 \u2191\u2193 navigate \xB7 Esc to exit</div>
    `;
    state.inspectorTooltip.style.display = "block";
    const tooltipWidth = 290;
    const tooltipHeight = state.inspectorTooltip.offsetHeight || 280;
    const marginOffset = 15;
    let x = clientX + marginOffset;
    let y = clientY + marginOffset;
    if (x + tooltipWidth > window.innerWidth) {
      x = clientX - tooltipWidth - marginOffset;
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = clientY - tooltipHeight - marginOffset;
    }
    x = Math.max(5, x);
    y = Math.max(5, y);
    state.inspectorTooltip.style.left = `${x}px`;
    state.inspectorTooltip.style.top = `${y}px`;
  }
  var init_highlight = __esm({
    "src/ui/highlight.js"() {
      init_state();
      init_hud();
      init_utils();
    }
  });

  // src/ui/drawer.js
  function resetDrawerHeader() {
    if (!state.drawerEl) return;
    const titleSlot = state.shadowRoot.getElementById("drawer-title-slot");
    if (titleSlot) return;
    const header = state.drawerEl.querySelector(".drawer-header");
    if (header) {
      header.innerHTML = `
      <div>
        <h3 class="drawer-title" id="drawer-title-slot">Tool Details</h3>
        <div class="drawer-subtitle" id="drawer-sub-slot">Select a tool to display diagnostics</div>
      </div>
      <button class="drawer-close" id="drawer-close-btn">&times;</button>
    `;
      header.querySelector("#drawer-close-btn").onclick = () => {
        deactivateCurrentTool();
      };
    }
  }
  function openDrawer(title, subtitle, contentHTML, onRender = null) {
    ensureHUD();
    resetDrawerHeader();
    state.shadowRoot.getElementById("drawer-title-slot").textContent = title;
    state.shadowRoot.getElementById("drawer-sub-slot").textContent = subtitle;
    const slot = state.shadowRoot.getElementById("drawer-content-slot");
    slot.innerHTML = contentHTML;
    state.drawerEl.classList.add("visible");
    if (onRender) onRender(slot);
  }
  function closeDrawer() {
    if (state.drawerEl) {
      state.drawerEl.classList.remove("visible");
    }
  }
  function showPremiumLockedDrawer(toolId) {
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
  var init_drawer = __esm({
    "src/ui/drawer.js"() {
      init_state();
      init_hud();
      init_tool_manager();
    }
  });

  // src/ui/toast.js
  function showToast(msg) {
    ensureHUD();
    const txt = state.shadowRoot.getElementById("toast-text-slot");
    txt.textContent = msg;
    state.toastEl.classList.add("visible");
    setTimeout(() => {
      state.toastEl.classList.remove("visible");
    }, 2500);
  }
  var init_toast = __esm({
    "src/ui/toast.js"() {
      init_state();
      init_hud();
    }
  });

  // src/features/css-inspector.js
  function setupCSSInspector() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>\u{1F50D}</span> Element Selector Active
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
      const existingSlot = state.shadowRoot.getElementById("inspector-element-details");
      if (!existingSlot) {
        const guideHTML2 = `
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
        openDrawer("CSS Inspector", "Computed values & Live CSS overrides", guideHTML2);
      } else {
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
  function parseValAndUnit(valStr) {
    if (!valStr) return { value: 0, unit: "px" };
    const match = String(valStr).trim().match(/^([\d.]+)([a-zA-Z%]*)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || "px" };
    }
    const valOnly = parseFloat(valStr);
    return { value: isNaN(valOnly) ? 0 : valOnly, unit: "px" };
  }
  function renderCSSDetailsInDrawer() {
    const el = state.selectedElementForCss;
    if (!el || !state.drawerEl) return;
    let detailsSlot = state.shadowRoot.getElementById("inspector-element-details");
    if (!detailsSlot) {
      const guideHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>\u{1F50D}</span> Element Selector Active
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
            Click to lock an element and edit styles in this drawer.
          </p>
        </div>
        <div id="inspector-element-details" style="display: none; margin-top: 14px;"></div>
      `;
      openDrawer("CSS Inspector", "Computed values & Live CSS overrides", guideHTML);
      detailsSlot = state.shadowRoot.getElementById("inspector-element-details");
      if (!detailsSlot) return;
    }
    if (state.drawerEl && !state.drawerEl.classList.contains("visible")) {
      state.drawerEl.classList.add("visible");
    }
    detailsSlot.style.display = "block";
    state.activeInspectorTab = state.activeInspectorTab || "all";
    if (!state.disabledStyles) state.disabledStyles = /* @__PURE__ */ new WeakMap();
    if (!state.disabledStyleValues) state.disabledStyleValues = /* @__PURE__ */ new WeakMap();
    if (!state.originalStyles) state.originalStyles = /* @__PURE__ */ new WeakMap();
    if (!state.originalStyles.has(el)) {
      state.originalStyles.set(el, el.getAttribute("style") || "");
    }
    let disabledSet = state.disabledStyles.get(el);
    if (!disabledSet) {
      disabledSet = /* @__PURE__ */ new Set();
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
      const cls = Array.from(el.classList).filter((c) => typeof c === "string" && c.trim() && !c.startsWith("super-webdev-")).join(".");
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
            <span>${width} \xD7 ${height}</span>
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
          <div><span class="inspector-footer-key">\u2318K</span> switch tool</div>
        </div>
      </div>
    `;
    detailsSlot.querySelector("#inspector-copy-sel-btn").onclick = () => {
      const sel = classesAttr ? tagName + classesAttr : tagName;
      navigator.clipboard.writeText(sel);
      showToast("Selector copied!");
    };
    const resetStyles = () => {
      el.setAttribute("style", state.originalStyles.get(el));
      state.disabledStyles.set(el, /* @__PURE__ */ new Set());
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
    const tabBtns = detailsSlot.querySelectorAll(".inspector-filter-btn");
    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeInspectorTab = btn.getAttribute("data-tab");
        renderPropertiesList();
      };
    });
    detailsSlot.querySelector("#inspector-add-prop-btn").onclick = () => {
      const listSlot = detailsSlot.querySelector("#inspector-props-list-slot");
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
      valInput.onkeydown = (e) => {
        if (e.key === "Enter") submitAdd();
      };
      nameInput.onkeydown = (e) => {
        if (e.key === "Enter") valInput.focus();
      };
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
      propNames.forEach((propName) => {
        let propVal = el.style.getPropertyValue(propName) || computed.getPropertyValue(propName) || computed[propName] || "";
        const isDisabled = disabledSet.has(propName);
        if (isDisabled) {
          const cached = valuesMap[propName];
          propVal = cached ? cached.inline || cached.computed : propVal;
        }
        const row = document.createElement("div");
        row.className = "inspector-prop-row";
        if (isDisabled) row.style.opacity = "0.45";
        const eyeClass = isDisabled ? "prop-eye-toggle" : "prop-eye-toggle active";
        const eyeIcon = isDisabled ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        let controlHTML = "";
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
          sliderMin = 0;
          sliderMax = 50;
          sliderUnit = "px";
        } else if (propName === "line-height") {
          propType = "slider";
          sliderMin = 10;
          sliderMax = 80;
          sliderUnit = "px";
        } else if (propName === "font-size") {
          propType = "slider";
          sliderMin = 8;
          sliderMax = 72;
          sliderUnit = "px";
        }
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
                ${options.map((opt) => `<option value="${opt}" ${propVal === opt ? "selected" : ""}>${opt}</option>`).join("")}
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
        const eyeBtn = row.querySelector(".prop-eye-toggle");
        eyeBtn.onclick = () => {
          if (isDisabled) {
            disabledSet.delete(propName);
            const cached = valuesMap[propName];
            if (cached && cached.inline) {
              el.style.setProperty(propName, cached.inline, "important");
            } else {
              el.style.removeProperty(propName);
            }
            delete valuesMap[propName];
          } else {
            disabledSet.add(propName);
            valuesMap[propName] = {
              inline: el.style.getPropertyValue(propName),
              computed: propVal
            };
            el.style.setProperty(propName, "unset", "important");
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
        if (propType === "slider") {
          const slider = row.querySelector(".prop-slider");
          const numBox = row.querySelector(".prop-slider-num-box");
          const unit = sliderUnit;
          slider.oninput = () => {
            numBox.value = slider.value;
            updateStyleValue(slider.value + unit);
          };
          numBox.oninput = () => {
            slider.value = numBox.value;
            updateStyleValue(numBox.value + unit);
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
        const cls = Array.from(el.classList).filter((c) => typeof c === "string" && c.trim() && !c.startsWith("super-webdev-")).join(".");
        if (cls) classes = `.${cls}`;
      }
      const selector = `${tagName}${classes}`;
      const propNames = PROPERTIES_BY_TAB.all;
      let lines = [];
      const disabledSet2 = state.disabledStyles.get(el) || /* @__PURE__ */ new Set();
      const valuesMap2 = state.disabledStyleValues.get(el) || {};
      propNames.forEach((propName) => {
        if (disabledSet2.has(propName)) {
          const cachedVal = valuesMap2[propName] || computed.getPropertyValue(propName) || computed[propName] || "";
          lines.push(`  <span style="color: rgba(255,255,255,0.25); font-style: italic;">/* ${propName}: ${cachedVal}; */</span>`);
        } else {
          const val = el.style[propName] || computed.getPropertyValue(propName) || computed[propName];
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
  var PROPERTIES_BY_TAB;
  var init_css_inspector = __esm({
    "src/features/css-inspector.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
      PROPERTIES_BY_TAB = {
        all: ["display", "position", "top", "right", "bottom", "left", "width", "height", "margin", "padding", "color", "background-color", "border", "border-radius", "font-family", "font-size", "line-height", "font-weight", "text-align", "box-shadow", "opacity", "cursor", "z-index"],
        "web-layout": ["display", "position", "top", "right", "bottom", "left", "width", "height", "margin", "padding", "box-sizing", "overflow", "z-index"],
        typography: ["font-family", "font-size", "line-height", "font-weight", "text-align", "color", "letter-spacing", "text-transform", "white-space", "word-break"],
        color: ["color", "border-color", "outline-color", "text-decoration-color"],
        effects: ["box-shadow", "opacity", "mix-blend-mode", "filter", "backdrop-filter", "transform", "transition"],
        background: ["background-color", "background-image", "background-size", "background-position", "background-repeat"],
        grid: ["grid-template-columns", "grid-template-rows", "grid-gap", "align-items", "justify-content", "flex-direction", "flex-wrap"]
      };
    }
  });

  // src/features/live-text-editor.js
  function setupLiveTextEditor() {
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
            <span>\u{1F4DD}</span> Live Text Editor Active
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
        slot.querySelectorAll(".te-single-restore").forEach((btn) => {
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
  var init_live_text_editor = __esm({
    "src/features/live-text-editor.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/fonts-changer.js
  function setupFontsChanger() {
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
    const cardsHTML = fonts.map((f) => `
      <div class="font-card" data-font="${f.name}" style="font-family: '${f.name}', sans-serif;">
        <div class="font-card-name">${f.name}</div>
        <div class="font-card-preview">${f.sample}</div>
      </div>
    `).join("");
    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">\u{1F524} Font Family Changer</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
          Select a typography style below to apply it globally to the webpage body in real-time.
        </p>
      </div>
      <div class="fonts-grid custom-scroll" style="max-height: 320px; overflow-y: auto;">
        ${cardsHTML}
      </div>
    `;
    openDrawer("Font Changer", "Swap global page typography", contentHTML, (slot) => {
      slot.querySelectorAll(".font-card").forEach((card) => {
        card.onclick = () => {
          const fontName = card.getAttribute("data-font");
          const linkId = `gfont-${fontName.toLowerCase().replace(/\s+/g, "-")}`;
          if (!state.shadowRoot.getElementById(linkId)) {
            const link = document.createElement("link");
            link.id = linkId;
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
            link.rel = "stylesheet";
            state.shadowRoot.appendChild(link);
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
  var init_fonts_changer = __esm({
    "src/features/fonts-changer.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/list-fonts.js
  function setupListFonts() {
    const fontsMap = {};
    const allElements = document.getElementsByTagName("*");
    for (let i = 0; i < allElements.length; i++) {
      const style = window.getComputedStyle(allElements[i]);
      const fontFamily = style.fontFamily;
      if (fontFamily) {
        const cleanFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
        fontsMap[cleanFont] = (fontsMap[cleanFont] || 0) + 1;
      }
    }
    const fontList = Object.entries(fontsMap).sort((a, b) => b[1] - a[1]);
    const cardsHTML = fontList.map(([fontName, count]) => `
      <div class="font-card" style="font-family: '${fontName}', sans-serif; cursor: default;">
        <div class="font-card-name">${fontName}</div>
        <div class="font-card-preview">Used on ${count} element(s)</div>
      </div>
    `).join("");
    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">\u{1F4CB} Typography Audit</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
          Analyzed all unique font families currently loaded and active on this webpage.
        </p>
      </div>
      <div class="fonts-grid custom-scroll" style="max-height: 320px; overflow-y: auto;">
        ${cardsHTML || '<div style="font-size:11px; color:var(--text-secondary); text-align:center; padding:20px;">No fonts detected.</div>'}
      </div>
    `;
    openDrawer("Fonts List", "Typography usage diagnostics", contentHTML);
  }
  var init_list_fonts = __esm({
    "src/features/list-fonts.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/color-picker.js
  function setupColorPicker() {
    function drawColorPickerDrawer(pickedHex = null) {
      let resultHTML = "";
      if (pickedHex) {
        const rgb = hexToRgb(pickedHex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        resultHTML = `
          <div style="display:flex; flex-direction:column; gap:10px; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:12px;">
            <div style="width:60px; height:60px; border-radius:50%; background:${pickedHex}; border:2px solid rgba(255,255,255,0.15); box-shadow:0 4px 10px rgba(0,0,0,0.3);"></div>
            <div style="width:100%; display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px;">
                <span>HEX: <b style="color:var(--accent-emerald);">${pickedHex.toUpperCase()}</b></span>
                <button class="hud-btn cp-val-copy" data-val="${pickedHex.toUpperCase()}" style="padding:2px 6px; font-size:9px;">Copy</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px;">
                <span>RGB: <b style="color:var(--accent-emerald);">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</b></span>
                <button class="hud-btn cp-val-copy" data-val="rgb(${rgb.r}, ${rgb.g}, ${rgb.b})" style="padding:2px 6px; font-size:9px;">Copy</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px;">
                <span>HSL: <b style="color:var(--accent-emerald);">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</b></span>
                <button class="hud-btn cp-val-copy" data-val="hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)" style="padding:2px 6px; font-size:9px;">Copy</button>
              </div>
            </div>
          </div>
        `;
      }
      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>\u{1F3A8}</span> EyeDropper Magnifier
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
            Launch pixel EyeDropper tool to magnify and extract color codes from webpage templates.
          </p>
          <button id="cp-start-picker-btn" class="hud-btn primary" style="width:100%; justify-content:center;">\u{1F680} Launch Color Picker</button>
        </div>
        <div id="cp-picked-results">${resultHTML}</div>
      `;
      openDrawer("Color Picker", "Pipette selected color codes", contentHTML, (slot) => {
        slot.querySelector("#cp-start-picker-btn").onclick = () => {
          if (!window.EyeDropper) {
            showToast("EyeDropper not supported in this browser!");
            return;
          }
          const eyeDropper = new EyeDropper();
          eyeDropper.open().then((res) => {
            navigator.clipboard.writeText(res.sRGBHex.toUpperCase());
            showToast(`Copied picked color: ${res.sRGBHex.toUpperCase()}`);
            drawColorPickerDrawer(res.sRGBHex);
          });
        };
        slot.querySelectorAll(".cp-val-copy").forEach((btn) => {
          btn.onclick = () => {
            navigator.clipboard.writeText(btn.getAttribute("data-val"));
            showToast("Copied value to clipboard!");
          };
        });
      });
    }
    drawColorPickerDrawer();
  }
  var init_color_picker = __esm({
    "src/features/color-picker.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/color-palette.js
  function setupColorPalette() {
    const colorsMap = {};
    const bgColorsMap = {};
    const allElements = document.getElementsByTagName("*");
    for (let i = 0; i < allElements.length; i++) {
      const style = window.getComputedStyle(allElements[i]);
      const color = style.color;
      const bgColor = style.backgroundColor;
      if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
        colorsMap[color] = (colorsMap[color] || 0) + 1;
      }
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        bgColorsMap[bgColor] = (bgColorsMap[bgColor] || 0) + 1;
      }
    }
    const textList = Object.entries(colorsMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const bgList = Object.entries(bgColorsMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const textSwatchesHTML = textList.map(([col, count]) => `
      <div class="swatch-card" data-color="${col}">
        <div class="swatch-color" style="background-color: ${col};"></div>
        <div class="swatch-text">${col}</div>
        <div style="font-size: 8px; color: var(--text-secondary);">${count} times</div>
      </div>
    `).join("");
    const bgSwatchesHTML = bgList.map(([col, count]) => `
      <div class="swatch-card" data-color="${col}">
        <div class="swatch-color" style="background-color: ${col};"></div>
        <div class="swatch-text">${col}</div>
        <div style="font-size: 8px; color: var(--text-secondary);">${count} times</div>
      </div>
    `).join("");
    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">\u{1F3A8} Color Scheme Extractor</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
          Extracted most frequent colors. Click on any color card below to copy its value to the clipboard.
        </p>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="font-size: 10px; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 6px; font-weight: 700;">Text Colors</span>
        <div class="color-swatches-grid custom-scroll" style="max-height: 150px; overflow-y: auto;">
          ${textSwatchesHTML || '<div style="font-size:11px; color:var(--text-secondary); padding:10px;">No text colors extracted.</div>'}
        </div>
      </div>

      <div>
        <span style="font-size: 10px; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 6px; font-weight: 700;">Background Colors</span>
        <div class="color-swatches-grid custom-scroll" style="max-height: 150px; overflow-y: auto;">
          ${bgSwatchesHTML || '<div style="font-size:11px; color:var(--text-secondary); padding:10px;">No background colors extracted.</div>'}
        </div>
      </div>
    `;
    openDrawer("Color Palette", "Dominant page style colors", contentHTML, (slot) => {
      slot.querySelectorAll(".swatch-card").forEach((swatch) => {
        swatch.onclick = () => {
          const colorVal = swatch.getAttribute("data-color");
          navigator.clipboard.writeText(colorVal);
          showToast(`Copied color: ${colorVal}`);
        };
      });
    });
  }
  var init_color_palette = __esm({
    "src/features/color-palette.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/extract-images.js
  function setupExtractImages() {
    const imagesMap = /* @__PURE__ */ new Map();
    const addImage = (src, type, alt = "") => {
      if (!src) return;
      if (!src.startsWith("http") && !src.startsWith("data:")) return;
      if (!imagesMap.has(src)) {
        imagesMap.set(src, {
          id: Math.random().toString(36).substring(2, 10),
          src,
          type,
          alt,
          width: 0,
          height: 0,
          sizeClass: "Unknown"
        });
      }
    };
    document.querySelectorAll("link[rel*='icon']").forEach((el) => {
      if (el.href) addImage(el.href, "Favicon");
    });
    document.querySelectorAll("meta[property='og:image'], meta[name='twitter:image']").forEach((el) => {
      if (el.content) addImage(el.content, "OG");
    });
    document.querySelectorAll("img").forEach((img) => {
      if (img.src) addImage(img.src, "Image", img.alt);
    });
    document.querySelectorAll("*").forEach((el) => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\(['"]?(https?:\/\/[^'"]+|data:image\/[^'"]+)['"]?\)/);
        if (match) addImage(match[1], "Background");
      }
    });
    document.querySelectorAll("svg").forEach((svg) => {
      if (svg.parentElement && svg.parentElement.tagName.toLowerCase() === "svg") return;
      try {
        const svgString = new XMLSerializer().serializeToString(svg);
        const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
        addImage(encoded, "SVG", "Inline SVG");
      } catch (e) {
      }
    });
    let imagesList = Array.from(imagesMap.values());
    let activeTypeFilter = "All";
    let activeSizeFilter = "All";
    let searchQuery = "";
    const renderGrid = (slot) => {
      const filtered = imagesList.filter((img) => {
        if (activeTypeFilter !== "All" && img.type !== activeTypeFilter) return false;
        if (activeSizeFilter === "Small" && img.width > 200) return false;
        if (activeSizeFilter === "Medium" && (img.width <= 200 || img.width > 800)) return false;
        if (activeSizeFilter === "Large" && img.width <= 800) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return img.src.toLowerCase().includes(q) || img.alt.toLowerCase().includes(q);
        }
        return true;
      });
      const listHTML = filtered.map((img) => `
        <div class="img-card" style="background:#15151b; border:1px solid rgba(255,255,255,0.08); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; position:relative;">
          <!-- Checkerboard background pattern -->
          <div style="background-image: linear-gradient(45deg, #1c1c24 25%, transparent 25%), linear-gradient(-45deg, #1c1c24 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c24 75%), linear-gradient(-45deg, transparent 75%, #1c1c24 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px; height:120px; display:flex; justify-content:center; align-items:center; position:relative;">
            <img src="${img.src}" style="max-width:100%; max-height:100%; object-fit:contain;" />
            <button style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); border:none; border-radius:4px; color:#fff; width:24px; height:24px; display:flex; justify-content:center; align-items:center; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            </button>
            <div style="position:absolute; top:8px; left:8px; background:var(--accent-purple); color:#fff; font-size:9px; font-weight:600; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${img.type}</div>
          </div>
          <div style="padding:10px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); background:#0a0a0f;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-family:monospace; font-size:10px; color:var(--text-secondary); max-width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${img.src}">${img.id}</span>
              <span class="img-res" style="font-family:monospace; font-size:10px; color:#fff; font-weight:600;">-</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="extract-img-copy-btn" data-url="${img.src}" style="background:rgba(255,255,255,0.05); border:none; border-radius:4px; padding:6px; cursor:pointer; color:var(--text-secondary);" title="Copy URL"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
              <button class="extract-img-open-btn" data-url="${img.src}" style="background:rgba(255,255,255,0.05); border:none; border-radius:4px; padding:6px; cursor:pointer; color:var(--text-secondary);" title="Open in new tab"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></button>
              <button class="extract-img-dl-btn" data-url="${img.src}" style="background:var(--accent-purple); border:none; border-radius:4px; padding:4px 8px; cursor:pointer; color:#fff; display:flex; align-items:center; gap:4px; font-weight:600; font-size:10px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download</button>
            </div>
          </div>
        </div>
      `).join("");
      slot.querySelector("#images-grid-slot").innerHTML = listHTML || '<div style="font-size:12px; color:var(--text-secondary); text-align:center; padding:20px; grid-column:span 2;">No image resources found matching filters.</div>';
      slot.querySelector("#img-count-slot").textContent = filtered.length;
      slot.querySelectorAll(".img-card img").forEach((imgEl) => {
        const updateRes = () => {
          imgEl.setAttribute("data-loaded", "true");
          const resLabel = imgEl.parentElement.nextElementSibling.querySelector(".img-res");
          if (resLabel) {
            resLabel.textContent = `${imgEl.naturalWidth}x${imgEl.naturalHeight}`;
          }
        };
        if (imgEl.complete) {
          updateRes();
        } else {
          imgEl.onload = updateRes;
        }
      });
      slot.querySelectorAll(".extract-img-copy-btn").forEach((btn) => {
        btn.onclick = () => {
          navigator.clipboard.writeText(btn.getAttribute("data-url"));
          showToast("Copied image URL!");
        };
      });
      slot.querySelectorAll(".extract-img-open-btn").forEach((btn) => {
        btn.onclick = () => window.open(btn.getAttribute("data-url"), "_blank", "noopener,noreferrer");
      });
      slot.querySelectorAll(".extract-img-dl-btn").forEach((btn, idx) => {
        btn.onclick = () => {
          const url = btn.getAttribute("data-url");
          const ext = url.startsWith("data:image/svg+xml") ? "svg" : "png";
          chrome.runtime.sendMessage({
            action: "downloadFile",
            url,
            filename: `extracted_image_${Date.now()}_${idx + 1}.${ext}`
          });
          showToast("Download started...");
        };
      });
    };
    const typeChips = ["All", "Image", "Favicon", "OG", "Background"].map((t) => `
      <button class="type-filter-chip ${activeTypeFilter === t ? "active" : ""}" data-type="${t}" style="background:${activeTypeFilter === t ? "var(--accent-purple)" : "rgba(255,255,255,0.05)"}; color:#fff; border:none; border-radius:12px; padding:4px 10px; font-size:11px; cursor:pointer;">${t}</button>
    `).join("");
    const sizeChips = ["All", "Small", "Medium", "Large"].map((s) => `
      <button class="size-filter-chip ${activeSizeFilter === s ? "active" : ""}" data-size="${s}" style="background:${activeSizeFilter === s ? "rgba(255,255,255,0.15)" : "none"}; color:var(--text-secondary); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:4px 10px; font-size:11px; cursor:pointer;">${s}</button>
    `).join("");
    const contentHTML = `
      <div style="margin-bottom:16px;">
        <div style="position:relative; margin-bottom:12px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" style="position:absolute; left:12px; top:10px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="img-search-input" placeholder="Search URL or Alt text" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 8px 8px 32px; color:#fff; font-size:12px; outline:none;" />
          <div style="position:absolute; right:8px; top:8px; background:rgba(239,68,68,0.15); color:#ef4444; border-radius:4px; padding:2px 6px; font-size:9px; font-weight:700; display:flex; align-items:center; gap:4px;">
            <div style="width:4px; height:4px; background:#ef4444; border-radius:50%; box-shadow:0 0 4px #ef4444;"></div> LIVE
          </div>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll" id="type-filters-slot">
            ${typeChips}
          </div>
          <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll" id="size-filters-slot">
            ${sizeChips}
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:12px; color:var(--text-primary); font-weight:600;">
          Found <span id="img-count-slot" style="color:var(--accent-purple);">${imagesList.length}</span> Images
        </div>
        <div style="display:flex; gap:8px;">
          <button id="extract-dl-all-btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:4px 8px; color:#fff; font-size:10px; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download all
          </button>
        </div>
      </div>

      <div id="images-grid-slot" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-height:400px; overflow-y:auto; padding-right:4px;" class="custom-scroll">
      </div>
    `;
    openDrawer("Extract Images", "Media asset download center", contentHTML, (slot) => {
      renderGrid(slot);
      slot.querySelector("#img-search-input").addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderGrid(slot);
      });
      slot.querySelectorAll(".type-filter-chip").forEach((chip) => {
        chip.onclick = () => {
          slot.querySelectorAll(".type-filter-chip").forEach((c) => {
            c.style.background = "rgba(255,255,255,0.05)";
            c.classList.remove("active");
          });
          chip.style.background = "var(--accent-purple)";
          chip.classList.add("active");
          activeTypeFilter = chip.getAttribute("data-type");
          renderGrid(slot);
        };
      });
      slot.querySelectorAll(".size-filter-chip").forEach((chip) => {
        chip.onclick = () => {
          slot.querySelectorAll(".size-filter-chip").forEach((c) => {
            c.style.background = "none";
            c.style.color = "var(--text-secondary)";
            c.classList.remove("active");
          });
          chip.style.background = "rgba(255,255,255,0.15)";
          chip.style.color = "#fff";
          chip.classList.add("active");
          activeSizeFilter = chip.getAttribute("data-size");
          renderGrid(slot);
        };
      });
      const dlAllBtn = slot.querySelector("#extract-dl-all-btn");
      dlAllBtn.onclick = () => {
        showToast("Downloading filtered images...");
        const filtered = imagesList.filter((img) => {
          if (activeTypeFilter !== "All" && img.type !== activeTypeFilter) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return img.src.toLowerCase().includes(q) || img.alt.toLowerCase().includes(q);
          }
          return true;
        });
        filtered.forEach((img, idx) => {
          setTimeout(() => {
            const ext = img.src.startsWith("data:image/svg+xml") ? "svg" : "png";
            chrome.runtime.sendMessage({
              action: "downloadFile",
              url: img.src,
              filename: `extracted-${img.type}-${idx + 1}.${ext}`
            });
          }, idx * 150);
        });
      };
    });
  }
  var init_extract_images = __esm({
    "src/features/extract-images.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/move-element.js
  function setupMoveElement() {
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
            <span>\u{1F5B1}\uFE0F</span> Reposition layout modules
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
        slot.querySelectorAll(".move-single-restore").forEach((btn) => {
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
        case "ArrowUp":
          ty -= step;
          handled = true;
          break;
        case "ArrowDown":
          ty += step;
          handled = true;
          break;
        case "ArrowLeft":
          tx -= step;
          handled = true;
          break;
        case "ArrowRight":
          tx += step;
          handled = true;
          break;
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
  var init_move_element = __esm({
    "src/features/move-element.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/delete-element.js
  function setupDeleteElement() {
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
            <span>\u{1F5D1}\uFE0F</span> Element Eraser Active
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
        slot.querySelectorAll(".del-single-restore").forEach((btn) => {
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
  var init_delete_element = __esm({
    "src/features/delete-element.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/export-element.js
  function setupExportElement() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>\u{1F4E4}</span> Code Exporter Active
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
  function renderExportDetailsInDrawer(element) {
    const detailsSlot = state.shadowRoot.getElementById("export-element-details");
    if (!detailsSlot) return;
    detailsSlot.style.display = "block";
    const htmlCode = element.outerHTML;
    const computed = window.getComputedStyle(element);
    let cssText = `/* Exported Style rules for ${element.tagName.toLowerCase()} */
.exported-element {
`;
    const rules = [
      "background-color",
      "color",
      "font-family",
      "font-size",
      "font-weight",
      "padding",
      "margin",
      "border",
      "border-radius",
      "box-shadow",
      "width",
      "height",
      "display",
      "flex-direction",
      "justify-content",
      "align-items"
    ];
    rules.forEach((rule) => {
      const val = computed.getPropertyValue(rule);
      if (val) cssText += `  ${rule}: ${val};
`;
    });
    cssText += `}
`;
    const htmlClean = htmlCode.replace(/ style="[^"]*"/, "").replace(element.tagName.toLowerCase(), `${element.tagName.toLowerCase()} class="exported-element"`);
    detailsSlot.innerHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top:12px;">Export webpage element snippet:</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button id="export-dl-btn" class="hud-btn primary" style="justify-content:center; padding:10px;">\u{1F4BE} Download HTML/CSS</button>
        <button id="export-cp-btn" class="hud-btn" style="justify-content:center; padding:10px; background:#000; border-color:#222;">\u{1F680} Open in CodePen</button>
      </div>
      <div style="margin-top:16px;">
        <span style="font-size:11px; color:var(--text-secondary); display:block; margin-bottom:6px;">Clean HTML:</span>
        <textarea style="width:100%; height:100px; font-size:10px; font-family:monospace; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.06); border-radius:6px; color:#c8c8d0; padding:6px; resize:none;" readonly>${htmlClean}</textarea>
      </div>
    `;
    detailsSlot.querySelector("#export-dl-btn").onclick = () => {
      const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0c0c0e; color: #f7f7fa; display:flex; justify-content:center; align-items:center; min-height:100vh; }
    ${cssText}
  </style>
</head>
<body>
  ${htmlClean}
</body>
</html>`;
      const blob = new Blob([fullHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-${element.tagName.toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Downloaded standalone HTML");
    };
    detailsSlot.querySelector("#export-cp-btn").onclick = () => {
      const payload = {
        title: `SuperDev Pro Export <${element.tagName.toLowerCase()}>`,
        html: htmlClean,
        css: cssText,
        editors: "110"
      };
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://codepen.io/pen/define";
      form.target = "_blank";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "data";
      input.value = JSON.stringify(payload);
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      showToast("Redirected to CodePen!");
    };
  }
  var init_export_element = __esm({
    "src/features/export-element.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/page-ruler.js
  function setupPageRuler() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>\u{1F4CF}</span> Page Ruler Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Move the mouse to draw coordinate lines. Click and drag to measure relative distance bounding boxes on the webpage layout.
        </p>
      </div>
    `;
    openDrawer("Page Ruler", "Canvas-based layout measurement", guideHTML);
    const canvas = state.rulerCanvas;
    if (!canvas) return;
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    let startX = null, startY = null;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    const drawRuler = (curX, curY) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(184, 163, 252, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(canvas.width, curY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, canvas.height);
      ctx.stroke();
      if (isDragging && startX !== null && startY !== null) {
        const dx = curX - startX;
        const dy = curY - startY;
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(110, 231, 168, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, startY, dx, dy);
        ctx.fillStyle = "rgba(110, 231, 168, 0.08)";
        ctx.fillRect(startX, startY, dx, dy);
        const wStr = `${Math.abs(dx)}px`;
        const hStr = `${Math.abs(dy)}px`;
        ctx.fillStyle = "#121218";
        ctx.fillRect(startX + dx / 2 - 30, startY + dy / 2 - 12, 60, 24);
        ctx.strokeStyle = "rgba(110, 231, 168, 0.4)";
        ctx.strokeRect(startX + dx / 2 - 30, startY + dy / 2 - 12, 60, 24);
        ctx.fillStyle = "#6ee7a8";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${wStr}\xD7${hStr}`, startX + dx / 2, startY + dy / 2);
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(curX + 12, curY - 25, 100, 20);
        ctx.strokeStyle = "rgba(184, 163, 252, 0.5)";
        ctx.strokeRect(curX + 12, curY - 25, 100, 20);
        ctx.fillStyle = "#f7f7fa";
        ctx.font = "bold 9.5px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`X: ${curX} Y: ${curY}`, curX + 18, curY - 15);
      }
    };
    trackListener(document, "mousemove", (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      drawRuler(lastX, lastY);
    }, true);
    trackListener(document, "mousedown", (e) => {
      if (isHUDElement(e.target)) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    }, true);
    trackListener(document, "mouseup", () => {
      isDragging = false;
      startX = null;
      startY = null;
    }, true);
    state.activeListeners.push({
      target: window,
      event: "resize",
      callback: resizeCanvas,
      useCapture: false
    });
  }
  var init_page_ruler = __esm({
    "src/features/page-ruler.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/page-outliner.js
  function setupPageOutliner() {
    function drawOutlinerDrawer() {
      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>\u{1F532}</span> Layout Outlines Active
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 12px 0;">
            Webpage DOM nodes are marked with dashed outline boundaries to analyze padding/margins layouts alignment.
          </p>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size: 11px; color: var(--text-secondary);">Outline Border Color:</span>
            <select id="outliner-color-select" class="css-editor-textarea" style="height:32px; font-size:11px; font-family:inherit; padding: 4px;">
              <option value="rgba(184, 163, 252, 0.65)">Purple Accent (Default)</option>
              <option value="rgba(110, 231, 168, 0.65)">Emerald Green</option>
              <option value="rgba(244, 114, 182, 0.65)">Rose Pink</option>
              <option value="rgba(99, 102, 241, 0.65)">Indigo Accent</option>
              <option value="random">Randomized Color Swatches</option>
            </select>
          </div>
        </div>
      `;
      openDrawer("Page Outliner", "Inspect alignment shapes", contentHTML, (slot) => {
        const select = slot.querySelector("#outliner-color-select");
        select.value = state.outlinerColor;
        select.onchange = (e) => {
          state.outlinerColor = e.target.value;
          applyOutlinerBorders();
        };
      });
    }
    function applyOutlinerBorders() {
      if (state.customStyleElement && state.customStyleElement.parentNode) {
        state.customStyleElement.parentNode.removeChild(state.customStyleElement);
      }
      state.customStyleElement = document.createElement("style");
      if (state.outlinerColor === "random") {
        let randomCSS = "";
        const tags = ["div", "section", "article", "aside", "header", "footer", "p", "span", "a", "button", "input", "img"];
        tags.forEach((t) => {
          const col = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
          randomCSS += `${t} { outline: 1px dashed ${col} !important; }
`;
        });
        randomCSS += "#super-webdev-hud-host * { outline: none !important; }\n";
        state.customStyleElement.textContent = randomCSS;
      } else {
        state.customStyleElement.textContent = `
          * {
            outline: 1px dashed ${state.outlinerColor} !important;
          }
          #super-webdev-hud-host * {
            outline: none !important;
          }
        `;
      }
      document.head.appendChild(state.customStyleElement);
    }
    drawOutlinerDrawer();
    applyOutlinerBorders();
  }
  var init_page_outliner = __esm({
    "src/features/page-outliner.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/image-replacer.js
  function setupImageReplacer() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>\u{1F504}</span> Image Replacer Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Hover and click on any image tag (or layout container styled with background-image) to change its content src.
        </p>
      </div>
      <div id="image-replacer-details" style="display: none; margin-top: 14px;"></div>
    `;
    openDrawer("Image Swap", "Visual staging assets updater", guideHTML);
    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target)) return;
      let isImg = e.target.tagName.toLowerCase() === "img";
      let isBg = false;
      if (!isImg) {
        const bg = window.getComputedStyle(e.target).backgroundImage;
        if (bg && bg !== "none" && bg.startsWith("url(")) isBg = true;
      }
      if (isImg || isBg) {
        const rect = e.target.getBoundingClientRect();
        showHighlight(rect, `Replace: ${isImg ? "Image Tag" : "Background-Image"} (Click)`, "var(--accent-purple)");
      }
    }, true);
    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target)) return;
      hideHighlight();
    }, true);
    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;
      let isImg = e.target.tagName.toLowerCase() === "img";
      let isBg = false;
      let bgUrl = "";
      if (!isImg) {
        const bg = window.getComputedStyle(e.target).backgroundImage;
        if (bg && bg !== "none" && bg.startsWith("url(")) {
          isBg = true;
          const match = bg.match(/url\(["']?([^"']*)["']?\)/);
          bgUrl = match ? match[1] : "";
        }
      }
      if (isImg || isBg) {
        e.preventDefault();
        e.stopPropagation();
        renderImageSwapDetailsInDrawer(e.target, isBg, isBg ? bgUrl : e.target.src);
      }
    }, true);
  }
  function renderImageSwapDetailsInDrawer(element, isBg, currentSource) {
    const detailsSlot = state.shadowRoot.getElementById("image-replacer-details");
    if (!detailsSlot) return;
    detailsSlot.style.display = "block";
    detailsSlot.innerHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top:12px;">Stage replacement image path:</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button id="repl-file-btn" class="hud-btn primary" style="justify-content:center; padding:10px;">\u{1F4C1} Select Local Image</button>
        <input type="file" id="repl-file-input" accept="image/*" style="display:none;">
        <div style="font-size:11px; color:var(--text-secondary); margin-top:8px;">Or enter web URL:</div>
        <input type="text" id="repl-url-input" class="css-editor-textarea" style="height:38px;" placeholder="https://example.com/logo.png">
        <button id="repl-url-btn" class="hud-btn" style="justify-content:center; padding:8px;">Apply URL</button>
      </div>
      <div style="margin-top:16px;">
        <span style="font-size:11px; color:var(--text-secondary); display:block; margin-bottom:6px;">Current Source:</span>
        <div style="font-size:10px; font-family:monospace; background:rgba(0,0,0,0.2); padding:6px; border-radius:4px; word-break:break-all; color:var(--text-secondary);">
          ${currentSource}
        </div>
      </div>
    `;
    const fileInput = detailsSlot.querySelector("#repl-file-input");
    const fileBtn = detailsSlot.querySelector("#repl-file-btn");
    const urlInput = detailsSlot.querySelector("#repl-url-input");
    const urlBtn = detailsSlot.querySelector("#repl-url-btn");
    fileBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => applyImageReplacement(element, isBg, currentSource, ev.target.result);
      reader.readAsDataURL(file);
    };
    urlBtn.onclick = () => {
      const url = urlInput.value.trim();
      if (url) applyImageReplacement(element, isBg, currentSource, url);
    };
  }
  function applyImageReplacement(element, isBg, currentSource, newSource) {
    if (isBg) {
      element.style.setProperty("background-image", "url('" + newSource + "')", "important");
    } else {
      element.src = newSource;
    }
    state.undoStacks.swappedImages.push({
      element,
      isBg,
      oldSource: currentSource,
      newSource
    });
    showToast("Image replaced successfully!");
  }
  var init_image_replacer = __esm({
    "src/features/image-replacer.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/take-screenshot.js
  function setupTakeScreenshot() {
    const contentHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>\u{1F4F8}</span> Capturer Tool
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 12px 0;">
          Capture visible viewport and stage png downloads.
        </p>
        <button id="ss-action-capture-btn" class="hud-btn primary" style="width:100%; justify-content:center; padding:10px;">\u{1F4F8} Take Screenshot</button>
      </div>
    `;
    openDrawer("Screenshot", "Web page viewport captures", contentHTML, (slot) => {
      slot.querySelector("#ss-action-capture-btn").onclick = () => {
        showToast("Capturing viewport screenshot...");
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "takeScreenshot" }, (response) => {
            if (chrome.runtime.lastError || !response || !response.screenshotUrl) {
              showToast("Screenshot capture failed on this tab!");
              return;
            }
            openScreenshotPreviewModal(response.screenshotUrl);
          });
        }, 300);
      };
    });
  }
  function openScreenshotPreviewModal(url) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "90%";
    img.style.maxHeight = "80%";
    img.style.border = "4px solid var(--accent-purple, #b8a3fc)";
    img.style.borderRadius = "8px";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close Preview";
    closeBtn.style.marginTop = "16px";
    closeBtn.style.padding = "8px 16px";
    closeBtn.style.background = "#fff";
    closeBtn.style.color = "#000";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    state.shadowRoot.appendChild(overlay);
  }
  var init_take_screenshot = __esm({
    "src/features/take-screenshot.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/responsive-viewer.js
  function setupResponsiveViewer() {
    let overlay = state.shadowRoot.getElementById("responsive-viewer-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "responsive-viewer-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "2147483647";
      overlay.style.background = "#0d0f14";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.fontFamily = "var(--font-primary, system-ui)";
      overlay.style.color = "var(--text-primary, #fff)";
      let activeDevices = [
        { ...DEVICE_CATALOG[1], uid: Date.now() + 1, rotate: false },
        { ...DEVICE_CATALOG[5], uid: Date.now() + 2, rotate: false },
        { ...DEVICE_CATALOG[6], uid: Date.now() + 3, rotate: false }
      ];
      let syncScroll = true;
      let isSyncing = false;
      const renderHeader = () => {
        const pills = activeDevices.map((d) => `
          <div class="device-pill" style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:4px 10px; font-size:11px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect></svg>
            <span style="font-weight:600;">${d.name}</span>
            <span style="color:var(--text-secondary); font-family:monospace;">${d.rotate ? d.height : d.width}\xD7${d.rotate ? d.width : d.height}</span>
            <button class="rv-close-device-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0; display:flex; align-items:center;">&times;</button>
          </div>
        `).join("");
        return `
          <div style="display:flex; align-items:center; gap:12px; flex:1;">
            ${pills}
            
            <div style="position:relative; display:inline-block;">
              <button id="rv-add-device-btn" style="display:flex; align-items:center; gap:4px; background:var(--accent-purple, #b8a3fc); color:#121212; border:none; border-radius:12px; padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer;">
                + Add <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div id="rv-add-dropdown" style="display:none; position:absolute; top:calc(100% + 4px); left:0; background:#1e1e24; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:4px; box-shadow:0 4px 12px rgba(0,0,0,0.5); z-index:100; min-width:160px;">
                ${DEVICE_CATALOG.map((cat) => `
                  <div class="rv-cat-item" data-id="${cat.id}" style="padding:6px 12px; font-size:11px; color:#fff; cursor:pointer; border-radius:4px; display:flex; justify-content:space-between;">
                    <span>${cat.name}</span>
                    <span style="color:rgba(255,255,255,0.3);">${cat.width}\xD7${cat.height}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <div style="width:1px; height:16px; background:rgba(255,255,255,0.1); margin:0 8px;"></div>
            
            <button id="rv-sync-btn" style="display:flex; align-items:center; gap:6px; background:${syncScroll ? "rgba(74, 222, 128, 0.1)" : "rgba(255,255,255,0.05)"}; color:${syncScroll ? "#4ade80" : "var(--text-secondary)"}; border:1px solid ${syncScroll ? "#4ade8055" : "rgba(255,255,255,0.1)"}; border-radius:12px; padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              Sync Scroll ${syncScroll ? "ON" : "OFF"}
            </button>
          </div>
        `;
      };
      const renderFrames = () => {
        return activeDevices.map((d) => {
          const dw = d.rotate ? d.height : d.width;
          const dh = d.rotate ? d.width : d.height;
          return `
            <div class="rv-frame-wrapper" data-uid="${d.uid}" style="display:flex; flex-direction:column; align-items:center; flex-shrink:0;">
              <div style="display:flex; justify-content:space-between; width:${dw * d.scale}px; margin-bottom:8px; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-secondary);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect></svg>
                  <span style="color:#fff; font-weight:600;">${d.name}</span>
                  <div style="display:flex; align-items:center; gap:4px; font-family:monospace; background:rgba(255,255,255,0.05); border-radius:4px; padding:2px;">
                    <input type="number" class="rv-dim-input" data-uid="${d.uid}" data-axis="w" value="${dw}" style="width:36px; background:none; border:none; color:var(--text-secondary); font-family:monospace; font-size:10px; text-align:right; outline:none;-moz-appearance:textfield;"/>
                    <span style="color:rgba(255,255,255,0.2);">\xD7</span>
                    <input type="number" class="rv-dim-input" data-uid="${d.uid}" data-axis="h" value="${dh}" style="width:36px; background:none; border:none; color:var(--text-secondary); font-family:monospace; font-size:10px; text-align:left; outline:none;-moz-appearance:textfield;"/>
                  </div>
                  <span style="font-family:monospace;">\xB7 ${Math.round(d.scale * 100)}%</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="rv-rotate-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Rotate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg></button>
                  <button class="rv-refresh-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Refresh"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></button>
                  <button class="rv-close-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Close">&times;</button>
                </div>
              </div>
              <div class="rv-iframe-container" style="width:${dw * d.scale}px; height:${dh * d.scale}px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden; position:relative; background:#fff; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
                <iframe src="${window.location.href}" style="width:${dw}px; height:${dh}px; transform:scale(${d.scale}); transform-origin:top left; border:none; position:absolute; top:0; left:0; pointer-events:auto;"></iframe>
                <div class="rv-resize-handle" data-uid="${d.uid}" style="position:absolute; bottom:0; right:0; width:20px; height:20px; cursor:nwse-resize; z-index:10; background:linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%); border-bottom-right-radius:10px;"></div>
              </div>
            </div>
          `;
        }).join("");
      };
      const setupIframes = () => {
        const iframes = overlay.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
          iframe.onload = () => {
            try {
              const win = iframe.contentWindow;
              if (!win) return;
              win.addEventListener("scroll", (e) => {
                if (!syncScroll || isSyncing) return;
                isSyncing = true;
                const doc = win.document.documentElement;
                const percentX = win.scrollX / (doc.scrollWidth - doc.clientWidth || 1);
                const percentY = win.scrollY / (doc.scrollHeight - doc.clientHeight || 1);
                iframes.forEach((other) => {
                  if (other !== iframe) {
                    try {
                      const otherWin = other.contentWindow;
                      const otherDoc = otherWin.document.documentElement;
                      otherWin.scrollTo(
                        percentX * (otherDoc.scrollWidth - otherDoc.clientWidth),
                        percentY * (otherDoc.scrollHeight - otherDoc.clientHeight)
                      );
                    } catch (err) {
                    }
                  }
                });
                requestAnimationFrame(() => {
                  isSyncing = false;
                });
              });
            } catch (e) {
              console.warn("Cross-origin iframe blocked sync scrolling");
            }
          };
        });
      };
      const updateUI = () => {
        overlay.querySelector("#rv-header-slot").innerHTML = renderHeader();
        overlay.querySelector("#rv-frames-slot").innerHTML = renderFrames();
        overlay.querySelector("#rv-sync-btn").onclick = () => {
          syncScroll = !syncScroll;
          updateUI();
        };
        const addBtn = overlay.querySelector("#rv-add-device-btn");
        const addDrop = overlay.querySelector("#rv-add-dropdown");
        addBtn.onclick = () => {
          addDrop.style.display = addDrop.style.display === "none" ? "block" : "none";
        };
        overlay.querySelectorAll(".rv-cat-item").forEach((item) => {
          item.onmouseenter = () => item.style.background = "rgba(255,255,255,0.1)";
          item.onmouseleave = () => item.style.background = "transparent";
          item.onclick = () => {
            const catId = item.getAttribute("data-id");
            const cat = DEVICE_CATALOG.find((c) => c.id === catId);
            if (cat) {
              activeDevices.push({ ...cat, uid: Date.now(), rotate: false });
              updateUI();
            }
          };
        });
        overlay.onclick = (e) => {
          if (!e.target.closest("#rv-add-device-btn") && !e.target.closest("#rv-add-dropdown")) {
            if (addDrop) addDrop.style.display = "none";
          }
        };
        overlay.querySelectorAll(".rv-close-device-btn, .rv-close-btn").forEach((btn) => {
          btn.onclick = () => {
            activeDevices = activeDevices.filter((d) => d.uid != btn.getAttribute("data-uid"));
            updateUI();
          };
        });
        overlay.querySelectorAll(".rv-rotate-btn").forEach((btn) => {
          btn.onclick = () => {
            const dev = activeDevices.find((d) => d.uid == btn.getAttribute("data-uid"));
            if (dev) {
              dev.rotate = !dev.rotate;
              updateUI();
            }
          };
        });
        overlay.querySelectorAll(".rv-refresh-btn").forEach((btn) => {
          btn.onclick = () => updateUI();
        });
        overlay.querySelectorAll(".rv-dim-input").forEach((input) => {
          input.onkeyup = (e) => {
            const dev = activeDevices.find((d) => d.uid == input.getAttribute("data-uid"));
            if (dev) {
              const val = parseInt(e.target.value) || 100;
              if (input.getAttribute("data-axis") === "w") {
                if (dev.rotate) dev.height = val;
                else dev.width = val;
              } else {
                if (dev.rotate) dev.width = val;
                else dev.height = val;
              }
              const wrapper = overlay.querySelector(`.rv-frame-wrapper[data-uid="${dev.uid}"]`);
              if (wrapper) {
                const dw = dev.rotate ? dev.height : dev.width;
                const dh = dev.rotate ? dev.width : dev.height;
                const container = wrapper.querySelector(".rv-iframe-container");
                const iframe = container.querySelector("iframe");
                wrapper.firstElementChild.style.width = `${dw * dev.scale}px`;
                container.style.width = `${dw * dev.scale}px`;
                container.style.height = `${dh * dev.scale}px`;
                iframe.style.width = `${dw}px`;
                iframe.style.height = `${dh}px`;
              }
            }
          };
          input.onchange = () => updateUI();
        });
        overlay.querySelectorAll(".rv-resize-handle").forEach((handle) => {
          let startX, startY, startW, startH, dev, wrapper, container, iframe, inputs;
          handle.onmousedown = (e) => {
            e.preventDefault();
            const uid = handle.getAttribute("data-uid");
            dev = activeDevices.find((d) => d.uid == uid);
            if (!dev) return;
            wrapper = overlay.querySelector(`.rv-frame-wrapper[data-uid="${dev.uid}"]`);
            container = wrapper.querySelector(".rv-iframe-container");
            iframe = container.querySelector("iframe");
            inputs = wrapper.querySelectorAll(".rv-dim-input");
            startX = e.clientX;
            startY = e.clientY;
            startW = dev.rotate ? dev.height : dev.width;
            startH = dev.rotate ? dev.width : dev.height;
            overlay.querySelectorAll("iframe").forEach((ifr) => ifr.style.pointerEvents = "none");
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          };
          const onMouseMove = (e) => {
            const dx = (e.clientX - startX) / dev.scale;
            const dy = (e.clientY - startY) / dev.scale;
            const newW = Math.max(200, Math.round(startW + dx));
            const newH = Math.max(200, Math.round(startH + dy));
            if (dev.rotate) {
              dev.height = newW;
              dev.width = newH;
            } else {
              dev.width = newW;
              dev.height = newH;
            }
            wrapper.firstElementChild.style.width = `${newW * dev.scale}px`;
            container.style.width = `${newW * dev.scale}px`;
            container.style.height = `${newH * dev.scale}px`;
            iframe.style.width = `${newW}px`;
            iframe.style.height = `${newH}px`;
            inputs[0].value = newW;
            inputs[1].value = newH;
          };
          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            overlay.querySelectorAll("iframe").forEach((ifr) => ifr.style.pointerEvents = "auto");
            updateUI();
          };
        });
        setupIframes();
      };
      overlay.innerHTML = `
        <!-- Top bar -->
        <div style="display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); gap:20px; background:#12141a; position:relative; z-index:20;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple, #b8a3fc)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            <span style="font-size: 16px; font-weight: 600;">Responsive Viewer</span>
            <div style="width:6px; height:6px; background:#4ade80; border-radius:50%; box-shadow:0 0 8px #4ade80;"></div>
          </div>
          
          <div id="rv-header-slot" style="display:flex; align-items:center; gap:12px; flex:1;"></div>

          <button id="rv-exit-btn" style="margin-left:auto; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-secondary); cursor:pointer; padding:6px 12px; display:flex; align-items:center; gap:6px; font-size:11px; transition:background 0.2s;">
            <span style="font-family:monospace;">Esc</span> close
          </button>
        </div>
        
        <!-- Frames Area -->
        <div id="rv-frames-slot" class="custom-scroll" style="flex:1; display:flex; gap:40px; padding:40px; overflow-x:auto; overflow-y:auto; background:#0d0f14;"></div>
      `;
      state.shadowRoot.appendChild(overlay);
      overlay.querySelector("#rv-exit-btn").onclick = () => {
        overlay.style.display = "none";
        deactivateCurrentTool();
      };
      overlay.querySelector("#rv-exit-btn").onmouseenter = (e) => e.target.style.background = "rgba(255,255,255,0.1)";
      overlay.querySelector("#rv-exit-btn").onmouseleave = (e) => e.target.style.background = "rgba(255,255,255,0.05)";
      updateUI();
    } else {
      overlay.style.display = "flex";
    }
  }
  var DEVICE_CATALOG;
  var init_responsive_viewer = __esm({
    "src/features/responsive-viewer.js"() {
      init_state();
      init_hud();
      init_tool_manager();
      DEVICE_CATALOG = [
        { id: "iphone-se", name: "iPhone SE", width: 375, height: 667, scale: 0.8 },
        { id: "iphone-14-pro", name: "iPhone 14 Pro", width: 393, height: 852, scale: 0.7 },
        { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", width: 430, height: 932, scale: 0.65 },
        { id: "pixel-7", name: "Pixel 7", width: 412, height: 915, scale: 0.65 },
        { id: "ipad-mini", name: "iPad Mini", width: 768, height: 1024, scale: 0.5 },
        { id: "ipad-pro", name: "iPad Pro", width: 1024, height: 1366, scale: 0.4 },
        { id: "macbook-air", name: "MacBook Air", width: 1280, height: 832, scale: 0.4 },
        { id: "desktop-1080p", name: "Desktop 1080p", width: 1920, height: 1080, scale: 0.3 }
      ];
    }
  });

  // src/features/settings.js
  function setupSettings() {
    let modal = state.shadowRoot.getElementById("settings-modal-overlay");
    if (!modal) {
      let initPaneSettings2 = function(p, tabLabel) {
        if (tabLabel === "Account") {
          initAccountPane(p);
          return;
        }
        if (tabLabel === "Appearance") {
          const deactBtn = p.querySelector("#settings-deactivate-btn");
          if (deactBtn) {
            deactBtn.onclick = () => {
              Promise.resolve().then(() => (init_hud(), hud_exports)).then((m) => m.destroyHUD());
            };
          }
        }
        const elements = p.querySelectorAll("[data-setting]");
        if (elements.length === 0) return;
        const keys = Array.from(elements).map((el) => el.getAttribute("data-setting"));
        chrome.storage.local.get(keys, (res) => {
          elements.forEach((el) => {
            const key = el.getAttribute("data-setting");
            const savedVal = res[key];
            const defaultVal = defaultSettings[key];
            const currentVal = savedVal !== void 0 ? savedVal : defaultVal;
            if (el.type === "checkbox") {
              el.checked = !!currentVal;
            } else if (el.tagName === "SELECT") {
              el.value = currentVal;
            }
            el.onchange = (e) => {
              const val = el.type === "checkbox" ? el.checked : el.value;
              chrome.storage.local.set({ [key]: val }, () => {
                showToast(`Saved setting: ${key.replace(/([A-Z])/g, " $1")}`);
                if (key === "sidebarPosition") {
                  Promise.resolve().then(() => (init_hud(), hud_exports)).then((m) => m.setSidebarPosition(val));
                }
              });
            };
          });
        });
      }, initAccountPane = function(p) {
        const statusContainer = p.querySelector("#license-status-container");
        const input = p.querySelector("#settings-license-input");
        const btn = p.querySelector("#settings-license-btn");
        function renderStatus() {
          chrome.storage.local.get(["premium", "licenseKey"], (res) => {
            const isPro = res.premium !== false;
            const key = res.licenseKey || "";
            input.value = key;
            if (isPro) {
              statusContainer.innerHTML = `
                <div>
                  <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #fff;">Status</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    <span style="color: #4ade80; font-weight: 600;">SuperDev Pro Active</span> \xB7 Lifetime License \xB7 1/3 devices
                  </div>
                </div>
              `;
              btn.textContent = "Deactivate";
              btn.style.background = "rgba(239, 68, 68, 0.2)";
              btn.style.border = "1px solid rgba(239, 68, 68, 0.4)";
              btn.style.color = "#ef4444";
            } else {
              statusContainer.innerHTML = `
                <div>
                  <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #fff;">Status</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    <span style="color: var(--text-secondary); font-weight: 500;">Free Version (Limited Features)</span>
                  </div>
                </div>
              `;
              btn.textContent = "Activate";
              btn.style.background = "var(--accent-purple)";
              btn.style.border = "none";
              btn.style.color = "#000";
            }
          });
        }
        btn.onclick = () => {
          chrome.storage.local.get(["premium"], (res) => {
            const isPro = res.premium !== false;
            if (isPro) {
              chrome.storage.local.set({ premium: false, licenseKey: "" }, () => {
                showToast("Pro license deactivated.");
                state.isPremium = false;
                renderStatus();
              });
            } else {
              const key = input.value.trim().toUpperCase();
              if (key === "WEBDEVPRO2026") {
                chrome.storage.local.set({ premium: true, licenseKey: key }, () => {
                  showToast("SuperDev Pro activated successfully!");
                  state.isPremium = true;
                  renderStatus();
                });
              } else {
                showToast("Invalid key. Try WEBDEVPRO2026");
              }
            }
          });
        };
        renderStatus();
      };
      modal = document.createElement("div");
      modal.id = "settings-modal-overlay";
      modal.style.position = "fixed";
      modal.style.inset = "0";
      modal.style.zIndex = "2147483647";
      modal.style.background = "rgba(10, 10, 15, 0.95)";
      modal.style.display = "flex";
      modal.style.flexDirection = "column";
      modal.style.fontFamily = "var(--font-primary)";
      modal.style.color = "var(--text-primary)";
      modal.style.backdropFilter = "blur(12px)";
      modal.innerHTML = `
        <div style="display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; opacity:0.8;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span style="font-size: 16px; font-weight: 600;">Settings</span>
          <div style="width:6px; height:6px; background:#4ade80; border-radius:50%; margin-left:8px; box-shadow:0 0 8px #4ade80;"></div>
          <button id="settings-close-btn" style="margin-left:auto; background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="display: flex; flex: 1; overflow: hidden;">
          <div style="width: 250px; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; overflow-y: auto; padding: 16px 0;">
            <div style="padding: 0 20px; font-size: 10px; font-weight: 700; color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 12px; display:flex; align-items:center; gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              SETTINGS
            </div>
            
            <button class="settings-nav-btn active" style="background:rgba(255,255,255,0.05); color:#fff; border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Account
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              Appearance
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              Screenshot
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Color Picker
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Webpage \u2192 Markdown
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15v-6h3c1.66 0 3 1.34 3 3s-1.34 3-3 3H9z"></path></svg>
              Save as PDF
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Export Element
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              AI Assistant
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              CSS Inspector
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Extract Images
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
              Delete Element
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              JSON Formatter
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
              Tab Manager
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              Reader Mode
            </button>
            <button class="settings-nav-btn" style="background:none; color:var(--text-secondary); border:none; padding:10px 20px; text-align:left; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              World Clock
            </button>
          </div>
          <div id="settings-content-pane" style="flex: 1; padding: 40px; overflow-y: auto; display:flex; flex-direction:column; gap:24px;">
            <!-- Content injects here -->
          </div>
        </div>
      `;
      state.shadowRoot.appendChild(modal);
      const defaultSettings = {
        licenseKey: "",
        theme: "dark",
        sidebarPosition: "right",
        colorFormat: "hex",
        colorAutoCopy: true,
        extractBgImages: true,
        extractMetaTags: true,
        extractZip: false,
        screenshotFormat: "png",
        screenshotAutoDownload: true,
        markdownImages: true,
        markdownTables: true,
        pdfStripStyle: true,
        exportInlineCSS: true,
        exportPrettier: false,
        aiModel: "gpt-4o",
        cssHighlightBoxModel: true,
        deleteConfirm: true,
        jsonIndent: "2",
        tabSuspend: true,
        readerFont: "serif",
        clock24h: true
      };
      const contentPanes2 = {
        "Account": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Account</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Manage your SuperDev Pro license key.</p>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap:16px;">
            <div id="license-status-container">
              <!-- Dynamically loaded -->
            </div>
            <div style="display:flex; gap:10px;">
              <input type="text" id="settings-license-input" placeholder="Enter License Key (e.g. WEBDEVPRO2026)" style="flex:1; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px; outline:none;" />
              <button id="settings-license-btn" style="border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                Verify
              </button>
            </div>
          </div>
        `,
        "Appearance": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Appearance</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Customize the look and feel of SuperDev Pro.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Theme</div>
                <div style="font-size:12px; color:var(--text-secondary);">Choose your preferred color scheme.</div>
              </div>
              <select data-setting="theme" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="dark">Dark Mode (Default)</option>
                <option value="light">Light Mode</option>
                <option value="system">System Auto</option>
              </select>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Sidebar Position</div>
                <div style="font-size:12px; color:var(--text-secondary);">Default docking side for the main HUD.</div>
              </div>
              <select data-setting="sidebarPosition" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="right">Right (Default)</option>
                <option value="left">Left</option>
              </select>
            </div>
            
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08);">
              <div style="font-weight:600; font-size:14px; margin-bottom:4px; color:#ef4444;">Deactivate Extension</div>
              <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Completely unload WebDev Pro from this webpage. Press Cmd+Shift+E or click the extension icon to restart it.</div>
              <button id="settings-deactivate-btn" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; transition:background 0.2s;">
                Turn Off WebDev Pro
              </button>
            </div>
          </div>
        `,
        "Color Picker": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Color Picker Settings</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure how colors are extracted and copied.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Default Color Format</div>
                <div style="font-size:12px; color:var(--text-secondary);">Format copied to clipboard on click.</div>
              </div>
              <select data-setting="colorFormat" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="hex">HEX (#FFFFFF)</option>
                <option value="rgb">RGB (rgb(255,255,255))</option>
                <option value="hsl">HSL (hsl(0,0%,100%))</option>
              </select>
            </div>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="colorAutoCopy" /> Auto-copy to clipboard on click
            </label>
          </div>
        `,
        "Extract Images": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Extract Images</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure media scraping defaults.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="extractBgImages" /> Capture background-image CSS properties
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="extractMetaTags" /> Capture Favicons & OG Meta tags
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="extractZip" /> Zip downloads automatically
            </label>
          </div>
        `,
        "Screenshot": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Screenshot Settings</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Manage image capture quality and format.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Format</div>
              </div>
              <select data-setting="screenshotFormat" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="png">PNG (High Quality)</option>
                <option value="jpeg">JPEG (Smaller Size)</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="screenshotAutoDownload" /> Auto-download on capture
            </label>
          </div>
        `,
        "Webpage \u2192 Markdown": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Webpage \u2192 Markdown</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure markdown extraction formatting.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="markdownImages" /> Include images as markdown links
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="markdownTables" /> Preserve table structures
            </label>
          </div>
        `,
        "Save as PDF": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Save as PDF</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure PDF print properties.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="pdfStripStyle" /> Strip unnecessary styling (Reader view)
            </label>
          </div>
        `,
        "Export Element": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Export Element</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure element bundle extraction.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="exportInlineCSS" /> Inline CSS into style tags
            </label>
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="exportPrettier" /> Pre-format using Prettier
            </label>
          </div>
        `,
        "AI Assistant": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">AI Assistant</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure AI integration features.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Language Model</div>
              </div>
              <select data-setting="aiModel" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="gpt-4o">GPT-4o (Premium)</option>
                <option value="claude-3-5">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>
        `,
        "CSS Inspector": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">CSS Inspector</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure layout overlays and property formats.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="cssHighlightBoxModel" /> Highlight element box-model on hover
            </label>
          </div>
        `,
        "Delete Element": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Delete Element</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configuration for element deletion tool.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="deleteConfirm" /> Require confirmation for container nodes
            </label>
          </div>
        `,
        "JSON Formatter": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">JSON Formatter</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure indentation and auto-formatting.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Indentation Space</div>
              </div>
              <select data-setting="jsonIndent" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tabs">Tabs</option>
              </select>
            </div>
          </div>
        `,
        "Tab Manager": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Tab Manager</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure tab suspended and memory management.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="tabSuspend" /> Automatically suspend inactive tabs after 15 mins
            </label>
          </div>
        `,
        "Reader Mode": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">Reader Mode</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure reading typography and layout.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:16px;">
              <div>
                <div style="font-weight:500; font-size:14px; margin-bottom:4px;">Font Preference</div>
              </div>
              <select data-setting="readerFont" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; padding:6px 12px; outline:none;">
                <option value="serif">Serif (Georgia)</option>
                <option value="sans">Sans-Serif (Inter)</option>
              </select>
            </div>
          </div>
        `,
        "World Clock": `
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #fff;">World Clock</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 24px 0;">Configure timezone defaults.</p>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <label style="display:flex; align-items:center; gap:12px; font-size:13px; cursor:pointer;">
              <input type="checkbox" data-setting="clock24h" /> Use 24-hour time format
            </label>
          </div>
        `
      };
      const defaultContent = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-secondary); opacity:0.5;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:16px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <div style="font-size:16px; font-weight:500;">Settings panel under construction</div>
          <div style="font-size:12px; margin-top:8px;">Detailed configuration options coming soon.</div>
        </div>
      `;
      const pane = modal.querySelector("#settings-content-pane");
      pane.innerHTML = contentPanes2["Account"];
      initPaneSettings2(pane, "Account");
      const navBtns = modal.querySelectorAll(".settings-nav-btn");
      navBtns.forEach((btn) => {
        btn.onclick = () => {
          navBtns.forEach((b) => {
            b.classList.remove("active");
            b.style.background = "none";
            b.style.color = "var(--text-secondary)";
          });
          btn.classList.add("active");
          btn.style.background = "rgba(255,255,255,0.05)";
          btn.style.color = "#fff";
          const label = btn.textContent.trim();
          pane.innerHTML = contentPanes2[label] || defaultContent.replace("Settings panel", label + " settings");
          initPaneSettings2(pane, label);
        };
      });
      modal.querySelector("#settings-close-btn").onclick = () => {
        modal.style.display = "none";
        deactivateCurrentTool();
      };
    } else {
      modal.style.display = "flex";
      const pane = modal.querySelector("#settings-content-pane");
      pane.innerHTML = contentPanes["Account"];
      initPaneSettings(pane, "Account");
    }
  }
  var init_settings = __esm({
    "src/features/settings.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/tech-stack.js
  function setupTechStack() {
    const stack = [];
    const scriptTags = Array.from(document.getElementsByTagName("script"));
    const scriptSrcs = scriptTags.map((s) => s.src.toLowerCase()).filter(Boolean);
    const linkTags = Array.from(document.getElementsByTagName("link"));
    const linkHrefs = linkTags.map((l) => l.href.toLowerCase()).filter(Boolean);
    if (document.querySelector("[data-reactroot]") || document.querySelector("#react-root") || scriptSrcs.some((s) => s.includes("react"))) {
      stack.push({ name: "React", category: "Frontend Framework", icon: "\u269B\uFE0F" });
    }
    if (document.getElementById("__NEXT_DATA__") || scriptSrcs.some((s) => s.includes("_next/static"))) {
      stack.push({ name: "Next.js", category: "Server SSR Framework", icon: "\u25B2" });
    }
    if (document.querySelector("[v-cloak]") || scriptSrcs.some((s) => s.includes("vue"))) {
      stack.push({ name: "Vue.js", category: "Frontend Framework", icon: "\u{1F49A}" });
    }
    if (document.querySelector("[ng-version]") || document.querySelector("[ng-app]") || scriptSrcs.some((s) => s.includes("angular"))) {
      stack.push({ name: "Angular", category: "Frontend Platform", icon: "\u{1F170}\uFE0F" });
    }
    if (scriptSrcs.some((s) => s.includes("jquery"))) {
      stack.push({ name: "jQuery", category: "Legacy DOM Library", icon: "\u{1F4B8}" });
    }
    const generator = document.querySelector('meta[name="generator"]')?.content || "";
    if (generator.toLowerCase().includes("wordpress") || linkHrefs.some((h) => h.includes("wp-content") || h.includes("wp-includes"))) {
      stack.push({ name: "WordPress", category: "CMS Engine", icon: "\u{1F4DD}" });
    }
    if (scriptSrcs.some((s) => s.includes("cdn.shopify.com")) || generator.toLowerCase().includes("shopify")) {
      stack.push({ name: "Shopify", category: "Ecommerce CMS", icon: "\u{1F6CD}\uFE0F" });
    }
    if (linkHrefs.some((h) => h.includes("tailwind")) || document.querySelector("[class*='grid-cols-']")) {
      stack.push({ name: "Tailwind CSS", category: "CSS Utility Framework", icon: "\u{1F3A8}" });
    }
    if (linkHrefs.some((h) => h.includes("bootstrap")) || document.querySelector("[class*='col-md-'], [class*='btn-primary']")) {
      stack.push({ name: "Bootstrap CSS", category: "UI CSS Framework", icon: "\u{1F171}\uFE0F" });
    }
    if (scriptSrcs.some((s) => s.includes("google-analytics.com") || s.includes("googletagmanager.com/gtag"))) {
      stack.push({ name: "Google Analytics", category: "User Analytics Engine", icon: "\u{1F4CA}" });
    }
    if (scriptSrcs.some((s) => s.includes("js.stripe.com"))) {
      stack.push({ name: "Stripe Checkout", category: "Payment Gateway API", icon: "\u{1F4B3}" });
    }
    let stackHTML = `
      <div style="font-size: 11px; color:var(--text-secondary); margin-bottom:14px;">Identified web technologies stack:</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
    `;
    stack.forEach((tech) => {
      stackHTML += `
        <div class="audit-card audit-success">
          <div class="audit-card-title">
            <span>${tech.icon}</span>
            <span>${tech.name}</span>
          </div>
          <div class="audit-card-desc">${tech.category}</div>
        </div>
      `;
    });
    if (stack.length === 0) {
      stackHTML += `<div style="font-size:12px; color:var(--text-secondary); text-align:center; padding:20px;">No typical frontend framework signatures detected.</div>`;
    }
    stackHTML += `</div>`;
    openDrawer("Site Stack", "Web Tech Stack Analyzer", stackHTML);
  }
  var init_tech_stack = __esm({
    "src/features/tech-stack.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/seo-meta.js
  function setupSeoMeta() {
    const rawTitle = document.title || "No Title Tag Detected";
    const rawDesc = document.querySelector('meta[name="description"]')?.content || "No Meta Description Tag Found";
    const rawCanonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
    const rawRobots = document.querySelector('meta[name="robots"]')?.content || "index, follow";
    const title = escapeHTML(rawTitle);
    const desc = escapeHTML(rawDesc);
    const canonical = escapeHTML(rawCanonical);
    const robots = escapeHTML(rawRobots);
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const h1Count = headings.filter((h) => h.tagName.toLowerCase() === "h1").length;
    let hOutlineHTML = `<div style="max-height: 200px; overflow-y:auto; padding:6px; background:rgba(0,0,0,0.2); border-radius:6px; font-family:monospace; font-size:11px;">`;
    headings.forEach((h) => {
      const pad = (parseInt(h.tagName.charAt(1)) - 1) * 8;
      const headingText = escapeHTML(h.innerText.trim() || "(empty)");
      hOutlineHTML += `
        <div style="padding-left: ${pad}px; margin-bottom: 4px; border-left:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--accent-purple); font-weight:700; margin-right:4px;">${h.tagName}</span>
          <span style="color:var(--text-primary);">${headingText}</span>
        </div>
      `;
    });
    hOutlineHTML += `</div>`;
    const seoHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:14px;">Webpage SEO diagnostics audit:</div>
      
      <!-- Title Card -->
      <div class="audit-card ${rawTitle ? "audit-success" : "audit-warning"}">
        <div class="audit-card-title">\u{1F4DD} Page Title (${rawTitle.length} chars)</div>
        <div class="audit-card-desc" style="font-weight:600; color:var(--text-primary); margin-top:4px;">${title}</div>
      </div>

      <!-- Description Card -->
      <div class="audit-card ${rawDesc.startsWith("No") ? "audit-warning" : "audit-success"}">
        <div class="audit-card-title">\u{1F3F7}\uFE0F Meta Description (${rawDesc.length} chars)</div>
        <div class="audit-card-desc" style="margin-top:4px;">${desc}</div>
      </div>

      <!-- Link visual mock preview -->
      <div style="margin-bottom:16px;">
        <span style="font-size:11px; color:var(--text-secondary);">Google Search Preview:</span>
        <div class="seo-preview-box">
          <div class="seo-preview-url">${canonical}</div>
          <h3 class="seo-preview-title">${title}</h3>
          <p class="seo-preview-desc">${rawDesc.length > 150 ? desc.slice(0, 147) + "..." : desc}</p>
        </div>
      </div>

      <!-- Headings Count Warnings -->
      <div class="audit-card ${h1Count === 1 ? "audit-success" : "audit-warning"}">
        <div class="audit-card-title">\u{1F4D0} Heading Hierarchy</div>
        <div class="audit-card-desc" style="margin-top:4px;">
          Detected <b>${h1Count}</b> H1 tag(s). ${h1Count === 0 ? "Warning: Page needs exactly one H1 tag!" : h1Count > 1 ? "Warning: Page has multiple H1 tags." : "Heading configuration is healthy."}
        </div>
        <div style="margin-top:8px;">Outline Tree:</div>
        ${hOutlineHTML}
      </div>
    `;
    openDrawer("SEO Meta", "SEO tags diagnostics", seoHTML);
  }
  var init_seo_meta = __esm({
    "src/features/seo-meta.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/features/a11y-audit.js
  function setupA11yAudit() {
    const images = Array.from(document.getElementsByTagName("img"));
    const missingAlt = images.filter((img) => !img.alt || img.alt.trim() === "");
    const buttons = Array.from(document.querySelectorAll("button, a[role='button']"));
    const missingAriaLabel = buttons.filter((btn) => !btn.innerText.trim() && !btn.getAttribute("aria-label"));
    const inputs = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit'])"));
    const missingLabels = inputs.filter((inp) => {
      const hasParentLabel = inp.closest("label");
      const hasIdLabel = inp.id ? document.querySelector(`label[for='${inp.id}']`) : false;
      const hasAriaLabel = inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby");
      return !hasParentLabel && !hasIdLabel && !hasAriaLabel;
    });
    const totalIssues = missingAlt.length + missingAriaLabel.length + missingLabels.length;
    const a11yHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:14px;">WCAG Accessibility audits:</div>
      
      <!-- Issue Tracker -->
      <div class="audit-card ${totalIssues === 0 ? "audit-success" : "audit-warning"}">
        <div class="audit-card-title">\u267F Audit Status</div>
        <div class="audit-card-desc">
          Found <b>${totalIssues}</b> accessibility warnings on this webpage.
        </div>
      </div>

      <!-- Image Alt Audit -->
      <div class="audit-card ${missingAlt.length === 0 ? "audit-success" : "audit-warning"}">
        <div class="audit-card-title">\u{1F5BC}\uFE0F Missing Alt Attributes</div>
        <div class="audit-card-desc">
          Found <b>${missingAlt.length}</b> image(s) lacking an alt attribute. Alt attributes are critical for screen reader readers.
        </div>
        ${missingAlt.length > 0 ? `
          <div style="margin-top:8px; font-size:10px; font-family:monospace; max-height:80px; overflow-y:auto; background:rgba(0,0,0,0.15); padding:6px; border-radius:4px;">
            ${missingAlt.slice(0, 10).map((img, i) => `#${i + 1}: ${img.src.split("/").pop().split("?")[0] || "image"}`).join("<br>")}
          </div>
        ` : ""}
      </div>

      <!-- Button Label Audit -->
      <div class="audit-card ${missingAriaLabel.length === 0 ? "audit-success" : "audit-warning"}">
        <div class="audit-card-title">\u{1F39B}\uFE0F Descriptive Buttons</div>
        <div class="audit-card-desc">
          Found <b>${missingAriaLabel.length}</b> button(s) lacking text or aria-labels, making them unreadable by assistant tools.
        </div>
      </div>

      <!-- Inputs Label Audit -->
      <div class="audit-card ${missingLabels.length === 0 ? "audit-success" : "audit-warning"}">
        <div class="audit-card-title">\u270D\uFE0F Unassociated Form Inputs</div>
        <div class="audit-card-desc">
          Found <b>${missingLabels.length}</b> input field(s) without matching label tags or ARIA labels.
        </div>
      </div>
    `;
    openDrawer("Accessibility", "WCAG accessibility checker", a11yHTML);
  }
  var init_a11y_audit = __esm({
    "src/features/a11y-audit.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/core/tool-manager.js
  function activateTool(tool) {
    deactivateCurrentTool();
    ensureHUD();
    state.activeTool = tool;
    updateSidebarActiveBtn();
    closeDrawer();
    switch (tool) {
      case "css-inspector":
        setupCSSInspector();
        break;
      case "live-text-editor":
        setupLiveTextEditor();
        break;
      case "fonts-changer":
        setupFontsChanger();
        break;
      case "list-fonts":
        setupListFonts();
        break;
      case "color-picker":
        setupColorPicker();
        break;
      case "color-palette":
        setupColorPalette();
        break;
      case "move-element":
        setupMoveElement();
        break;
      case "delete-element":
        setupDeleteElement();
        break;
      case "export-element":
        setupExportElement();
        break;
      case "extract-images":
        setupExtractImages();
        break;
      case "page-ruler":
        setupPageRuler();
        break;
      case "page-outliner":
        setupPageOutliner();
        break;
      case "image-replacer":
        setupImageReplacer();
        break;
      case "take-screenshot":
        setupTakeScreenshot();
        break;
      case "responsive-viewer":
        setupResponsiveViewer();
        break;
      // Diagnostic tools
      case "tech-stack":
        setupTechStack();
        break;
      case "seo-meta":
        setupSeoMeta();
        break;
      case "a11y-audit":
        setupA11yAudit();
        break;
      case "settings":
        setupSettings();
        break;
    }
    showToast(`Enabled: ${tool.replace(/-/g, " ").toUpperCase()}`);
  }
  function deactivateCurrentTool() {
    if (!state.activeTool) return;
    cleanupListeners();
    hideHighlight();
    closeDrawer();
    if (state.rulerCanvas) state.rulerCanvas.style.display = "none";
    if (state.customStyleElement && state.customStyleElement.parentNode) {
      state.customStyleElement.parentNode.removeChild(state.customStyleElement);
      state.customStyleElement = null;
    }
    if (document.body.contentEditable === "true") {
      document.body.contentEditable = "false";
    }
    state.selectedElementForCss = null;
    if (state.selectedElementForMove) {
      state.selectedElementForMove.style.outline = "";
      state.selectedElementForMove = null;
    }
    if (state.shadowRoot) {
      const settingsModal = state.shadowRoot.getElementById("settings-modal-overlay");
      if (settingsModal) settingsModal.style.display = "none";
      const rvOverlay = state.shadowRoot.getElementById("responsive-viewer-overlay");
      if (rvOverlay) rvOverlay.style.display = "none";
    }
    showToast(`Disabled: ${state.activeTool.replace(/-/g, " ").toUpperCase()}`);
    state.activeTool = null;
    updateSidebarActiveBtn();
  }
  function trackListener(target, event, callback, useCapture = false) {
    target.addEventListener(event, callback, useCapture);
    state.activeListeners.push({ target, event, callback, useCapture });
  }
  function cleanupListeners() {
    state.activeListeners.forEach(({ target, event, callback, useCapture }) => {
      target.removeEventListener(event, callback, useCapture);
    });
    state.activeListeners = [];
  }
  function openCommandPalette() {
    const backdrop = document.createElement("div");
    backdrop.className = "cmd-backdrop";
    backdrop.innerHTML = `
      <div class="cmd-box">
        <input type="text" class="cmd-input" id="cmd-search-input" placeholder="Type a tool command (e.g. Ruler, Tech Stack, CSS)..." autofocus>
        <div class="cmd-list" id="cmd-list-slot">
          <!-- Command Items -->
        </div>
      </div>
    `;
    state.shadowRoot.appendChild(backdrop);
    const input = backdrop.querySelector("#cmd-search-input");
    const listSlot = backdrop.querySelector("#cmd-list-slot");
    const commands = [
      { id: "css-inspector", label: "\u{1F50D} CSS Inspector", category: "Inspect" },
      { id: "live-text-editor", label: "\u{1F4DD} Text Editor", category: "Inspect" },
      { id: "fonts-changer", label: "\u{1F524} Font Changer (Pro)", category: "Design" },
      { id: "list-fonts", label: "\u{1F4CB} List Fonts", category: "Design" },
      { id: "color-picker", label: "\u{1F3A8} Color Picker", category: "Design" },
      { id: "color-palette", label: "\u{1F308} Color Palette (Pro)", category: "Design" },
      { id: "move-element", label: "\u{1F5B1}\uFE0F Move Element (Pro)", category: "Design" },
      { id: "delete-element", label: "\u{1F5D1}\uFE0F Delete Element", category: "Inspect" },
      { id: "export-element", label: "\u{1F4E4} Export Element (Pro)", category: "Capture" },
      { id: "extract-images", label: "\u{1F5BC}\uFE0F Extract Images (Pro)", category: "Capture" },
      { id: "page-ruler", label: "\u{1F4CF} Page Ruler (Pro)", category: "Diagnostics" },
      { id: "page-outliner", label: "\u{1F532} Page Outliner", category: "Diagnostics" },
      { id: "image-replacer", label: "\u{1F504} Image Swap (Pro)", category: "Design" },
      { id: "take-screenshot", label: "\u{1F4F8} Screenshot (Pro)", category: "Capture" },
      { id: "tech-stack", label: "\u{1F4BB} Tech Stack Detector", category: "Diagnostics" },
      { id: "seo-meta", label: "\u{1F3F7}\uFE0F SEO Meta Inspector", category: "Diagnostics" },
      { id: "a11y-audit", label: "\u267F Accessibility Audit", category: "Diagnostics" }
    ];
    let activeIndex = 0;
    let filtered = [...commands];
    function drawCommands() {
      let html = "";
      filtered.forEach((cmd, idx) => {
        html += `
          <div class="cmd-item ${idx === activeIndex ? "active" : ""}" data-id="${cmd.id}">
            <span>${cmd.label}</span>
            <span class="cmd-shortcut">${cmd.category}</span>
          </div>
        `;
      });
      listSlot.innerHTML = html || `<div style="padding:16px; text-align:center; font-size:12px; color:var(--text-secondary);">No commands matching query</div>`;
    }
    function triggerActiveCommand() {
      const activeCmd = filtered[activeIndex];
      if (activeCmd) {
        state.shadowRoot.removeChild(backdrop);
        const premiumTools = ["fonts-changer", "color-palette", "move-element", "export-element", "extract-images", "page-ruler", "image-replacer", "take-screenshot"];
        if (premiumTools.includes(activeCmd.id) && !state.isPremium) {
          showPremiumLockedDrawer(activeCmd.id);
          return;
        }
        activateTool(activeCmd.id);
      }
    }
    input.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      filtered = commands.filter((cmd) => cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q));
      activeIndex = 0;
      drawCommands();
    };
    input.onkeydown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % filtered.length;
        drawCommands();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
        drawCommands();
      } else if (e.key === "Enter") {
        e.preventDefault();
        triggerActiveCommand();
      } else if (e.key === "Escape") {
        e.preventDefault();
        state.shadowRoot.removeChild(backdrop);
      }
    };
    listSlot.onclick = (e) => {
      const item = e.target.closest(".cmd-item");
      if (item) {
        const id = item.getAttribute("data-id");
        activeIndex = filtered.findIndex((cmd) => cmd.id === id);
        triggerActiveCommand();
      }
    };
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        state.shadowRoot.removeChild(backdrop);
      }
    };
    drawCommands();
  }
  var init_tool_manager = __esm({
    "src/core/tool-manager.js"() {
      init_state();
      init_hud();
      init_highlight();
      init_drawer();
      init_toast();
      init_css_inspector();
      init_live_text_editor();
      init_fonts_changer();
      init_list_fonts();
      init_color_picker();
      init_color_palette();
      init_extract_images();
      init_move_element();
      init_delete_element();
      init_export_element();
      init_page_ruler();
      init_page_outliner();
      init_image_replacer();
      init_take_screenshot();
      init_responsive_viewer();
      init_settings();
      init_tech_stack();
      init_seo_meta();
      init_a11y_audit();
    }
  });

  // src/features/dashboard.js
  function openDashboardDrawer() {
    const welcomeHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">\u26A1 Welcome to WebDev Pro</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Your premium developer toolbox is fully active. Inspect designs, edit copy, view typography, query technology stacks, and execute visual audits directly on the webpage.
        </p>
      </div>
      <div class="audit-card audit-success" style="margin-top:12px;">
        <div style="font-size: 12px; font-weight: 700; color:#4ade80; margin-bottom: 4px;">\u{1F511} Premium Key: Active</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          All Pro tools are fully unlocked. Licensed under <b>WEBDEVPRO2026</b>.
        </p>
      </div>
      <div style="margin-top: 16px;">
        <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 8px; font-weight:700;">Quick Instructions:</span>
        <p style="font-size: 11px; line-height: 1.5; color: var(--text-secondary); margin: 0;">
          \u2022 Click any tool on the sidebar to launch its diagnostic inspector panel.
          <br>\u2022 Use <b>Cmd+Shift+P</b> (or Ctrl+Shift+P) to open the Command Palette.
          <br>\u2022 Use <b>Cmd+Shift+E</b> to hide/show the vertical toolbar.
          <br>\u2022 Switch sidebar position (Left / Right) using the settings gear button.
        </p>
      </div>
    `;
    openDrawer("WebDev Pro Dashboard", "Premium developer toolbar features", welcomeHTML);
  }
  var init_dashboard = __esm({
    "src/features/dashboard.js"() {
      init_state();
      init_drawer();
      init_hud();
      init_toast();
      init_highlight();
      init_tool_manager();
      init_utils();
    }
  });

  // src/ui/hud.js
  var hud_exports = {};
  __export(hud_exports, {
    applyDrawerPositionClass: () => applyDrawerPositionClass,
    destroyHUD: () => destroyHUD,
    ensureHUD: () => ensureHUD,
    loadPersistentSettings: () => loadPersistentSettings,
    setSidebarPosition: () => setSidebarPosition,
    setSidebarVisible: () => setSidebarVisible,
    setupSidebarEvents: () => setupSidebarEvents,
    toggleSidebarVisibility: () => toggleSidebarVisibility,
    updateSidebarActiveBtn: () => updateSidebarActiveBtn
  });
  function ensureHUD() {
    if (state.hostEl) return;
    state.hostEl = document.createElement("div");
    state.hostEl.id = "super-webdev-hud-host";
    state.hostEl.style.position = "fixed";
    state.hostEl.style.top = "0";
    state.hostEl.style.left = "0";
    state.hostEl.style.width = "0";
    state.hostEl.style.height = "0";
    state.hostEl.style.zIndex = "2147483647";
    document.body.appendChild(state.hostEl);
    state.shadowRoot = state.hostEl.attachShadow({ mode: "open" });
    const svgFilters = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgFilters.style.display = "none";
    svgFilters.innerHTML = `
      <defs>
        <!-- Strong refraction filter (Scale: 22) -->
        <filter id="sdpv2-liquid-refract" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="blurNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurNoise" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        <!-- Soft refraction filter (Scale: 9) -->
        <filter id="sdpv2-liquid-refract-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.025" numOctaves="2" seed="3" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1" result="blurNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurNoise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    `;
    state.shadowRoot.appendChild(svgFilters);
    const style = document.createElement("style");
    style.textContent = `
      :host {
        font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #f7f7fa;
        --bg-main: #0c0c0e;
        --border-color: rgba(255, 255, 255, 0.1);
        --text-primary: #f7f7fa;
        --text-secondary: #9a9aa3;
        --accent-purple: #b8a3fc;
        --accent-indigo: #6366f1;
        --accent-gradient: linear-gradient(135deg, #b8a3fc, #6366f1);
        --accent-emerald: #6ee7a8;
        --accent-rose: #f472b6;
        
        --glass-tint: #1212189e;
        --glass-tint-strong: #1c1c24c7;
        --glass-sheen: linear-gradient(160deg, #ffffff38 0%, #ffffff0a 38%, #fff0 60%, #ffffff0f 100%);
        --glass-edge: 1px solid #ffffff24;
        --glass-spec-top: inset 0 1px 0 #ffffff52;
        --glass-spec-bot: inset 0 -1px 0 #00000038;
        --glass-spec-ring: inset 0 0 0 1px #ffffff0f;
        --glass-blur: 28px;
        --glass-blur-sm: 16px;
        --glass-saturate: 180%;
        --glass-brightness: .85;
        --glass-shadow-sm: 0 2px 8px rgba(0,0,0,0.18), 0 8px 24px -8px rgba(0,0,0,0.35);
        --glass-shadow-md: 0 4px 14px rgba(0,0,0,0.22), 0 16px 40px -12px rgba(0,0,0,0.45);
        --glass-shadow-lg: 0 8px 22px rgba(0,0,0,0.28), 0 32px 80px -20px rgba(0,0,0,0.55);
        
        --sidebar-w: 56px;
        --panel-w: 320px;
        --t: .18s cubic-bezier(.32, .72, 0, 1);
        --t-spr: .32s cubic-bezier(.34, 1.56, .64, 1);
        --t-glide: .42s cubic-bezier(.22, 1, .36, 1);
      }

      /* Custom Webkit scrollbar for panels */
      .custom-scroll::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: #27272a;
        border-radius: 4px;
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background: #3f3f46;
      }

      /* 1. Sidebar Panel Layout */
      .sidebar-panel {
        position: fixed;
        width: var(--sidebar-w);
        max-height: calc(100vh - 32px);
        z-index: 2147483647;
        color: var(--text-primary);
        background: var(--glass-tint);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        border-radius: 28px;
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-spec-ring), var(--glass-shadow-md);
        transition: opacity var(--t-glide), transform var(--t-spr), box-shadow var(--t);
        isolation: isolate;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 8px 6px;
      }

      .sidebar-panel:before {
        content: "";
        border-radius: inherit;
        background: var(--glass-sheen);
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: .85;
        z-index: 0;
        filter: url(#sdpv2-liquid-refract-soft);
        position: absolute;
        inset: 0;
      }

      .sidebar-panel:after {
        content: "";
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(120% 60% at 50% -10%, #ffffff40, #0000 60%);
        position: absolute;
        inset: 0;
      }

      .sidebar-panel > * {
        z-index: 1;
        position: relative;
      }

      /* Position variants */
      .sidebar-right {
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
      }

      .sidebar-right.sidebar-hidden {
        transform: translate(25px, -50%) scale(.94);
        opacity: 0;
        pointer-events: none;
      }

      .sidebar-left {
        top: 50%;
        left: 16px;
        transform: translateY(-50%);
      }

      .sidebar-left.sidebar-hidden {
        transform: translate(-25px, -50%) scale(.94);
        opacity: 0;
        pointer-events: none;
      }

      /* Pinned Scrollable Middle section */
      .sidebar-pinned {
        scrollbar-width: none;
        flex-direction: column;
        flex: auto;
        gap: 6px;
        min-width: 0;
        min-height: 0;
        display: flex;
        overflow: hidden auto;
        -webkit-mask-image: linear-gradient(#0000 0, #000 10px calc(100% - 10px), #0000 100%);
        mask-image: linear-gradient(#0000 0, #000 10px calc(100% - 10px), #0000 100%);
        width: 100%;
        align-items: center;
      }
      
      .sidebar-pinned::-webkit-scrollbar {
        display: none;
      }

      /* Sidebar Buttons styling with liquid hover */
      .sidebar-btn {
        border: none;
        border-radius: 9999px;
        width: 42px;
        height: 42px;
        color: var(--text-secondary);
        background: transparent;
        cursor: pointer;
        transition: color var(--t), transform var(--t-spr), background var(--t);
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        display: flex;
        position: relative;
      }

      .sidebar-btn:before {
        content: "";
        border-radius: inherit;
        box-shadow: none;
        transition: background var(--t), box-shadow var(--t-spr), transform var(--t-spr);
        pointer-events: none;
        z-index: 0;
        background: transparent;
        position: absolute;
        inset: 4px;
      }

      .sidebar-btn > * {
        z-index: 1;
        position: relative;
      }

      .sidebar-btn:hover {
        color: var(--text-primary);
        transform: scale(1.08);
      }

      .sidebar-btn:hover:before {
        background: var(--glass-tint-strong);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), inset 0 0 0 1px rgba(255,255,255,0.18);
      }

      .sidebar-btn.active-tool {
        color: var(--accent-purple);
      }

      .sidebar-btn.active-tool:before {
        background: radial-gradient(120% 80% at 50% 0%, var(--accent-indigo), rgba(99, 102, 241, 0.2) 70%);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
      }

      .sidebar-divider {
        background: linear-gradient(90deg, #0000, rgba(255,255,255,0.12) 30% 70%, #0000);
        height: 1px;
        width: calc(100% - 12px);
        margin: 4px 0;
        flex-shrink: 0;
      }

      /* Hover Tooltips sliding */
      .sidebar-tip {
        background: var(--glass-tint-strong);
        -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        color: var(--text-primary);
        border-radius: 12px;
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-shadow-sm);
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--t), transform var(--t-spr);
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        position: absolute;
        top: 50%;
      }

      .sidebar-right .sidebar-tip {
        right: calc(100% + 14px);
        transform: translateY(-50%) translate(6px);
      }

      .sidebar-right .sidebar-btn:hover .sidebar-tip {
        opacity: 1;
        transform: translateY(-50%) translate(0);
      }

      .sidebar-left .sidebar-tip {
        left: calc(100% + 14px);
        transform: translateY(-50%) translate(-6px);
      }

      .sidebar-left .sidebar-btn:hover .sidebar-tip {
        opacity: 1;
        transform: translateY(-50%) translate(0);
      }

      /* 2. Floating Reopen Edge Tab */
      .reopen-tab {
        position: fixed;
        z-index: 2147483647;
        color: var(--text-secondary);
        background: var(--glass-tint);
        -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-shadow-sm);
        cursor: pointer;
        transition: all var(--t-spr);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 48px;
      }

      .reopen-tab:before {
        content: "";
        border-radius: inherit;
        background: var(--glass-sheen);
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: .85;
        z-index: 0;
        filter: url(#sdpv2-liquid-refract-soft);
        position: absolute;
        inset: 0;
      }

      .reopen-tab-right {
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 12px 0 0 12px;
        border-right: none;
      }

      .reopen-tab-right:hover {
        width: 32px;
        color: var(--text-primary);
      }

      .reopen-tab-left {
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 0 12px 12px 0;
        border-left: none;
      }

      .reopen-tab-left:hover {
        width: 32px;
        color: var(--text-primary);
      }

      /* 3. Panel Drawer Container */
      .drawer-panel {
        position: fixed;
        width: var(--panel-w);
        height: calc(100vh - 32px);
        background: var(--glass-tint-strong);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-shadow-lg);
        border-radius: 20px;
        transition: all var(--t-glide);
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        opacity: 0;
        pointer-events: none;
      }

      .drawer-panel:before {
        content: "";
        border-radius: inherit;
        background: var(--glass-sheen);
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: .85;
        z-index: 0;
        filter: url(#sdpv2-liquid-refract-soft);
        position: absolute;
        inset: 0;
      }

      .drawer-panel > * {
        z-index: 1;
        position: relative;
      }

      /* Drawer positioning \u2014 drawer is sibling of sidebar, not child, so use standalone classes */
      .drawer-panel.visible {
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      .drawer-panel-right {
        top: 16px;
        right: calc(var(--sidebar-w) + 26px);
        transform: translateX(15px);
      }

      .drawer-panel-right.visible {
        transform: translateX(0) !important;
      }

      .drawer-panel-left {
        top: 16px;
        left: calc(var(--sidebar-w) + 26px);
        transform: translateX(-15px);
      }

      .drawer-panel-left.visible {
        transform: translateX(0) !important;
      }

      .drawer-header {
        padding: 18px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .drawer-title {
        font-size: 16px;
        font-weight: 700;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
      }

      .drawer-subtitle {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .drawer-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .drawer-close:hover {
        color: var(--text-primary);
      }

      .drawer-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }

      /* Highlight Overlays */
      .highlight-overlay {
        position: fixed;
        border: 1px solid #ff4a4a; /* default red/pink */
        background-color: rgba(255, 74, 74, 0.05);
        pointer-events: none;
        z-index: 2147483640;
        display: none;
        border-radius: 4px;
        box-shadow: 0 0 8px rgba(255, 74, 74, 0.2);
        transition: border-color 0.1s, background-color 0.1s;
      }

      .highlight-guide-vl, .highlight-guide-vr, .highlight-guide-ht, .highlight-guide-hb {
        display: none;
        position: absolute;
        pointer-events: none;
      }

      .highlight-overlay.show-guides .highlight-guide-vl {
        display: block;
        top: -10000px;
        bottom: -10000px;
        left: -1px;
        width: 1px;
        border-left: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-overlay.show-guides .highlight-guide-vr {
        display: block;
        top: -10000px;
        bottom: -10000px;
        right: -1px;
        width: 1px;
        border-left: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-overlay.show-guides .highlight-guide-ht {
        display: block;
        left: -10000px;
        right: -10000px;
        top: -1px;
        height: 1px;
        border-top: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-overlay.show-guides .highlight-guide-hb {
        display: block;
        left: -10000px;
        right: -10000px;
        bottom: -1px;
        height: 1px;
        border-top: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-label {
        position: fixed;
        background-color: var(--accent-purple);
        color: #0c0c0e;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 700;
        border-radius: 3px;
        pointer-events: none;
        z-index: 2147483641;
        display: none;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      /* CSS Inspector Hover Tooltip Card */
      .inspector-tooltip-card {
        position: fixed;
        display: none;
        z-index: 2147483645;
        width: 290px;
        background: rgba(11, 15, 25, 0.96);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        backdrop-filter: blur(14px) saturate(140%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        color: #f7f7fa;
        font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        overflow: hidden;
        pointer-events: none;
        font-size: 11px;
      }

      .tooltip-hierarchy {
        background: rgba(0, 0, 0, 0.25);
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-family: monospace;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.45);
        line-height: 1.4;
        word-break: break-all;
      }

      .tooltip-hierarchy-active {
        color: #4ade80; /* active green */
        font-weight: bold;
      }

      .tooltip-meta {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .tooltip-tag {
        font-size: 13px;
        font-weight: 700;
        color: #4ade80;
        font-family: monospace;
        margin-bottom: 4px;
      }

      .tooltip-meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.65);
        margin-top: 3px;
      }

      .tooltip-meta-row svg {
        color: rgba(255, 255, 255, 0.4);
      }

      .tooltip-css-block {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-family: monospace;
        font-size: 11px;
        max-height: 180px;
        overflow-y: auto;
        line-height: 1.45;
        scrollbar-width: none; /* Hide scrollbars for tooltips */
      }

      .tooltip-css-block::-webkit-scrollbar {
        display: none;
      }

      .css-p-row {
        display: flex;
        flex-wrap: wrap;
        padding: 2px 0;
      }

      .css-p-name {
        color: #38bdf8; /* light blue */
        margin-right: 4px;
      }

      .css-p-value {
        color: #f7f7fa;
        display: flex;
        align-items: center;
      }

      .css-p-swatch {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-right: 5px;
        box-shadow: 0 0 1px rgba(0,0,0,0.5);
      }

      .tooltip-footer {
        padding: 6px 12px;
        font-size: 9px;
        color: rgba(255, 255, 255, 0.35);
        background: rgba(0, 0, 0, 0.1);
      }

      .ruler-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 2147483639;
        display: none;
      }

      /* Command Palette Styles */
      .cmd-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 2147483647;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
        animation: fadeIn 0.15s ease-out;
      }

      .cmd-box {
        width: 480px;
        background: rgba(15, 15, 20, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .cmd-input {
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding: 16px;
        color: #fff;
        font-size: 14px;
        outline: none;
        font-family: inherit;
        box-sizing: border-box;
      }

      .cmd-list {
        max-height: 280px;
        overflow-y: auto;
        padding: 8px;
      }

      .cmd-item {
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-secondary);
        transition: all var(--t);
      }

      .cmd-item.active {
        background: rgba(184, 163, 252, 0.15);
        color: #f7f7fa;
      }

      .cmd-shortcut {
        font-size: 10px;
        font-family: monospace;
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        color: var(--text-secondary);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideDown {
        from { transform: translateY(-10px); }
        to { transform: translateY(0); }
      }

      /* Toast Notify */
      .hud-toast {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid var(--accent-purple);
        box-shadow: var(--glass-shadow-md);
        padding: 10px 20px;
        border-radius: 12px;
        color: #f7f7fa;
        font-size: 12px;
        font-weight: 600;
        z-index: 2147483647;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hud-toast.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* Audit Cards & Elements */
      .audit-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
      }
      
      .audit-card-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .audit-card-desc {
        font-size: 11px;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .audit-warning {
        border-left: 3px solid var(--accent-rose);
        background: rgba(244, 114, 182, 0.05);
      }

      .audit-success {
        border-left: 3px solid var(--accent-emerald);
        background: rgba(110, 231, 168, 0.05);
      }

      /* Box Model specs */
      .box-model-container {
        display: flex;
        justify-content: center;
        margin-top: 10px;
        font-family: monospace;
        font-size: 9px;
      }

      .box-model-layer {
        border: 1px dashed rgba(255, 255, 255, 0.2);
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        background: rgba(255,255,255,0.01);
      }

      .box-model-label {
        position: absolute;
        top: 2px;
        left: 4px;
        color: var(--text-secondary);
        font-size: 8px;
        text-transform: uppercase;
      }

      .box-model-margin { background: rgba(249, 115, 22, 0.05); border-color: rgba(249, 115, 22, 0.3); }
      .box-model-border { background: rgba(234, 179, 8, 0.05); border-color: rgba(234, 179, 8, 0.3); }
      .box-model-padding { background: rgba(110, 231, 168, 0.05); border-color: rgba(110, 231, 168, 0.3); }
      .box-model-content { background: rgba(184, 163, 252, 0.1); border-color: rgba(184, 163, 252, 0.4); padding: 8px 16px; font-weight: 700; color: #f7f7fa; }

      .inspector-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 16px;
      }

      .inspector-tab {
        flex: 1;
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 8px 0;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        border-bottom: 2px solid transparent;
        font-family: inherit;
      }

      .inspector-tab.active {
        color: var(--text-primary);
        border-bottom-color: var(--accent-purple);
      }

      .css-property-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        font-size: 11px;
        font-family: monospace;
      }

      .css-property-name {
        color: var(--accent-purple);
      }

      .css-property-value {
        color: var(--accent-emerald);
        text-align: right;
        max-width: 60%;
        word-break: break-all;
      }

      .css-editor-textarea {
        width: 100%;
        height: 150px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        resize: vertical;
        box-sizing: border-box;
      }

      /* ==========================================
       * INTERACTIVE CSS EDITOR DRAWER PANELS
       * ========================================== */
      .inspector-drawer-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: #f7f7fa;
      }

      .inspector-meta-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .inspector-meta-tag {
        font-size: 15px;
        font-weight: 700;
        color: #4ade80; /* Tag color green/purple */
        font-family: monospace;
      }

      .inspector-meta-right {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 11px;
      }

      .inspector-meta-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        transition: color 0.15s;
      }

      .inspector-meta-btn:hover {
        color: #f7f7fa;
      }

      .inspector-selector-bar {
        width: 100%;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.85);
        font-family: monospace;
        font-size: 11px;
        padding: 8px 12px;
        margin: 10px 0 14px 0;
        box-sizing: border-box;
        outline: none;
      }

      /* Row of 9 filter tabs */
      .inspector-filter-tabs {
        display: flex;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        padding: 3px;
        margin-bottom: 14px;
        gap: 2px;
      }

      .inspector-filter-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.45);
        border-radius: 5px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12.5px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .inspector-filter-btn:hover {
        color: #f7f7fa;
        background: rgba(255, 255, 255, 0.04);
      }

      .inspector-filter-btn.active {
        color: #b8a3fc;
        background: rgba(184, 163, 252, 0.15);
      }

      /* Properties rows */
      .inspector-properties-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 240px;
        overflow-y: auto;
        padding-right: 4px;
        margin-bottom: 12px;
      }

      .inspector-prop-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .inspector-prop-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .prop-eye-toggle {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        font-size: 11px;
        transition: color 0.15s;
      }

      .prop-eye-toggle.active {
        color: rgba(255, 255, 255, 0.55);
      }

      .prop-eye-toggle:hover {
        color: #f7f7fa;
      }

      .prop-label-name {
        font-family: monospace;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .inspector-prop-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1.5;
        justify-content: flex-end;
      }

      .prop-input-wrap {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 5px;
        padding: 3px 6px;
        width: 100%;
        max-width: 160px;
        box-sizing: border-box;
      }

      .prop-input-wrap input[type="text"] {
        background: none;
        border: none;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 11px;
        width: 100%;
        outline: none;
      }

      .prop-input-wrap select {
        background: transparent;
        border: none;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 11px;
        width: 100%;
        outline: none;
        cursor: pointer;
      }

      .prop-input-wrap select option {
        background: #121218;
        color: #f7f7fa;
      }

      /* Custom range slider */
      .prop-slider-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        max-width: 160px;
      }

      .prop-slider {
        -webkit-appearance: none;
        width: 65px;
        height: 3px;
        border-radius: 1.5px;
        background: rgba(255, 255, 255, 0.12);
        outline: none;
      }

      .prop-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #b8a3fc;
        cursor: pointer;
        transition: transform 0.1s;
      }

      .prop-slider::-webkit-slider-thumb:hover {
        transform: scale(1.3);
      }

      .prop-slider-num-box {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 4px;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 10px;
        width: 25px;
        text-align: center;
        padding: 2px 0;
        outline: none;
      }

      .prop-slider-unit {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
        font-family: monospace;
      }

      .prop-color-picker-swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-right: 4px;
        flex-shrink: 0;
      }

      .add-prop-btn {
        background: none;
        border: none;
        color: #b8a3fc;
        font-size: 11px;
        cursor: pointer;
        padding: 4px 0;
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
        margin-top: 2px;
      }

      .add-prop-btn:hover {
        text-decoration: underline;
      }

      /* Raw CSS block pane */
      .inspector-css-pane {
        margin-top: 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 140px;
      }

      .inspector-css-pane-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .inspector-css-pane-title {
        font-size: 10.5px;
        font-family: monospace;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
      }

      .inspector-css-pane-actions {
        display: flex;
        gap: 6px;
      }

      .inspector-css-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        color: rgba(255, 255, 255, 0.65);
        font-family: inherit;
        font-size: 9.5px;
        padding: 2px 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s;
      }

      .inspector-css-btn:hover {
        color: #f7f7fa;
        background: rgba(255, 255, 255, 0.07);
      }

      .inspector-css-code-box {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 6px;
        padding: 10px;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.45;
        overflow-y: auto;
        flex: 1;
        white-space: pre-wrap;
        color: #f7f7fa;
      }

      .inspector-css-code-box .css-p-swatch {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-right: 5px;
        vertical-align: middle;
        box-shadow: 0 0 1px rgba(0,0,0,0.5);
      }

      /* Inspector Footer */
      .inspector-drawer-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        margin-top: 10px;
      }

      .inspector-footer-key {
        font-size: 9px;
        font-family: monospace;
        background: rgba(255, 255, 255, 0.04);
        padding: 1px 5px;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.35);
      }

      /* Swatches & grid elements */
      .fonts-grid, .color-swatches-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .font-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .font-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(184, 163, 252, 0.3);
      }

      .font-card-name {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .font-card-preview {
        font-size: 10px;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .swatch-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .swatch-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-2px);
      }

      .swatch-color {
        width: 100%;
        height: 40px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .swatch-text {
        font-size: 10px;
        font-weight: 600;
        font-family: monospace;
      }

      .images-gallery {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .img-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .img-thumb-container {
        width: 100%;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.25);
        border-radius: 4px;
        overflow: hidden;
      }

      .img-thumb {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .img-meta {
        font-size: 9px;
        color: var(--text-secondary);
        display: flex;
        justify-content: space-between;
      }

      .img-actions {
        display: flex;
        gap: 4px;
      }

      .img-actions button {
        flex: 1;
        padding: 4px 0;
        font-size: 9px;
        font-weight: 600;
      }

      .hud-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        padding: 6px 12px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: inherit;
      }

      .hud-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      .hud-btn.primary {
        background: var(--accent-gradient);
        border: none;
        font-weight: 600;
      }
      
      .hud-btn.primary:hover {
        opacity: 0.9;
      }

      .hud-btn.danger {
        background: rgba(244, 114, 182, 0.15);
        color: var(--accent-rose);
        border-color: rgba(244, 114, 182, 0.2);
      }

      .hud-btn.danger:hover {
        background: rgba(244, 114, 182, 0.25);
      }

      .hud-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Screenshot Preview Modal */
      .screenshot-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
      }

      .screenshot-content {
        background: #0c0c0e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 20px;
        max-width: 80%;
        max-height: 85%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-shadow: var(--glass-shadow-lg);
      }

      .screenshot-img-container {
        overflow: auto;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.05);
        background: #000;
        max-height: 50vh;
        display: flex;
        justify-content: center;
      }

      .screenshot-img-container img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
      }

      .screenshot-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      /* Visual SEO link mock preview */
      .seo-preview-box {
        background: #ffffff;
        color: #1a0dab;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #dadce0;
        margin-top: 10px;
        font-family: Arial, sans-serif;
      }

      .seo-preview-url {
        color: #202124;
        font-size: 12px;
        margin-bottom: 4px;
        word-break: break-all;
      }

      .seo-preview-title {
        font-size: 19px;
        margin: 0 0 4px 0;
        cursor: pointer;
      }

      .seo-preview-desc {
        color: #4d5156;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
      }

      /* History items logger inside drawer */
      .drawer-history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 11px;
      }

      .drawer-history-name {
        color: var(--text-secondary);
        font-family: monospace;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 180px;
        overflow: hidden;
      }
    `;
    state.shadowRoot.appendChild(style);
    state.reopenTabEl = document.createElement("div");
    state.reopenTabEl.className = "reopen-tab reopen-tab-right";
    state.reopenTabEl.style.display = "none";
    state.reopenTabEl.innerHTML = `<span>\u25C0</span>`;
    state.shadowRoot.appendChild(state.reopenTabEl);
    state.sidebarEl = document.createElement("div");
    state.sidebarEl.className = "sidebar-panel sidebar-right";
    state.sidebarEl.innerHTML = `
      <!-- Top header branding -->
      <button class="sidebar-btn" id="sbtn-dashboard" title="SuperDev Pro">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <div class="sidebar-tip">SuperDev Pro</div>
      </button>
      
      <div class="sidebar-divider"></div>
      
      <!-- Pinned Tools scroll area -->
      <div class="sidebar-pinned custom-scroll">
        <button class="sidebar-btn" id="sbtn-css-inspector" title="CSS Inspector">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div class="sidebar-tip">CSS Inspector</div>
        </button>
        <button class="sidebar-btn" id="sbtn-live-text-editor" title="Text Editor">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <div class="sidebar-tip">Text Editor</div>
        </button>
        <button class="sidebar-btn" id="sbtn-fonts-changer" title="Font Changer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
          <div class="sidebar-tip">Font Changer</div>
        </button>
        <button class="sidebar-btn" id="sbtn-list-fonts" title="List Fonts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          <div class="sidebar-tip">List Fonts</div>
        </button>
        <button class="sidebar-btn" id="sbtn-color-picker" title="Color Picker">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><circle cx="15.5" cy="10" r="1.5" fill="currentColor"/></svg>
          <div class="sidebar-tip">Color Picker</div>
        </button>
        <button class="sidebar-btn" id="sbtn-color-palette" title="Color Palette">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"></circle><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line></svg>
          <div class="sidebar-tip">Color Palette</div>
        </button>
        <button class="sidebar-btn" id="sbtn-move-element" title="Move Element">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
          <div class="sidebar-tip">Move Element</div>
        </button>
        <button class="sidebar-btn" id="sbtn-delete-element" title="Delete Element">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
          <div class="sidebar-tip">Delete Element</div>
        </button>
        <button class="sidebar-btn" id="sbtn-export-element" title="Export Element">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <div class="sidebar-tip">Export Element</div>
        </button>
        <button class="sidebar-btn" id="sbtn-extract-images" title="Extract Images">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <div class="sidebar-tip">Extract Images</div>
        </button>
        <button class="sidebar-btn" id="sbtn-page-ruler" title="Page Ruler">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M2 6l4 6-4 6M22 6l-4 6 4 6"></path></svg>
          <div class="sidebar-tip">Page Ruler</div>
        </button>
        <button class="sidebar-btn" id="sbtn-page-outliner" title="Outliner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
          <div class="sidebar-tip">Outliner</div>
        </button>
        <button class="sidebar-btn" id="sbtn-image-replacer" title="Image Swap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
          <div class="sidebar-tip">Image Swap</div>
        </button>
        <button class="sidebar-btn" id="sbtn-take-screenshot" title="Screenshot">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <div class="sidebar-tip">Screenshot</div>
        </button>
        <button class="sidebar-btn" id="sbtn-responsive-viewer" title="Responsive Viewer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          <div class="sidebar-tip">Responsive Viewer</div>
        </button>
        
        <div class="sidebar-divider"></div>
        
        <!-- Audits & Widgets -->
        <button class="sidebar-btn" id="sbtn-tech-stack" title="Tech Stack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <div class="sidebar-tip">Tech Stack</div>
        </button>
        <button class="sidebar-btn" id="sbtn-seo-meta" title="SEO Meta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <div class="sidebar-tip">SEO Meta</div>
        </button>
        <button class="sidebar-btn" id="sbtn-a11y-audit" title="A11y Audit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M6 20v-2a6 6 0 0 1 12 0v2"></path></svg>
          <div class="sidebar-tip">A11y Audit</div>
        </button>
      </div>
      
      <div class="sidebar-divider"></div>
      
      <!-- Bottom static actions -->
      <button class="sidebar-btn" id="sbtn-cmd-palette" title="Command Palette">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
        <div class="sidebar-tip">Command Palette (Cmd+Shift+P)</div>
      </button>
      <button class="sidebar-btn" id="sbtn-settings-position" title="Dock Position">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path></svg>
        <div class="sidebar-tip">Dock Position (Left/Right)</div>
      </button>
      <button class="sidebar-btn" id="sbtn-settings-drawer" title="Settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <div class="sidebar-tip">Settings</div>
      </button>
      <button class="sidebar-btn" id="sbtn-power" title="Turn Off WebDev Pro" style="color: var(--accent-rose);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        <div class="sidebar-tip">Turn Off WebDev Pro</div>
      </button>
      <button class="sidebar-btn" id="sbtn-collapse" title="Hide Sidebar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <div class="sidebar-tip">Hide Sidebar (Cmd+Shift+E)</div>
      </button>
    `;
    state.shadowRoot.appendChild(state.sidebarEl);
    state.drawerEl = document.createElement("div");
    state.drawerEl.className = "drawer-panel drawer-panel-right";
    state.drawerEl.innerHTML = `
      <div class="drawer-header">
        <div>
          <h3 class="drawer-title" id="drawer-title-slot">Tool Details</h3>
          <div class="drawer-subtitle" id="drawer-sub-slot">Select a tool to display diagnostics</div>
        </div>
        <button class="drawer-close" id="drawer-close-btn">&times;</button>
      </div>
      <div class="drawer-content custom-scroll" id="drawer-content-slot">
        <!-- Render content dynamic templates -->
      </div>
    `;
    state.shadowRoot.appendChild(state.drawerEl);
    state.highlightOverlay = document.createElement("div");
    state.highlightOverlay.className = "highlight-overlay";
    ["vl", "vr", "ht", "hb"].forEach((g) => {
      const guide = document.createElement("div");
      guide.className = `highlight-guide-${g}`;
      state.highlightOverlay.appendChild(guide);
    });
    state.shadowRoot.appendChild(state.highlightOverlay);
    state.highlightLabel = document.createElement("div");
    state.highlightLabel.className = "highlight-label";
    state.shadowRoot.appendChild(state.highlightLabel);
    state.inspectorTooltip = document.createElement("div");
    state.inspectorTooltip.className = "inspector-tooltip-card";
    state.shadowRoot.appendChild(state.inspectorTooltip);
    state.rulerCanvas = document.createElement("canvas");
    state.rulerCanvas.className = "ruler-canvas";
    state.shadowRoot.appendChild(state.rulerCanvas);
    state.toastEl = document.createElement("div");
    state.toastEl.className = "hud-toast";
    state.toastEl.innerHTML = `<span>\u2714\uFE0F</span> <span id="toast-text-slot">Action Completed</span>`;
    state.shadowRoot.appendChild(state.toastEl);
    setupSidebarEvents();
    loadPersistentSettings();
  }
  function loadPersistentSettings() {
    chrome.storage.local.get(["sidebarPosition", "premium"], (res) => {
      state.isPremium = res.premium !== false;
      if (res.sidebarPosition === "left") {
        setSidebarPosition("left");
      } else {
        setSidebarPosition("right");
      }
    });
  }
  function applyDrawerPositionClass(pos) {
    if (!state.drawerEl) return;
    if (pos === "left") {
      state.drawerEl.classList.add("drawer-panel-left");
      state.drawerEl.classList.remove("drawer-panel-right");
    } else {
      state.drawerEl.classList.add("drawer-panel-right");
      state.drawerEl.classList.remove("drawer-panel-left");
    }
  }
  function setSidebarPosition(pos) {
    state.sidebarPosition = pos;
    chrome.storage.local.set({ sidebarPosition: pos });
    if (pos === "left") {
      state.sidebarEl.classList.add("sidebar-left");
      state.sidebarEl.classList.remove("sidebar-right");
      state.reopenTabEl.className = "reopen-tab reopen-tab-left";
      state.reopenTabEl.innerHTML = `<span>\u25B6</span>`;
    } else {
      state.sidebarEl.classList.add("sidebar-right");
      state.sidebarEl.classList.remove("sidebar-left");
      state.reopenTabEl.className = "reopen-tab reopen-tab-right";
      state.reopenTabEl.innerHTML = `<span>\u25C0</span>`;
    }
    applyDrawerPositionClass(pos);
    closeDrawer();
  }
  function toggleSidebarVisibility() {
    ensureHUD();
    setSidebarVisible(!state.sidebarVisible);
  }
  function setSidebarVisible(visible) {
    state.sidebarVisible = visible;
    if (visible) {
      state.sidebarEl.classList.remove("sidebar-hidden");
      state.reopenTabEl.style.display = "none";
    } else {
      state.sidebarEl.classList.add("sidebar-hidden");
      state.reopenTabEl.style.display = "flex";
      closeDrawer();
    }
  }
  function setupSidebarEvents() {
    state.reopenTabEl.addEventListener("click", () => {
      setSidebarVisible(true);
    });
    state.shadowRoot.getElementById("sbtn-collapse").addEventListener("click", () => {
      setSidebarVisible(false);
    });
    state.shadowRoot.getElementById("sbtn-power").addEventListener("click", () => {
      destroyHUD();
    });
    state.shadowRoot.getElementById("sbtn-settings-position").addEventListener("click", () => {
      const targetPos = state.sidebarPosition === "right" ? "left" : "right";
      setSidebarPosition(targetPos);
      showToast(`Docked position: ${targetPos.toUpperCase()}`);
    });
    state.shadowRoot.getElementById("drawer-close-btn").addEventListener("click", () => {
      deactivateCurrentTool();
    });
    state.shadowRoot.getElementById("sbtn-dashboard").addEventListener("click", () => {
      openDashboardDrawer();
    });
    state.shadowRoot.getElementById("sbtn-cmd-palette").addEventListener("click", () => {
      openCommandPalette();
    });
    const tools = [
      { id: "css-inspector", btnId: "sbtn-css-inspector" },
      { id: "live-text-editor", btnId: "sbtn-live-text-editor" },
      { id: "fonts-changer", btnId: "sbtn-fonts-changer" },
      { id: "list-fonts", btnId: "sbtn-list-fonts" },
      { id: "color-picker", btnId: "sbtn-color-picker" },
      { id: "color-palette", btnId: "sbtn-color-palette" },
      { id: "move-element", btnId: "sbtn-move-element" },
      { id: "delete-element", btnId: "sbtn-delete-element" },
      { id: "export-element", btnId: "sbtn-export-element" },
      { id: "extract-images", btnId: "sbtn-extract-images" },
      { id: "page-ruler", btnId: "sbtn-page-ruler" },
      { id: "page-outliner", btnId: "sbtn-page-outliner" },
      { id: "image-replacer", btnId: "sbtn-image-replacer" },
      { id: "take-screenshot", btnId: "sbtn-take-screenshot" },
      { id: "responsive-viewer", btnId: "sbtn-responsive-viewer" },
      // New diagnostic tabs
      { id: "tech-stack", btnId: "sbtn-tech-stack" },
      { id: "seo-meta", btnId: "sbtn-seo-meta" },
      { id: "a11y-audit", btnId: "sbtn-a11y-audit" },
      { id: "settings", btnId: "sbtn-settings-drawer" }
    ];
    tools.forEach((tool) => {
      state.shadowRoot.getElementById(tool.btnId).addEventListener("click", () => {
        const premiumTools = ["fonts-changer", "color-palette", "move-element", "export-element", "extract-images", "page-ruler", "image-replacer", "take-screenshot"];
        if (premiumTools.includes(tool.id) && !state.isPremium) {
          deactivateCurrentTool();
          showPremiumLockedDrawer(tool.id);
          state.activeTool = tool.id;
          updateSidebarActiveBtn();
          return;
        }
        if (state.activeTool === tool.id) {
          const isOverlayTool = ["settings", "responsive-viewer"].includes(tool.id);
          if (!isOverlayTool && state.drawerEl && !state.drawerEl.classList.contains("visible")) {
            state.drawerEl.classList.add("visible");
          } else {
            deactivateCurrentTool();
          }
        } else {
          activateTool(tool.id);
        }
      });
    });
  }
  function destroyHUD() {
    deactivateCurrentTool();
    if (state.hostEl) {
      state.hostEl.remove();
      state.hostEl = null;
      state.shadowRoot = null;
      state.sidebarEl = null;
      state.drawerEl = null;
      state.toastEl = null;
      state.reopenTabEl = null;
      state.highlightOverlay = null;
      state.highlightLabel = null;
      state.inspectorTooltip = null;
      state.rulerCanvas = null;
      state.sidebarVisible = false;
    }
  }
  function updateSidebarActiveBtn() {
    if (!state.sidebarEl) return;
    state.sidebarEl.querySelectorAll(".sidebar-btn").forEach((btn) => {
      btn.classList.remove("active-tool");
    });
    if (state.activeTool) {
      const activeBtn = state.shadowRoot.getElementById(`sbtn-${state.activeTool}`);
      if (activeBtn) activeBtn.classList.add("active-tool");
    }
  }
  var init_hud = __esm({
    "src/ui/hud.js"() {
      init_state();
      init_tool_manager();
      init_drawer();
      init_dashboard();
      init_toast();
    }
  });

  // src/content.js
  init_state();
  init_hud();
  init_tool_manager();
  ensureHUD();
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      toggleSidebarVisibility();
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      ensureHUD();
      openCommandPalette();
    }
  });
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "toggle-sidebar" || req.action === "toggleSidebarShortcut") {
      toggleSidebarVisibility();
      sendResponse({ status: "success" });
      return true;
    }
    if (req.action === "activate-tool") {
      ensureHUD();
      if (!state.sidebarVisible) {
        setSidebarVisible(true);
      }
      activateTool(req.tool);
      sendResponse({ status: "success" });
      return true;
    }
    if (req.action === "getActiveTool") {
      sendResponse({ activeTool: state.activeTool });
      return true;
    }
    if (req.action === "toggleTool") {
      state.isPremium = !!req.premium;
      ensureHUD();
      if (!state.sidebarVisible) {
        setSidebarVisible(true);
      }
      if (state.activeTool === req.tool) {
        deactivateCurrentTool();
        sendResponse({ status: "success", isActive: false });
      } else {
        activateTool(req.tool);
        sendResponse({ status: "success", isActive: true });
      }
      return true;
    }
  });
})();
