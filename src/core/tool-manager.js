import { state } from '../state.js';
import { ensureHUD, updateSidebarActiveBtn } from '../ui/hud.js';
import { hideHighlight } from '../ui/highlight.js';
import { closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { showToast } from '../ui/toast.js';
import { setupCSSInspector } from '../features/css-inspector.js';
import { setupLiveTextEditor } from '../features/live-text-editor.js';
import { setupFontsChanger } from '../features/fonts-changer.js';
import { setupListFonts } from '../features/list-fonts.js';
import { setupColorPicker } from '../features/color-picker.js';
import { setupColorPalette } from '../features/color-palette.js';
import { setupExtractImages } from '../features/extract-images.js';
import { setupMoveElement } from '../features/move-element.js';
import { setupDeleteElement } from '../features/delete-element.js';
import { setupExportElement } from '../features/export-element.js';
import { setupPageRuler } from '../features/page-ruler.js';
import { setupPageOutliner } from '../features/page-outliner.js';
import { setupImageReplacer } from '../features/image-replacer.js';
import { setupTakeScreenshot } from '../features/take-screenshot.js';
import { setupResponsiveViewer } from '../features/responsive-viewer.js';
import { setupSettings } from '../features/settings.js';
import { setupTechStack } from '../features/tech-stack.js';
import { setupSeoMeta } from '../features/seo-meta.js';
import { setupA11yAudit } from '../features/a11y-audit.js';

export   function activateTool(tool) {
    deactivateCurrentTool();
    ensureHUD();

    state.activeTool = tool;
    updateSidebarActiveBtn();

    // Clean up previous drawer state
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

    showToast(`Enabled: ${tool.replace(/-/g, ' ').toUpperCase()}`);
  }


export   function deactivateCurrentTool() {
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

    showToast(`Disabled: ${state.activeTool.replace(/-/g, ' ').toUpperCase()}`);
    state.activeTool = null;
    updateSidebarActiveBtn();
  }


export   function trackListener(target, event, callback, useCapture = false) {
    target.addEventListener(event, callback, useCapture);
    state.activeListeners.push({ target, event, callback, useCapture });
  }


export   function cleanupListeners() {
    state.activeListeners.forEach(({ target, event, callback, useCapture }) => {
      target.removeEventListener(event, callback, useCapture);
    });
    state.activeListeners = [];
  }

  // ==========================================
  // COMMAND PALETTE SEARCH ENGINE
  // ==========================================

export   function openCommandPalette() {
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
      { id: "css-inspector", label: "🔍 CSS Inspector", category: "Inspect" },
      { id: "live-text-editor", label: "📝 Text Editor", category: "Inspect" },
      { id: "fonts-changer", label: "🔤 Font Changer (Pro)", category: "Design" },
      { id: "list-fonts", label: "📋 List Fonts", category: "Design" },
      { id: "color-picker", label: "🎨 Color Picker", category: "Design" },
      { id: "color-palette", label: "🌈 Color Palette (Pro)", category: "Design" },
      { id: "move-element", label: "🖱️ Move Element (Pro)", category: "Design" },
      { id: "delete-element", label: "🗑️ Delete Element", category: "Inspect" },
      { id: "export-element", label: "📤 Export Element (Pro)", category: "Capture" },
      { id: "extract-images", label: "🖼️ Extract Images (Pro)", category: "Capture" },
      { id: "page-ruler", label: "📏 Page Ruler (Pro)", category: "Diagnostics" },
      { id: "page-outliner", label: "🔲 Page Outliner", category: "Diagnostics" },
      { id: "image-replacer", label: "🔄 Image Swap (Pro)", category: "Design" },
      { id: "take-screenshot", label: "📸 Screenshot (Pro)", category: "Capture" },
      { id: "tech-stack", label: "💻 Tech Stack Detector", category: "Diagnostics" },
      { id: "seo-meta", label: "🏷️ SEO Meta Inspector", category: "Diagnostics" },
      { id: "a11y-audit", label: "♿ Accessibility Audit", category: "Diagnostics" }
    ];

    let activeIndex = 0;
    let filtered = [...commands];

    function drawCommands() {
      let html = "";
      filtered.forEach((cmd, idx) => {
        html += `
          <div class="cmd-item ${idx === activeIndex ? 'active' : ''}" data-id="${cmd.id}">
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
        // Close palette first
        state.shadowRoot.removeChild(backdrop);
        
        // Handle premium lock
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
      filtered = commands.filter(cmd => cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q));
      activeIndex = 0;
      drawCommands();
    };

    // Keyboard navigation inside Palette
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

    // Click trigger
    listSlot.onclick = (e) => {
      const item = e.target.closest(".cmd-item");
      if (item) {
        const id = item.getAttribute("data-id");
        activeIndex = filtered.findIndex(cmd => cmd.id === id);
        triggerActiveCommand();
      }
    };

    // Close on click outside
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        state.shadowRoot.removeChild(backdrop);
      }
    };

    drawCommands();
  }

  // ==========================================
  // NEW FEATURE 1: TECH STACK DETECTOR
  // ==========================================

