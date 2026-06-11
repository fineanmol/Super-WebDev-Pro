import { state } from './state.js';
import { ensureHUD } from './ui/hud.js';
import { activateTool, deactivateCurrentTool } from './core/tool-manager.js';

// Entry point initialization
ensureHUD();

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "toggle-sidebar") {
    if (state.sidebarEl) {
      if (state.isSidebarOpen) {
        state.sidebarEl.style.transform = "translateX(-120%)";
        state.sidebarEl.style.opacity = "0";
        state.isSidebarOpen = false;
        deactivateCurrentTool();
      } else {
        state.sidebarEl.style.transform = "translateX(0)";
        state.sidebarEl.style.opacity = "1";
        state.isSidebarOpen = true;
      }
    }
  } else if (req.action === "activate-tool") {
    if (!state.isSidebarOpen && state.sidebarEl) {
      state.sidebarEl.style.transform = "translateX(0)";
      state.sidebarEl.style.opacity = "1";
      state.isSidebarOpen = true;
    }
    activateTool(req.tool);
  }
  sendResponse({ status: "ok" });
});
