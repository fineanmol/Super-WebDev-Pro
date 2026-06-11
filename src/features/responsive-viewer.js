import { state } from '../state.js';
import { ensureHUD } from '../ui/hud.js';
import { deactivateCurrentTool } from '../core/tool-manager.js';
export function setupResponsiveViewer() {
    let overlay = state.shadowRoot.getElementById("responsive-viewer-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "responsive-viewer-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "2147483647";
      overlay.style.background = "#0d0f14";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.fontFamily = "var(--font-primary)";
      overlay.style.color = "var(--text-primary)";

      // Default active devices
      let activeDevices = [
        { id: "iphone-14-pro", name: "iPhone 14 Pro", width: 393, height: 852, scale: 1, rotate: false },
        { id: "ipad-pro", name: "iPad Pro 12.9", width: 1024, height: 1366, scale: 0.51, rotate: false },
        { id: "macbook-air", name: "MacBook Air", width: 1280, height: 832, scale: 0.41, rotate: false }
      ];

      const renderHeader = () => {
        const pills = activeDevices.map(d => `
          <div class="device-pill" style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:4px 10px; font-size:11px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect></svg>
            <span style="font-weight:600;">${d.name}</span>
            <span style="color:var(--text-secondary); font-family:monospace;">${d.rotate ? d.height : d.width}×${d.rotate ? d.width : d.height}</span>
            <button class="rv-close-device-btn" data-id="${d.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0; display:flex; align-items:center;">&times;</button>
          </div>
        `).join("");

        return `
          <div style="display:flex; align-items:center; gap:12px; flex:1;">
            ${pills}
            <button id="rv-add-device-btn" style="display:flex; align-items:center; gap:4px; background:var(--accent-purple); color:#fff; border:none; border-radius:12px; padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer;">
              + Add <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        `;
      };

      const renderFrames = () => {
        const frames = activeDevices.map(d => {
          const dw = d.rotate ? d.height : d.width;
          const dh = d.rotate ? d.width : d.height;
          return `
            <div style="display:flex; flex-direction:column; align-items:center; flex-shrink:0;">
              <div style="display:flex; justify-content:space-between; width:${dw * d.scale}px; margin-bottom:8px; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-secondary);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect></svg>
                  <span style="color:#fff; font-weight:600;">${d.name}</span>
                  <div style="display:flex; align-items:center; gap:4px; font-family:monospace; background:rgba(255,255,255,0.05); border-radius:4px; padding:2px;">
                    <input type="number" class="rv-dim-input" data-id="${d.id}" data-axis="w" value="${dw}" style="width:36px; background:none; border:none; color:var(--text-secondary); font-family:monospace; font-size:10px; text-align:right; outline:none;-moz-appearance:textfield;"/>
                    <span style="color:rgba(255,255,255,0.2);">×</span>
                    <input type="number" class="rv-dim-input" data-id="${d.id}" data-axis="h" value="${dh}" style="width:36px; background:none; border:none; color:var(--text-secondary); font-family:monospace; font-size:10px; text-align:left; outline:none;-moz-appearance:textfield;"/>
                  </div>
                  <span style="font-family:monospace;">· ${Math.round(d.scale * 100)}%</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="rv-rotate-btn" data-id="${d.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Rotate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg></button>
                  <button class="rv-refresh-btn" data-id="${d.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Refresh"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></button>
                  <button class="rv-close-btn" data-id="${d.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Close">&times;</button>
                </div>
              </div>
              <div style="width:${dw * d.scale}px; height:${dh * d.scale}px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden; position:relative; background:#fff;">
                <iframe src="${window.location.href}" style="width:${dw}px; height:${dh}px; transform:scale(${d.scale}); transform-origin:top left; border:none; position:absolute; top:0; left:0;"></iframe>
              </div>
            </div>
          `;
        }).join("");
        return frames;
      };

      const updateUI = () => {
        overlay.querySelector("#rv-header-slot").innerHTML = renderHeader();
        overlay.querySelector("#rv-frames-slot").innerHTML = renderFrames();

        // Bind events
        overlay.querySelectorAll(".rv-close-device-btn, .rv-close-btn").forEach(btn => {
          btn.onclick = () => {
            activeDevices = activeDevices.filter(d => d.id !== btn.getAttribute("data-id"));
            updateUI();
          };
        });

        overlay.querySelectorAll(".rv-rotate-btn").forEach(btn => {
          btn.onclick = () => {
            const dev = activeDevices.find(d => d.id === btn.getAttribute("data-id"));
            if (dev) {
              dev.rotate = !dev.rotate;
              updateUI();
            }
          };
        });

        overlay.querySelectorAll(".rv-refresh-btn").forEach(btn => {
          btn.onclick = () => {
            updateUI();
          };
        });

        overlay.querySelectorAll(".rv-dim-input").forEach(input => {
          input.onchange = (e) => {
            const dev = activeDevices.find(d => d.id === input.getAttribute("data-id"));
            if (dev) {
              const val = parseInt(e.target.value) || 100;
              if (input.getAttribute("data-axis") === "w") {
                if (dev.rotate) dev.height = val; else dev.width = val;
              } else {
                if (dev.rotate) dev.width = val; else dev.height = val;
              }
              updateUI();
            }
          };
        });
      };

      overlay.innerHTML = `
        <!-- Top bar -->
        <div style="display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); gap:20px; background:#12141a;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            <span style="font-size: 16px; font-weight: 600;">Responsive Viewer</span>
            <div style="width:6px; height:6px; background:#4ade80; border-radius:50%; box-shadow:0 0 8px #4ade80;"></div>
          </div>
          
          <div id="rv-header-slot" style="display:flex; align-items:center; gap:12px; flex:1;"></div>

          <button id="rv-exit-btn" style="margin-left:auto; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-secondary); cursor:pointer; padding:6px 12px; display:flex; align-items:center; gap:6px; font-size:11px;">
            <span style="font-family:monospace;">Esc</span> close
          </button>
        </div>
        
        <!-- Frames Area -->
        <div id="rv-frames-slot" class="custom-scroll" style="flex:1; display:flex; gap:30px; padding:30px; overflow-x:auto; overflow-y:auto; background:#0d0f14;"></div>
      `;

      state.shadowRoot.appendChild(overlay);

      overlay.querySelector("#rv-exit-btn").onclick = () => {
        overlay.style.display = "none";
        deactivateCurrentTool();
      };

      updateUI();
    } else {
      overlay.style.display = "flex";
    }
  }

