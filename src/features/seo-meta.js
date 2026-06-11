import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupSeoMeta() {
    const title = document.title || "No Title Tag Detected";
    const desc = document.querySelector('meta[name="description"]')?.content || "No Meta Description Tag Found";
    const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
    const robots = document.querySelector('meta[name="robots"]')?.content || "index, follow";

    // Heading outlines
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const h1Count = headings.filter(h => h.tagName.toLowerCase() === "h1").length;

    let hOutlineHTML = `<div style="max-height: 200px; overflow-y:auto; padding:6px; background:rgba(0,0,0,0.2); border-radius:6px; font-family:monospace; font-size:11px;">`;
    headings.forEach(h => {
      const pad = (parseInt(h.tagName.charAt(1)) - 1) * 8;
      hOutlineHTML += `
        <div style="padding-left: ${pad}px; margin-bottom: 4px; border-left:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--accent-purple); font-weight:700; margin-right:4px;">${h.tagName}</span>
          <span style="color:var(--text-primary);">${h.innerText.trim() || "(empty)"}</span>
        </div>
      `;
    });
    hOutlineHTML += `</div>`;

    const seoHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:14px;">Webpage SEO diagnostics audit:</div>
      
      <!-- Title Card -->
      <div class="audit-card ${title ? 'audit-success' : 'audit-warning'}">
        <div class="audit-card-title">📝 Page Title (${title.length} chars)</div>
        <div class="audit-card-desc" style="font-weight:600; color:var(--text-primary); margin-top:4px;">${title}</div>
      </div>

      <!-- Description Card -->
      <div class="audit-card ${desc.startsWith("No") ? 'audit-warning' : 'audit-success'}">
        <div class="audit-card-title">🏷️ Meta Description (${desc.length} chars)</div>
        <div class="audit-card-desc" style="margin-top:4px;">${desc}</div>
      </div>

      <!-- Link visual mock preview -->
      <div style="margin-bottom:16px;">
        <span style="font-size:11px; color:var(--text-secondary);">Google Search Preview:</span>
        <div class="seo-preview-box">
          <div class="seo-preview-url">${canonical}</div>
          <h3 class="seo-preview-title">${title}</h3>
          <p class="seo-preview-desc">${desc.length > 150 ? desc.slice(0,147)+'...' : desc}</p>
        </div>
      </div>

      <!-- Headings Count Warnings -->
      <div class="audit-card ${h1Count === 1 ? 'audit-success' : 'audit-warning'}">
        <div class="audit-card-title">📐 Heading Hierarchy</div>
        <div class="audit-card-desc" style="margin-top:4px;">
          Detected <b>${h1Count}</b> H1 tag(s). ${h1Count === 0 ? "Warning: Page needs exactly one H1 tag!" : h1Count > 1 ? "Warning: Page has multiple H1 tags." : "Heading configuration is healthy."}
        </div>
        <div style="margin-top:8px;">Outline Tree:</div>
        ${hOutlineHTML}
      </div>
    `;

    openDrawer("SEO Meta", "SEO tags diagnostics", seoHTML);
  }

  // ==========================================
  // NEW FEATURE 3: ACCESSIBILITY (a11y) AUDIT
  // ==========================================

