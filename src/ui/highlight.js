import { state } from '../state.js';
export function showHighlight(rect, labelText, customColor = null) {
    ensureHUD();
    state.highlightOverlay.style.top = `${rect.top}px`;
    state.highlightOverlay.style.left = `${rect.left}px`;
    state.highlightOverlay.style.width = `${rect.width}px`;
    state.highlightOverlay.style.height = `${rect.height}px`;
    state.highlightOverlay.style.display = "block";

    if (customColor) {
      state.highlightOverlay.style.borderColor = customColor;
      state.highlightOverlay.style.backgroundColor = `${customColor}0e`;
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
export function hideHighlight() {
    if (state.highlightOverlay) {
      state.highlightOverlay.style.display = "none";
      state.highlightOverlay.classList.remove("show-guides");
      state.highlightLabel.style.display = "none";
    }
    if (state.inspectorTooltip) {
      state.inspectorTooltip.style.display = "none";
    }
  }

