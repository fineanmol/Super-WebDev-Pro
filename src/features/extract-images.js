import { state } from '../state.js';
import { openDrawer, closeDrawer } from '../ui/drawer.js';
import { showToast } from '../ui/toast.js';
export function setupExtractImages() {
    const imagesMap = new Map();

    const addImage = (src, type, alt = "") => {
      if (!src) return;
      if (!src.startsWith("http") && !src.startsWith("data:")) return;
      if (!imagesMap.has(src)) {
        imagesMap.set(src, {
          id: Math.random().toString(36).substring(2, 10),
          src,
          type,
          alt,
          width: 0,
          height: 0,
          sizeClass: "Unknown"
        });
      }
    };

    // 1. Favicons
    document.querySelectorAll("link[rel*='icon']").forEach(el => {
      if (el.href) addImage(el.href, "Favicon");
    });

    // 2. OG Images
    document.querySelectorAll("meta[property='og:image'], meta[name='twitter:image']").forEach(el => {
      if (el.content) addImage(el.content, "OG");
    });

    // 3. Img tags
    document.querySelectorAll("img").forEach(img => {
      if (img.src) addImage(img.src, "Image", img.alt);
    });

    // 4. Background images
    document.querySelectorAll("*").forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\(['"]?(https?:\/\/[^'"]+|data:image\/[^'"]+)['"]?\)/);
        if (match) addImage(match[1], "Background");
      }
    });

    // 5. SVGs
    document.querySelectorAll("svg").forEach(svg => {
      if (svg.parentElement && svg.parentElement.tagName.toLowerCase() === "svg") return; // Skip nested
      try {
        const svgString = new XMLSerializer().serializeToString(svg);
        const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
        addImage(encoded, "SVG", "Inline SVG");
      } catch(e) {}
    });

    let imagesList = Array.from(imagesMap.values());
    let activeTypeFilter = "All";
    let activeSizeFilter = "All";
    let searchQuery = "";

    const renderGrid = (slot) => {
      const filtered = imagesList.filter(img => {
        if (activeTypeFilter !== "All" && img.type !== activeTypeFilter) return false;
        // Size filter placeholder logic
        if (activeSizeFilter === "Small" && img.width > 200) return false;
        if (activeSizeFilter === "Medium" && (img.width <= 200 || img.width > 800)) return false;
        if (activeSizeFilter === "Large" && img.width <= 800) return false;
        
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return img.src.toLowerCase().includes(q) || img.alt.toLowerCase().includes(q);
        }
        return true;
      });

      const listHTML = filtered.map(img => `
        <div class="img-card" style="background:#15151b; border:1px solid rgba(255,255,255,0.08); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; position:relative;">
          <!-- Checkerboard background pattern -->
          <div style="background-image: linear-gradient(45deg, #1c1c24 25%, transparent 25%), linear-gradient(-45deg, #1c1c24 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c24 75%), linear-gradient(-45deg, transparent 75%, #1c1c24 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px; height:120px; display:flex; justify-content:center; align-items:center; position:relative;">
            <img src="${img.src}" style="max-width:100%; max-height:100%; object-fit:contain;" onload="this.setAttribute('data-loaded', 'true'); this.parentElement.nextElementSibling.querySelector('.img-res').textContent = this.naturalWidth + 'x' + this.naturalHeight;" />
            <button style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); border:none; border-radius:4px; color:#fff; width:24px; height:24px; display:flex; justify-content:center; align-items:center; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            </button>
            <div style="position:absolute; top:8px; left:8px; background:var(--accent-purple); color:#fff; font-size:9px; font-weight:600; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${img.type}</div>
          </div>
          <div style="padding:10px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); background:#0a0a0f;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-family:monospace; font-size:10px; color:var(--text-secondary); max-width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${img.src}">${img.id}</span>
              <span class="img-res" style="font-family:monospace; font-size:10px; color:#fff; font-weight:600;">-</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="extract-img-copy-btn" data-url="${img.src}" style="background:rgba(255,255,255,0.05); border:none; border-radius:4px; padding:6px; cursor:pointer; color:var(--text-secondary);" title="Copy URL"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
              <button class="extract-img-open-btn" data-url="${img.src}" style="background:rgba(255,255,255,0.05); border:none; border-radius:4px; padding:6px; cursor:pointer; color:var(--text-secondary);" title="Open in new tab"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></button>
              <button class="extract-img-dl-btn" data-url="${img.src}" style="background:var(--accent-purple); border:none; border-radius:4px; padding:4px 8px; cursor:pointer; color:#fff; display:flex; align-items:center; gap:4px; font-weight:600; font-size:10px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download</button>
            </div>
          </div>
        </div>
      `).join("");

      slot.querySelector("#images-grid-slot").innerHTML = listHTML || '<div style="font-size:12px; color:var(--text-secondary); text-align:center; padding:20px; grid-column:span 2;">No image resources found matching filters.</div>';
      slot.querySelector("#img-count-slot").textContent = filtered.length;

      // Re-attach event listeners
      slot.querySelectorAll(".extract-img-copy-btn").forEach(btn => {
        btn.onclick = () => {
          navigator.clipboard.writeText(btn.getAttribute("data-url"));
          showToast("Copied image URL!");
        };
      });
      slot.querySelectorAll(".extract-img-open-btn").forEach(btn => {
        btn.onclick = () => window.open(btn.getAttribute("data-url"), "_blank");
      });
      slot.querySelectorAll(".extract-img-dl-btn").forEach(btn => {
        btn.onclick = async () => {
          const url = btn.getAttribute("data-url");
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `extracted_image_${Date.now()}`;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          } catch(e) {
            // Fallback if fetch fails (e.g. CORS block)
            const a = document.createElement("a");
            a.href = url;
            a.download = `extracted_image_${Date.now()}`;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        };
      });
    };

    const typeChips = ["All", "Image", "Favicon", "OG", "Background"].map(t => `
      <button class="type-filter-chip ${activeTypeFilter === t ? "active" : ""}" data-type="${t}" style="background:${activeTypeFilter === t ? "var(--accent-purple)" : "rgba(255,255,255,0.05)"}; color:#fff; border:none; border-radius:12px; padding:4px 10px; font-size:11px; cursor:pointer;">${t}</button>
    `).join("");

    const sizeChips = ["All", "Small", "Medium", "Large"].map(s => `
      <button class="size-filter-chip ${activeSizeFilter === s ? "active" : ""}" data-size="${s}" style="background:${activeSizeFilter === s ? "rgba(255,255,255,0.15)" : "none"}; color:var(--text-secondary); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:4px 10px; font-size:11px; cursor:pointer;">${s}</button>
    `).join("");

    const contentHTML = `
      <div style="margin-bottom:16px;">
        <div style="position:relative; margin-bottom:12px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" style="position:absolute; left:12px; top:10px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="img-search-input" placeholder="Search URL or Alt text" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 8px 8px 32px; color:#fff; font-size:12px; outline:none;" />
          <div style="position:absolute; right:8px; top:8px; background:rgba(239,68,68,0.15); color:#ef4444; border-radius:4px; padding:2px 6px; font-size:9px; font-weight:700; display:flex; align-items:center; gap:4px;">
            <div style="width:4px; height:4px; background:#ef4444; border-radius:50%; box-shadow:0 0 4px #ef4444;"></div> LIVE
          </div>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll" id="type-filters-slot">
            ${typeChips}
          </div>
          <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll" id="size-filters-slot">
            ${sizeChips}
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:12px; color:var(--text-primary); font-weight:600;">
          Found <span id="img-count-slot" style="color:var(--accent-purple);">${imagesList.length}</span> Images
        </div>
        <div style="display:flex; gap:8px;">
          <button id="extract-dl-all-btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:4px 8px; color:#fff; font-size:10px; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download all
          </button>
        </div>
      </div>

      <div id="images-grid-slot" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-height:400px; overflow-y:auto; padding-right:4px;" class="custom-scroll">
      </div>
    `;

    openDrawer("Extract Images", "Media asset download center", contentHTML, (slot) => {
      renderGrid(slot);

      // Search
      slot.querySelector("#img-search-input").addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderGrid(slot);
      });

      // Type chips
      slot.querySelectorAll(".type-filter-chip").forEach(chip => {
        chip.onclick = () => {
          slot.querySelectorAll(".type-filter-chip").forEach(c => {
            c.style.background = "rgba(255,255,255,0.05)";
            c.classList.remove("active");
          });
          chip.style.background = "var(--accent-purple)";
          chip.classList.add("active");
          activeTypeFilter = chip.getAttribute("data-type");
          renderGrid(slot);
        };
      });

      // Size chips
      slot.querySelectorAll(".size-filter-chip").forEach(chip => {
        chip.onclick = () => {
          slot.querySelectorAll(".size-filter-chip").forEach(c => {
            c.style.background = "none";
            c.style.color = "var(--text-secondary)";
            c.classList.remove("active");
          });
          chip.style.background = "rgba(255,255,255,0.15)";
          chip.style.color = "#fff";
          chip.classList.add("active");
          activeSizeFilter = chip.getAttribute("data-size");
          renderGrid(slot);
        };
      });

      // Download All
      const dlAllBtn = slot.querySelector("#extract-dl-all-btn");
      dlAllBtn.onclick = () => {
        showToast("Downloading filtered images...");
        const filtered = imagesList.filter(img => {
          if (activeTypeFilter !== "All" && img.type !== activeTypeFilter) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return img.src.toLowerCase().includes(q) || img.alt.toLowerCase().includes(q);
          }
          return true;
        });
        filtered.forEach((img, idx) => {
          setTimeout(async () => {
            try {
              const res = await fetch(img.src);
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              a.target = "_blank";
              a.download = `extracted-${img.type}-${idx + 1}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
            } catch(e) {
              const a = document.createElement("a");
              a.href = img.src;
              a.target = "_blank";
              a.download = `extracted-${img.type}-${idx + 1}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }, idx * 250);
        });
      };
    });
  }

