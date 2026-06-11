import { state } from '../state.js';
import { hideHighlight } from '../ui/highlight.js';
import { closeDrawer } from '../ui/drawer.js';
import { setupCSSInspector } from '../features/css-inspector.js';
import { setupLiveTextEditor } from '../features/live-text-editor.js';
import { setupFontsChanger } from '../features/fonts-changer.js';
import { setupColorPicker } from '../features/color-picker.js';
import { setupExtractImages } from '../features/extract-images.js';
import { setupMoveElement } from '../features/move-element.js';
import { setupDeleteElement } from '../features/delete-element.js';
import { setupExportElement } from '../features/export-element.js';
import { setupPageRuler } from '../features/page-ruler.js';
import { setupTakeScreenshot } from '../features/take-screenshot.js';
import { setupResponsiveViewer } from '../features/responsive-viewer.js';
import { setupSettings } from '../features/settings.js';
export function activateTool(tool) {
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
export function deactivateCurrentTool() {
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

