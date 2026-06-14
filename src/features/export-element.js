import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupExportElement() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>📤</span> Code Exporter Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Hover and click on any webpage layout segment to download its clean HTML/CSS source packages or open in CodePen.
        </p>
      </div>
      <div id="export-element-details" style="display: none; margin-top: 14px;"></div>
    `;

    openDrawer("Export Element", "Build standalone layouts code", guideHTML);

    trackListener(document, "mouseover", (e) => {
      if (isHUDElement(e.target) || e.target === document.body || e.target === document.documentElement) return;
      const rect = e.target.getBoundingClientRect();
      showHighlight(rect, `Export: ${e.target.tagName.toLowerCase()}`, "var(--accent-emerald)");
    }, true);

    trackListener(document, "mouseout", (e) => {
      if (isHUDElement(e.target)) return;
      hideHighlight();
    }, true);

    trackListener(document, "click", (e) => {
      if (isHUDElement(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      renderExportDetailsInDrawer(e.target);
    }, true);
  }


export   function renderExportDetailsInDrawer(element) {
    const detailsSlot = state.shadowRoot.getElementById("export-element-details");
    if (!detailsSlot) return;

    detailsSlot.style.display = "block";

    const htmlCode = element.outerHTML;
    const computed = window.getComputedStyle(element);
    let cssText = `/* Exported Style rules for ${element.tagName.toLowerCase()} */\n.exported-element {\n`;
    
    const rules = [
      "background-color", "color", "font-family", "font-size", "font-weight",
      "padding", "margin", "border", "border-radius", "box-shadow",
      "width", "height", "display", "flex-direction", "justify-content", "align-items"
    ];
    
    rules.forEach(rule => {
      const val = computed.getPropertyValue(rule);
      if (val) cssText += `  ${rule}: ${val};\n`;
    });
    cssText += `}\n`;

    const htmlClean = htmlCode.replace(/ style="[^"]*"/, "").replace(element.tagName.toLowerCase(), `${element.tagName.toLowerCase()} class="exported-element"`);

    detailsSlot.innerHTML = `
      <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top:12px;">Export webpage element snippet:</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button id="export-dl-btn" class="hud-btn primary" style="justify-content:center; padding:10px;">💾 Download HTML/CSS</button>
        <button id="export-cp-btn" class="hud-btn" style="justify-content:center; padding:10px; background:#000; border-color:#222;">🚀 Open in CodePen</button>
      </div>
      <div style="margin-top:16px;">
        <span style="font-size:11px; color:var(--text-secondary); display:block; margin-bottom:6px;">Clean HTML:</span>
        <textarea style="width:100%; height:100px; font-size:10px; font-family:monospace; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.06); border-radius:6px; color:#c8c8d0; padding:6px; resize:none;" readonly>${htmlClean}</textarea>
      </div>
    `;

    detailsSlot.querySelector("#export-dl-btn").onclick = () => {
      const fullHTML = `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #0c0c0e; color: #f7f7fa; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n    ${cssText}\n  </style>\n</head>\n<body>\n  ${htmlClean}\n</body>\n</html>`;
      const blob = new Blob([fullHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-${element.tagName.toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Downloaded standalone HTML");
    };

    detailsSlot.querySelector("#export-cp-btn").onclick = () => {
      const payload = {
        title: `SuperDev Pro Export <${element.tagName.toLowerCase()}>`,
        html: htmlClean,
        css: cssText,
        editors: "110"
      };
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://codepen.io/pen/define";
      form.target = "_blank";

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "data";
      input.value = JSON.stringify(payload);

      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      showToast("Redirected to CodePen!");
    };
  }

  // 12. Page Outliner

