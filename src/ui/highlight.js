import { state } from '../state.js';
import { ensureHUD } from './hud.js';
import { formatElementSelector, getFirstFontFamily, extractColor } from '../utils.js';


export   function showHighlight(rect, labelText, customColor = null) {
    ensureHUD();
    state.highlightOverlay.style.top = `${rect.top}px`;
    state.highlightOverlay.style.left = `${rect.left}px`;
    state.highlightOverlay.style.width = `${rect.width}px`;
    state.highlightOverlay.style.height = `${rect.height}px`;
    state.highlightOverlay.style.display = "block";

    if (customColor) {
      state.highlightOverlay.style.borderColor = customColor;
      // Build a translucent fill that works for any color format. A 6-digit
      // hex (#rrggbb) can take an alpha suffix; everything else (var(), rgb(),
      // named, 3-digit hex) falls back to a safe translucent tint.
      if (/^#[0-9a-fA-F]{6}$/.test(customColor)) {
        state.highlightOverlay.style.backgroundColor = `${customColor}1a`;
      } else {
        state.highlightOverlay.style.backgroundColor = "rgba(184, 163, 252, 0.08)";
      }
      state.highlightLabel.style.backgroundColor = customColor;
    } else {
      // If CSS Inspector is active, use a nice neon green, otherwise purple
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

  // Helper check element inside Shadow Root

export   function isHUDElement(el) {
    if (!el || !state.hostEl) return false;
    if (el === state.hostEl || state.hostEl.contains(el)) return true;
    return false;
  }


export   function hideHighlight() {
    if (state.highlightOverlay) {
      state.highlightOverlay.style.display = "none";
      state.highlightOverlay.classList.remove("show-guides");
    }
    if (state.highlightLabel) {
      state.highlightLabel.style.display = "none";
    }
    if (state.inspectorTooltip) {
      state.inspectorTooltip.style.display = "none";
    }
  }


export   function updateInspectorTooltip(element, clientX, clientY) {
    if (!state.inspectorTooltip) return;

    const computed = window.getComputedStyle(element);

    // 1. Breadcrumbs
    const parentSel = element.parentElement ? formatElementSelector(element.parentElement) : "";
    const activeSel = formatElementSelector(element);
    const childSel = element.firstElementChild ? formatElementSelector(element.firstElementChild) : "";

    let hierarchyHTML = "";
    if (parentSel) {
      hierarchyHTML += `<div style="margin-bottom: 2px;">${parentSel}</div>`;
      hierarchyHTML += `<div class="tooltip-hierarchy-active">└ ${activeSel}</div>`;
    } else {
      hierarchyHTML += `<div class="tooltip-hierarchy-active">${activeSel}</div>`;
    }
    if (childSel) {
      hierarchyHTML += `<div style="margin-top: 2px; color: rgba(255,255,255,0.3);">└ ${childSel}</div>`;
    }

    // 2. Tag Name
    const tagName = element.tagName.toLowerCase();

    // 3. Dimensions
    const rect = element.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const dimsHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:5px; opacity:0.75;">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
      <span>${width} × ${height}</span>
    `;

    // 4. Font Details
    const firstFont = getFirstFontFamily(computed.fontFamily);
    const fontSize = computed.fontSize;
    const fontWeight = computed.fontWeight;
    const fontHTML = `
      <span style="font-family: serif; font-weight: 800; font-size: 11px; margin-right: 6px; color: rgba(255, 255, 255, 0.45); display: inline-block;">A</span>
      <span>${firstFont} ${fontSize} · ${fontWeight}</span>
    `;

    // 5. Relevant CSS Properties Block
    const propsToShow = [];
    const isZeroOrNone = (val) => !val || val === "0px" || val === "none" || val === "0px 0px" || val === "0px 0px 0px 0px" || val === "normal";

    // color
    propsToShow.push({ name: "color", value: computed.color });

    // background-color
    const bgCol = computed.backgroundColor;
    if (bgCol && bgCol !== "rgba(0, 0, 0, 0)" && bgCol !== "transparent") {
      propsToShow.push({ name: "background-color", value: bgCol });
    }

    // display
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

    // position
    const pos = computed.position;
    if (pos && pos !== "static") {
      propsToShow.push({ name: "position", value: pos });
      const zIndex = computed.zIndex;
      if (zIndex && zIndex !== "auto") propsToShow.push({ name: "z-index", value: zIndex });
    }

    // margin & padding
    const margin = computed.margin;
    if (margin && !isZeroOrNone(margin)) propsToShow.push({ name: "margin", value: margin });
    const padding = computed.padding;
    if (padding && !isZeroOrNone(padding)) propsToShow.push({ name: "padding", value: padding });

    // border & border-radius
    const borderStyle = computed.borderStyle;
    const borderWidth = computed.borderWidth;
    const borderColor = computed.borderColor;
    if (borderStyle && borderStyle !== "none" && borderWidth && borderWidth !== "0px") {
      propsToShow.push({ name: "border", value: `${borderWidth} ${borderStyle} ${borderColor}` });
    }
    const borderRadius = computed.borderRadius;
    if (borderRadius && !isZeroOrNone(borderRadius)) propsToShow.push({ name: "border-radius", value: borderRadius });

    // font-family & line-height
    const ff = computed.fontFamily;
    if (ff) {
      const ffTrunc = ff.length > 25 ? ff.substring(0, 25) + "..." : ff;
      propsToShow.push({ name: "font-family", value: ffTrunc });
    }
    const lh = computed.lineHeight;
    if (lh && lh !== "normal") propsToShow.push({ name: "line-height", value: lh });

    // box-sizing
    const bs = computed.boxSizing;
    if (bs) propsToShow.push({ name: "box-sizing", value: bs });

    // webkit-font-smoothing
    const wfs = computed.webkitFontSmoothing || computed.getPropertyValue("-webkit-font-smoothing");
    if (wfs && wfs !== "auto") propsToShow.push({ name: "-webkit-font-smoothing", value: wfs });

    // Sort alphabetically
    propsToShow.sort((a, b) => a.name.localeCompare(b.name));

    let cssHTML = "";
    propsToShow.forEach(prop => {
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
      <div class="tooltip-footer">Click to lock · ↑↓ navigate · Esc to exit</div>
    `;

    state.inspectorTooltip.style.display = "block";

    // Position coordinates calculation with edge boundary collisions
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

  // ==========================================
  // SIDEBAR CORE ROUTING
  // ==========================================

