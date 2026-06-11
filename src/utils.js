import { state } from './state.js';
import { ensureHUD } from './ui/hud.js';
export   function formatElementSelector(el) {
    if (!el) return "";
    const tagName = el.tagName.toLowerCase();
    let idAttr = el.id ? `#${el.id}` : "";
    let classesAttr = "";
    if (el.classList && el.classList.length > 0) {
      const cls = Array.from(el.classList)
        .filter(c => typeof c === "string" && c.trim() && !c.startsWith("super-webdev-"))
        .join(".");
      if (cls) classesAttr = `.${cls}`;
    }
    let selector = `${tagName}${idAttr}${classesAttr}`;
    if (selector.length > 30) {
      selector = selector.substring(0, 30) + "...";
    }
    return selector;
  }


export   function getFirstFontFamily(fontFamilyStr) {
    if (!fontFamilyStr) return "sans-serif";
    const first = fontFamilyStr.split(",")[0].trim();
    return first.replace(/['"]/g, "");
  }
  // ==========================================
  // HELPERS
  // ==========================================


export   function hexToRgb(hex) {
    let c = hex.replace(/^#/, "");
    if (c.length === 3) c = c.split("").map(x => x + x).join("");
    const num = parseInt(c, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }


export   function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }


export   function extractColor(propName, value) {
    if (!value) return null;
    if (propName === "color" || propName === "background-color") {
      return value;
    }
    const match = value.match(/(rgba?\(.*?\)|#[0-9a-fA-F]{3,8})/);
    return match ? match[0] : null;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getActiveTool") {
      sendResponse({ activeTool: state.activeTool });
      return;
    }

    if (request.action === "toggleSidebarShortcut") {
      toggleSidebarVisibility();
      sendResponse({ status: "success" });
      return;
    }

    if (request.action === "toggleTool") {
      state.isPremium = !!request.premium;
      ensureHUD();
      if (!state.sidebarVisible) {
        setSidebarVisible(true);
      }
      
      if (state.activeTool === request.tool) {
        deactivateCurrentTool();
        sendResponse({ status: "success", isActive: false });
      } else {
        activateTool(request.tool);
        sendResponse({ status: "success", isActive: true });
      }
    }
  });

  // Setup HUD host & Shadow Root

