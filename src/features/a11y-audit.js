import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupA11yAudit() {
    const images = Array.from(document.getElementsByTagName("img"));
    const missingAlt = images.filter(img => !img.alt || img.alt.trim() === "");

    const buttons = Array.from(document.querySelectorAll("button, a[role='button']"));
    const missingAriaLabel = buttons.filter(btn => !btn.innerText.trim() && !btn.getAttribute("aria-label"));

    const inputs = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit'])"));
    const missingLabels = inputs.filter(inp => {
      // Check for parent label or matching id/for label
      const hasParentLabel = inp.closest("label");
      const hasIdLabel = inp.id ? document.querySelector(`label[for='${inp.id}']`) : false;
      const hasAriaLabel = inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby");
      return !hasParentLabel && !hasIdLabel && !hasAriaLabel;
    });

    const totalIssues = missingAlt.length + missingAriaLabel.length + missingLabels.length;

    const a11yHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:14px;">WCAG Accessibility audits:</div>
      
      <!-- Issue Tracker -->
      <div class="audit-card ${totalIssues === 0 ? 'audit-success' : 'audit-warning'}">
        <div class="audit-card-title">♿ Audit Status</div>
        <div class="audit-card-desc">
          Found <b>${totalIssues}</b> accessibility warnings on this webpage.
        </div>
      </div>

      <!-- Image Alt Audit -->
      <div class="audit-card ${missingAlt.length === 0 ? 'audit-success' : 'audit-warning'}">
        <div class="audit-card-title">🖼️ Missing Alt Attributes</div>
        <div class="audit-card-desc">
          Found <b>${missingAlt.length}</b> image(s) lacking an alt attribute. Alt attributes are critical for screen reader readers.
        </div>
        ${missingAlt.length > 0 ? `
          <div style="margin-top:8px; font-size:10px; font-family:monospace; max-height:80px; overflow-y:auto; background:rgba(0,0,0,0.15); padding:6px; border-radius:4px;">
            ${missingAlt.slice(0, 10).map((img, i) => `#${i+1}: ${img.src.split('/').pop().split('?')[0] || "image"}`).join("<br>")}
          </div>
        ` : ""}
      </div>

      <!-- Button Label Audit -->
      <div class="audit-card ${missingAriaLabel.length === 0 ? 'audit-success' : 'audit-warning'}">
        <div class="audit-card-title">🎛️ Descriptive Buttons</div>
        <div class="audit-card-desc">
          Found <b>${missingAriaLabel.length}</b> button(s) lacking text or aria-labels, making them unreadable by assistant tools.
        </div>
      </div>

      <!-- Inputs Label Audit -->
      <div class="audit-card ${missingLabels.length === 0 ? 'audit-success' : 'audit-warning'}">
        <div class="audit-card-title">✍️ Unassociated Form Inputs</div>
        <div class="audit-card-desc">
          Found <b>${missingLabels.length}</b> input field(s) without matching label tags or ARIA labels.
        </div>
      </div>
    `;

    openDrawer("Accessibility", "WCAG accessibility checker", a11yHTML);
  }

  // ==========================================
  // LEGACY TOOLS PORTED TO SIDEBAR SYSTEM
  // ==========================================

  // 1. CSS Inspector

