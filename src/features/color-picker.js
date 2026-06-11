import { state } from '../state.js';
import { openDrawer } from '../ui/drawer.js';
import { showToast } from '../ui/toast.js';
import { deactivateCurrentTool } from '../core/tool-manager.js';
export function setupColorPicker() {
function drawColorPickerDrawer(pickedHex = null) {
      let resultHTML = "";
      if (pickedHex) {
        const rgb = hexToRgb(pickedHex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        resultHTML = `
          <div style="display:flex; flex-direction:column; gap:10px; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:12px;">
            <div style="width:60px; height:60px; border-radius:50%; background:${pickedHex}; border:2px solid rgba(255,255,255,0.15); box-shadow:0 4px 10px rgba(0,0,0,0.3);"></div>
            <div style="width:100%; display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px;">
                <span>HEX: <b style="color:var(--accent-emerald);">${pickedHex.toUpperCase()}</b></span>
                <button class="hud-btn cp-val-copy" data-val="${pickedHex.toUpperCase()}" style="padding:2px 6px; font-size:9px;">Copy</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px;">
                <span>RGB: <b style="color:var(--accent-emerald);">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</b></span>
                <button class="hud-btn cp-val-copy" data-val="rgb(${rgb.r}, ${rgb.g}, ${rgb.b})" style="padding:2px 6px; font-size:9px;">Copy</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px;">
                <span>HSL: <b style="color:var(--accent-emerald);">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</b></span>
                <button class="hud-btn cp-val-copy" data-val="hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)" style="padding:2px 6px; font-size:9px;">Copy</button>
              </div>
            </div>
          </div>
        `;
      }

      const contentHTML = `
        <div class="audit-card">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
            <span>🎨</span> EyeDropper Magnifier
          </div>
          <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
            Launch pixel EyeDropper tool to magnify and extract color codes from webpage templates.
          </p>
          <button id="cp-start-picker-btn" class="hud-btn primary" style="width:100%; justify-content:center;">🚀 Launch Color Picker</button>
        </div>
        <div id="cp-picked-results">${resultHTML}</div>
      `;

      openDrawer("Color Picker", "Pipette selected color codes", contentHTML, (slot) => {
        slot.querySelector("#cp-start-picker-btn").onclick = () => {
          if (!window.EyeDropper) {
            showToast("EyeDropper not supported in this browser!");
            return;
          }
          const eyeDropper = new EyeDropper();
          eyeDropper.open().then(res => {
            navigator.clipboard.writeText(res.sRGBHex.toUpperCase());
            showToast(`Copied picked color: ${res.sRGBHex.toUpperCase()}`);
            drawColorPickerDrawer(res.sRGBHex);
          });
        };

        slot.querySelectorAll(".cp-val-copy").forEach(btn => {
          btn.onclick = () => {
            navigator.clipboard.writeText(btn.getAttribute("data-val"));
            showToast("Copied value to clipboard!");
          };
        });
      });
    }

    drawColorPickerDrawer();
  }

