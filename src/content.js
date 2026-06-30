import { state } from './state.js';
import { ensureHUD, toggleSidebarVisibility, setSidebarVisible } from './ui/hud.js';
import { activateTool, deactivateCurrentTool, openCommandPalette } from './core/tool-manager.js';

// Entry point initialization
chrome.storage.local.get("hudEnabled", (res) => {
  if (res.hudEnabled !== false) {
    ensureHUD();
  }
});

// Keyboard shortcut listener for global toggle Sidebar / Cmd+Shift+P Palette
document.addEventListener("keydown", (e) => {
  // Toggle Sidebar: Cmd+Shift+E
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
    e.preventDefault();
    chrome.storage.local.get("hudEnabled", (res) => {
      if (res.hudEnabled === false) {
        chrome.storage.local.set({ hudEnabled: true }, () => {
          ensureHUD();
          setSidebarVisible(true);
        });
      } else {
        toggleSidebarVisibility();
      }
    });
  }

  // Toggle Palette: Cmd+Shift+P
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    chrome.storage.local.get("hudEnabled", (res) => {
      if (res.hudEnabled === false) {
        chrome.storage.local.set({ hudEnabled: true }, () => {
          ensureHUD();
          openCommandPalette();
        });
      } else {
        ensureHUD();
        openCommandPalette();
      }
    });
  }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "toggle-sidebar" || req.action === "toggleSidebarShortcut") {
    chrome.storage.local.get("hudEnabled", (res) => {
      if (res.hudEnabled === false) {
        chrome.storage.local.set({ hudEnabled: true }, () => {
          ensureHUD();
          setSidebarVisible(true);
          sendResponse({ status: "success" });
        });
      } else {
        toggleSidebarVisibility();
        sendResponse({ status: "success" });
      }
    });
    return true;
  }

  if (req.action === "activate-tool") {
    chrome.storage.local.set({ hudEnabled: true }, () => {
      ensureHUD();
      if (!state.sidebarVisible) {
        setSidebarVisible(true);
      }
      activateTool(req.tool);
      sendResponse({ status: "success" });
    });
    return true;
  }

  if (req.action === "getActiveTool") {
    sendResponse({ activeTool: state.activeTool });
    return true;
  }

  if (req.action === "toggleTool") {
    chrome.storage.local.set({ hudEnabled: true }, () => {
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
    });
    return true;
  }
});

