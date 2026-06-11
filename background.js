chrome.runtime.onInstalled.addListener(() => {
  console.log("Super Web Dev Extension installed.");
});

// Listener for screenshot capture and other background utilities
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "takeScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ screenshotUrl: dataUrl });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Listener for hotkey commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-sidebar") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSidebarShortcut" });
      }
    });
  }
});


