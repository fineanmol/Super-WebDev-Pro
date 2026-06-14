import { state } from '../state.js';
import { ensureHUD } from '../ui/hud.js';
import { deactivateCurrentTool } from '../core/tool-manager.js';

const DEVICE_CATALOG = [
  { id: "iphone-se", name: "iPhone SE", width: 375, height: 667, scale: 0.8 },
  { id: "iphone-14-pro", name: "iPhone 14 Pro", width: 393, height: 852, scale: 0.7 },
  { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", width: 430, height: 932, scale: 0.65 },
  { id: "pixel-7", name: "Pixel 7", width: 412, height: 915, scale: 0.65 },
  { id: "ipad-mini", name: "iPad Mini", width: 768, height: 1024, scale: 0.5 },
  { id: "ipad-pro", name: "iPad Pro", width: 1024, height: 1366, scale: 0.4 },
  { id: "macbook-air", name: "MacBook Air", width: 1280, height: 832, scale: 0.4 },
  { id: "desktop-1080p", name: "Desktop 1080p", width: 1920, height: 1080, scale: 0.3 }
];

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
      overlay.style.fontFamily = "var(--font-primary, system-ui)";
      overlay.style.color = "var(--text-primary, #fff)";

      // State
      let activeDevices = [
        { ...DEVICE_CATALOG[1], uid: Date.now() + 1, rotate: false },
        { ...DEVICE_CATALOG[5], uid: Date.now() + 2, rotate: false },
        { ...DEVICE_CATALOG[6], uid: Date.now() + 3, rotate: false }
      ];
      let syncScroll = true;
      let isSyncing = false;

      const renderHeader = () => {
        const pills = activeDevices.map(d => `
          <div class="device-pill" style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:4px 10px; font-size:11px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect></svg>
            <span style="font-weight:600;">${d.name}</span>
            <span style="color:var(--text-secondary); font-family:monospace;">${d.rotate ? d.height : d.width}×${d.rotate ? d.width : d.height}</span>
            <button class="rv-close-device-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0; display:flex; align-items:center;">&times;</button>
          </div>
        `).join("");

        return `
          <div style="display:flex; align-items:center; gap:12px; flex:1;">
            ${pills}
            
            <div style="position:relative; display:inline-block;">
              <button id="rv-add-device-btn" style="display:flex; align-items:center; gap:4px; background:var(--accent-purple, #b8a3fc); color:#121212; border:none; border-radius:12px; padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer;">
                + Add <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div id="rv-add-dropdown" style="display:none; position:absolute; top:calc(100% + 4px); left:0; background:#1e1e24; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:4px; box-shadow:0 4px 12px rgba(0,0,0,0.5); z-index:100; min-width:160px;">
                ${DEVICE_CATALOG.map(cat => `
                  <div class="rv-cat-item" data-id="${cat.id}" style="padding:6px 12px; font-size:11px; color:#fff; cursor:pointer; border-radius:4px; display:flex; justify-content:space-between;">
                    <span>${cat.name}</span>
                    <span style="color:rgba(255,255,255,0.3);">${cat.width}×${cat.height}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <div style="width:1px; height:16px; background:rgba(255,255,255,0.1); margin:0 8px;"></div>
            
            <button id="rv-sync-btn" style="display:flex; align-items:center; gap:6px; background:${syncScroll ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)'}; color:${syncScroll ? '#4ade80' : 'var(--text-secondary)'}; border:1px solid ${syncScroll ? '#4ade8055' : 'rgba(255,255,255,0.1)'}; border-radius:12px; padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              Sync Scroll ${syncScroll ? 'ON' : 'OFF'}
            </button>
          </div>
        `;
      };

      const renderFrames = () => {
        return activeDevices.map(d => {
          const dw = d.rotate ? d.height : d.width;
          const dh = d.rotate ? d.width : d.height;
          return `
            <div class="rv-frame-wrapper" data-uid="${d.uid}" style="display:flex; flex-direction:column; align-items:center; flex-shrink:0;">
              <div style="display:flex; justify-content:space-between; width:${dw * d.scale}px; margin-bottom:8px; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-secondary);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect></svg>
                  <span style="color:#fff; font-weight:600;">${d.name}</span>
                  <div style="display:flex; align-items:center; gap:4px; font-family:monospace; background:rgba(255,255,255,0.05); border-radius:4px; padding:2px;">
                    <input type="number" class="rv-dim-input" data-uid="${d.uid}" data-axis="w" value="${dw}" style="width:36px; background:none; border:none; color:var(--text-secondary); font-family:monospace; font-size:10px; text-align:right; outline:none;-moz-appearance:textfield;"/>
                    <span style="color:rgba(255,255,255,0.2);">×</span>
                    <input type="number" class="rv-dim-input" data-uid="${d.uid}" data-axis="h" value="${dh}" style="width:36px; background:none; border:none; color:var(--text-secondary); font-family:monospace; font-size:10px; text-align:left; outline:none;-moz-appearance:textfield;"/>
                  </div>
                  <span style="font-family:monospace;">· ${Math.round(d.scale * 100)}%</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="rv-rotate-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Rotate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg></button>
                  <button class="rv-refresh-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Refresh"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></button>
                  <button class="rv-close-btn" data-uid="${d.uid}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:0;" title="Close">&times;</button>
                </div>
              </div>
              <div class="rv-iframe-container" style="width:${dw * d.scale}px; height:${dh * d.scale}px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden; position:relative; background:#fff; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
                <iframe src="${window.location.href}" style="width:${dw}px; height:${dh}px; transform:scale(${d.scale}); transform-origin:top left; border:none; position:absolute; top:0; left:0; pointer-events:auto;"></iframe>
                <div class="rv-resize-handle" data-uid="${d.uid}" style="position:absolute; bottom:0; right:0; width:20px; height:20px; cursor:nwse-resize; z-index:10; background:linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%); border-bottom-right-radius:10px;"></div>
              </div>
            </div>
          `;
        }).join("");
      };

      const setupIframes = () => {
        const iframes = overlay.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          iframe.onload = () => {
            try {
              const win = iframe.contentWindow;
              if (!win) return;
              win.addEventListener('scroll', (e) => {
                if (!syncScroll || isSyncing) return;
                isSyncing = true;
                
                const doc = win.document.documentElement;
                const percentX = win.scrollX / (doc.scrollWidth - doc.clientWidth || 1);
                const percentY = win.scrollY / (doc.scrollHeight - doc.clientHeight || 1);
                
                iframes.forEach(other => {
                  if (other !== iframe) {
                    try {
                      const otherWin = other.contentWindow;
                      const otherDoc = otherWin.document.documentElement;
                      otherWin.scrollTo(
                        percentX * (otherDoc.scrollWidth - otherDoc.clientWidth),
                        percentY * (otherDoc.scrollHeight - otherDoc.clientHeight)
                      );
                    } catch (err) {}
                  }
                });
                
                requestAnimationFrame(() => { isSyncing = false; });
              });
            } catch(e) {
              console.warn("Cross-origin iframe blocked sync scrolling");
            }
          };
        });
      };

      const updateUI = () => {
        overlay.querySelector("#rv-header-slot").innerHTML = renderHeader();
        overlay.querySelector("#rv-frames-slot").innerHTML = renderFrames();

        // Bind Sync Toggle
        overlay.querySelector("#rv-sync-btn").onclick = () => {
          syncScroll = !syncScroll;
          updateUI();
        };

        // Bind Add Dropdown
        const addBtn = overlay.querySelector("#rv-add-device-btn");
        const addDrop = overlay.querySelector("#rv-add-dropdown");
        addBtn.onclick = () => {
          addDrop.style.display = addDrop.style.display === "none" ? "block" : "none";
        };

        overlay.querySelectorAll(".rv-cat-item").forEach(item => {
          item.onmouseenter = () => item.style.background = "rgba(255,255,255,0.1)";
          item.onmouseleave = () => item.style.background = "transparent";
          item.onclick = () => {
            const catId = item.getAttribute("data-id");
            const cat = DEVICE_CATALOG.find(c => c.id === catId);
            if (cat) {
              activeDevices.push({ ...cat, uid: Date.now(), rotate: false });
              updateUI();
            }
          };
        });

        // Close dropdown when clicking outside
        overlay.onclick = (e) => {
          if (!e.target.closest("#rv-add-device-btn") && !e.target.closest("#rv-add-dropdown")) {
            if(addDrop) addDrop.style.display = "none";
          }
        };

        // Bind frames logic
        overlay.querySelectorAll(".rv-close-device-btn, .rv-close-btn").forEach(btn => {
          btn.onclick = () => {
            activeDevices = activeDevices.filter(d => d.uid != btn.getAttribute("data-uid"));
            updateUI();
          };
        });

        overlay.querySelectorAll(".rv-rotate-btn").forEach(btn => {
          btn.onclick = () => {
            const dev = activeDevices.find(d => d.uid == btn.getAttribute("data-uid"));
            if (dev) {
              dev.rotate = !dev.rotate;
              updateUI();
            }
          };
        });

        overlay.querySelectorAll(".rv-refresh-btn").forEach(btn => {
          btn.onclick = () => updateUI();
        });

        // Instant inputs
        overlay.querySelectorAll(".rv-dim-input").forEach(input => {
          input.onkeyup = (e) => {
            const dev = activeDevices.find(d => d.uid == input.getAttribute("data-uid"));
            if (dev) {
              const val = parseInt(e.target.value) || 100;
              if (input.getAttribute("data-axis") === "w") {
                if (dev.rotate) dev.height = val; else dev.width = val;
              } else {
                if (dev.rotate) dev.width = val; else dev.height = val;
              }
              // Only update the specific frame visually to prevent input losing focus
              const wrapper = overlay.querySelector(`.rv-frame-wrapper[data-uid="${dev.uid}"]`);
              if (wrapper) {
                const dw = dev.rotate ? dev.height : dev.width;
                const dh = dev.rotate ? dev.width : dev.height;
                const container = wrapper.querySelector('.rv-iframe-container');
                const iframe = container.querySelector('iframe');
                
                wrapper.firstElementChild.style.width = `${dw * dev.scale}px`;
                container.style.width = `${dw * dev.scale}px`;
                container.style.height = `${dh * dev.scale}px`;
                iframe.style.width = `${dw}px`;
                iframe.style.height = `${dh}px`;
              }
            }
          };
          input.onchange = () => updateUI(); // Full re-render on blur
        });

        // Fluid Resizing Handles
        overlay.querySelectorAll(".rv-resize-handle").forEach(handle => {
          let startX, startY, startW, startH, dev, wrapper, container, iframe, inputs;
          
          handle.onmousedown = (e) => {
            e.preventDefault();
            const uid = handle.getAttribute("data-uid");
            dev = activeDevices.find(d => d.uid == uid);
            if (!dev) return;

            wrapper = overlay.querySelector(`.rv-frame-wrapper[data-uid="${dev.uid}"]`);
            container = wrapper.querySelector('.rv-iframe-container');
            iframe = container.querySelector('iframe');
            inputs = wrapper.querySelectorAll('.rv-dim-input');
            
            startX = e.clientX;
            startY = e.clientY;
            startW = dev.rotate ? dev.height : dev.width;
            startH = dev.rotate ? dev.width : dev.height;

            // Block iframe pointer events during drag
            overlay.querySelectorAll('iframe').forEach(ifr => ifr.style.pointerEvents = 'none');

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          };

          const onMouseMove = (e) => {
            const dx = (e.clientX - startX) / dev.scale;
            const dy = (e.clientY - startY) / dev.scale;
            
            const newW = Math.max(200, Math.round(startW + dx));
            const newH = Math.max(200, Math.round(startH + dy));
            
            if (dev.rotate) {
              dev.height = newW;
              dev.width = newH;
            } else {
              dev.width = newW;
              dev.height = newH;
            }

            // Update DOM instantly
            wrapper.firstElementChild.style.width = `${newW * dev.scale}px`;
            container.style.width = `${newW * dev.scale}px`;
            container.style.height = `${newH * dev.scale}px`;
            iframe.style.width = `${newW}px`;
            iframe.style.height = `${newH}px`;
            
            inputs[0].value = newW;
            inputs[1].value = newH;
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            overlay.querySelectorAll('iframe').forEach(ifr => ifr.style.pointerEvents = 'auto');
            updateUI(); // Full re-render to sync headers
          };
        });

        setupIframes();
      };

      overlay.innerHTML = `
        <!-- Top bar -->
        <div style="display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); gap:20px; background:#12141a; position:relative; z-index:20;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple, #b8a3fc)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            <span style="font-size: 16px; font-weight: 600;">Responsive Viewer</span>
            <div style="width:6px; height:6px; background:#4ade80; border-radius:50%; box-shadow:0 0 8px #4ade80;"></div>
          </div>
          
          <div id="rv-header-slot" style="display:flex; align-items:center; gap:12px; flex:1;"></div>

          <button id="rv-exit-btn" style="margin-left:auto; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-secondary); cursor:pointer; padding:6px 12px; display:flex; align-items:center; gap:6px; font-size:11px; transition:background 0.2s;">
            <span style="font-family:monospace;">Esc</span> close
          </button>
        </div>
        
        <!-- Frames Area -->
        <div id="rv-frames-slot" class="custom-scroll" style="flex:1; display:flex; gap:40px; padding:40px; overflow-x:auto; overflow-y:auto; background:#0d0f14;"></div>
      `;

      state.shadowRoot.appendChild(overlay);

      overlay.querySelector("#rv-exit-btn").onclick = () => {
        overlay.style.display = "none";
        deactivateCurrentTool();
      };
      
      overlay.querySelector("#rv-exit-btn").onmouseenter = (e) => e.target.style.background = "rgba(255,255,255,0.1)";
      overlay.querySelector("#rv-exit-btn").onmouseleave = (e) => e.target.style.background = "rgba(255,255,255,0.05)";

      updateUI();
    } else {
      overlay.style.display = "flex";
    }
}
