document.addEventListener("DOMContentLoaded", () => {
  const statusAlert = document.getElementById("status-alert");

  let activeTabId = null;

  function showStatus(msg, type) {
    statusAlert.textContent = msg;
    statusAlert.style.display = ""; // Reset inline override
    statusAlert.className = `status-msg ${type}`;
    setTimeout(() => {
      statusAlert.style.display = "none";
    }, 4000);
  }

  // Query active tab to check the current tool
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      activeTabId = tabs[0].id;
      // Ask content script what tool is active
      chrome.tabs.sendMessage(activeTabId, { action: "getActiveTool" }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded, display error/info in status
          return;
        }
        if (response && response.activeTool) {
          const btn = document.getElementById(response.activeTool);
          if (btn) btn.classList.add("active-tool");
        }
      });
    }
  });

  // Setup buttons events
  const buttons = document.querySelectorAll(".feature-button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const toolId = button.id;

      // Activate or toggle the tool on the target webpage
      if (activeTabId) {
        chrome.tabs.sendMessage(
          activeTabId,
          { action: "toggleTool", tool: toolId },
          (response) => {
            if (chrome.runtime.lastError) {
              // Failed to communicate - page might need a refresh or extension was just reloaded
              showStatus("Extension content script not loaded. Reload page to start!", "error");
              return;
            }
            if (response && response.status) {
              // Clear other active indicators
              buttons.forEach((b) => b.classList.remove("active-tool"));

              if (response.isActive) {
                button.classList.add("active-tool");
              }
              // Close popup so the user can see/interact with the page tool
              window.close();
            }
          }
        );
      }
    });
  });
});
