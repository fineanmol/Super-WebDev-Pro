import { state } from './state.js';
import { ensureHUD, toggleSidebarVisibility, setSidebarVisible } from './ui/hud.js';
import { activateTool, deactivateCurrentTool } from './core/tool-manager.js';

// Entry point initialization
ensureHUD();

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

