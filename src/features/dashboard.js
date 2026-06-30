import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function openDashboardDrawer() {
    const welcomeHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">⚡ Welcome to WebDev Pro</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Your premium developer toolbox is fully active. Inspect designs, edit copy, view typography, query technology stacks, and execute visual audits directly on the webpage.
        </p>
      </div>
      <div class="audit-card audit-success" style="margin-top:12px;">
        <div style="font-size: 12px; font-weight: 700; color:#4ade80; margin-bottom: 4px;">✅ All Tools Unlocked</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Every tool is free to use — no account or license required.
        </p>
      </div>
      <div style="margin-top: 16px;">
        <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 8px; font-weight:700;">Quick Instructions:</span>
        <p style="font-size: 11px; line-height: 1.5; color: var(--text-secondary); margin: 0;">
          • Click any tool on the sidebar to launch its diagnostic inspector panel.
          <br>• Use <b>Cmd+Shift+P</b> (or Ctrl+Shift+P) to open the Command Palette.
          <br>• Use <b>Cmd+Shift+E</b> to hide/show the vertical toolbar.
          <br>• Switch sidebar position (Left / Right) using the settings gear button.
        </p>
      </div>
    `;
    openDrawer("WebDev Pro Dashboard", "Premium developer toolbar features", welcomeHTML);
  }

  // 3. Font Changer

