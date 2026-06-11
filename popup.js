document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabToolsBtn = document.getElementById("tab-tools");
  const tabPremiumBtn = document.getElementById("tab-premium");
  const contentTools = document.getElementById("content-tools");
  const contentPremium = document.getElementById("content-premium");

  const premiumBadge = document.getElementById("premium-badge");
  const premiumLockedCard = document.getElementById("premium-locked-card");
  const premiumUnlockedCard = document.getElementById("premium-unlocked-card");

  const btnUpgrade = document.getElementById("btn-upgrade");
  const btnDowngrade = document.getElementById("btn-downgrade");
  const btnPromo = document.getElementById("btn-promo");
  const promoInput = document.getElementById("promo-code");
  const statusAlert = document.getElementById("status-alert");

  const lockoutModal = document.getElementById("lockout-modal");
  const modalUpgradeBtn = document.getElementById("modal-upgrade-btn");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  let isPremium = false;
  let activeTabId = null;

  // Tab switching
  tabToolsBtn.addEventListener("click", () => switchTab("tools"));
  tabPremiumBtn.addEventListener("click", () => switchTab("premium"));

  function switchTab(tab) {
    if (tab === "tools") {
      tabToolsBtn.classList.add("active");
      tabPremiumBtn.classList.remove("active");
      contentTools.classList.add("active");
      contentPremium.classList.remove("active");
    } else {
      tabToolsBtn.classList.remove("active");
      tabPremiumBtn.classList.add("active");
      contentTools.classList.remove("active");
      contentPremium.classList.add("active");
    }
  }

  // Load Premium State
  function updatePremiumUI() {
    chrome.storage.local.get(["premium"], (result) => {
      isPremium = !!result.premium;

      if (isPremium) {
        premiumBadge.classList.add("active");
        premiumLockedCard.classList.add("hidden");
        premiumUnlockedCard.classList.add("active");

        // Hide PRO badges in buttons
        document.querySelectorAll(".pro-badge").forEach((el) => {
          el.style.display = "none";
        });
      } else {
        premiumBadge.classList.remove("active");
        premiumLockedCard.classList.remove("hidden");
        premiumUnlockedCard.classList.remove("active");

        // Show PRO badges
        document.querySelectorAll(".pro-badge").forEach((el) => {
          el.style.display = "flex";
        });
      }
    });
  }

  // Upgrade Actions
  btnUpgrade.addEventListener("click", () => {
    showStatus("Simulating Stripe Payment...", "success");
    setTimeout(() => {
      chrome.storage.local.set({ premium: true }, () => {
        updatePremiumUI();
        showStatus("Payment Successful! Welcome to WebDev Pro.", "success");
      });
    }, 1200);
  });

  btnDowngrade.addEventListener("click", () => {
    chrome.storage.local.set({ premium: false }, () => {
      updatePremiumUI();
      showStatus("Reset to Free Version.", "success");
    });
  });

  btnPromo.addEventListener("click", () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === "WEBDEVPRO2026") {
      chrome.storage.local.set({ premium: true }, () => {
        updatePremiumUI();
        showStatus("Pro Version Activated Successfully!", "success");
        promoInput.value = "";
      });
    } else {
      showStatus("Invalid license code. Please try again.", "error");
    }
  });

  function showStatus(msg, type) {
    statusAlert.textContent = msg;
    statusAlert.className = `status-msg ${type}`;
    setTimeout(() => {
      statusAlert.style.display = "none";
    }, 4000);
  }

  // Lockout Modal
  modalCloseBtn.addEventListener("click", () => {
    lockoutModal.classList.remove("active");
  });

  modalUpgradeBtn.addEventListener("click", () => {
    lockoutModal.classList.remove("active");
    switchTab("premium");
  });

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
      const isToolPremium = button.getAttribute("data-premium") === "true";

      if (isToolPremium && !isPremium) {
        lockoutModal.classList.add("active");
        return;
      }

      // Activate or toggle the tool on the target webpage
      if (activeTabId) {
        chrome.tabs.sendMessage(
          activeTabId,
          { action: "toggleTool", tool: toolId, premium: isPremium },
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

  // Initial load
  updatePremiumUI();
});
