import { state } from '../state.js';
import { activateTool, deactivateCurrentTool, openCommandPalette } from '../core/tool-manager.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from './drawer.js';
import { openDashboardDrawer } from '../features/dashboard.js';
import { showToast } from './toast.js';

export   function ensureHUD() {
    if (state.hostEl) return;

    state.hostEl = document.createElement("div");
    state.hostEl.id = "super-webdev-hud-host";
    state.hostEl.style.position = "fixed";
    state.hostEl.style.top = "0";
    state.hostEl.style.left = "0";
    state.hostEl.style.width = "0";
    state.hostEl.style.height = "0";
    state.hostEl.style.zIndex = "2147483647";
    document.body.appendChild(state.hostEl);

    state.shadowRoot = state.hostEl.attachShadow({ mode: "open" });

    // Inject SVG turbulence displacement filters for glass refraction
    const svgFilters = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgFilters.style.display = "none";
    svgFilters.innerHTML = `
      <defs>
        <!-- Strong refraction filter (Scale: 22) -->
        <filter id="sdpv2-liquid-refract" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="blurNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurNoise" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        <!-- Soft refraction filter (Scale: 9) -->
        <filter id="sdpv2-liquid-refract-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.025" numOctaves="2" seed="3" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1" result="blurNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurNoise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    `;
    state.shadowRoot.appendChild(svgFilters);

    // CSS Styling sheet inside the shadow root (SuperDev Pro Styling Clone)
    const style = document.createElement("style");
    style.textContent = `
      :host {
        font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #f7f7fa;
        --bg-main: #0c0c0e;
        --border-color: rgba(255, 255, 255, 0.1);
        --text-primary: #f7f7fa;
        --text-secondary: #9a9aa3;
        --accent-purple: #b8a3fc;
        --accent-indigo: #6366f1;
        --accent-gradient: linear-gradient(135deg, #b8a3fc, #6366f1);
        --accent-emerald: #6ee7a8;
        --accent-rose: #f472b6;
        
        --glass-tint: #1212189e;
        --glass-tint-strong: #1c1c24c7;
        --glass-sheen: linear-gradient(160deg, #ffffff38 0%, #ffffff0a 38%, #fff0 60%, #ffffff0f 100%);
        --glass-edge: 1px solid #ffffff24;
        --glass-spec-top: inset 0 1px 0 #ffffff52;
        --glass-spec-bot: inset 0 -1px 0 #00000038;
        --glass-spec-ring: inset 0 0 0 1px #ffffff0f;
        --glass-blur: 28px;
        --glass-blur-sm: 16px;
        --glass-saturate: 180%;
        --glass-brightness: .85;
        --glass-shadow-sm: 0 2px 8px rgba(0,0,0,0.18), 0 8px 24px -8px rgba(0,0,0,0.35);
        --glass-shadow-md: 0 4px 14px rgba(0,0,0,0.22), 0 16px 40px -12px rgba(0,0,0,0.45);
        --glass-shadow-lg: 0 8px 22px rgba(0,0,0,0.28), 0 32px 80px -20px rgba(0,0,0,0.55);
        
        --sidebar-w: 56px;
        --panel-w: 320px;
        --t: .18s cubic-bezier(.32, .72, 0, 1);
        --t-spr: .32s cubic-bezier(.34, 1.56, .64, 1);
        --t-glide: .42s cubic-bezier(.22, 1, .36, 1);
      }

      /* Custom Webkit scrollbar for panels */
      .custom-scroll::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: #27272a;
        border-radius: 4px;
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background: #3f3f46;
      }

      /* 1. Sidebar Panel Layout */
      .sidebar-panel {
        position: fixed;
        width: var(--sidebar-w);
        max-height: calc(100vh - 32px);
        z-index: 2147483647;
        color: var(--text-primary);
        background: var(--glass-tint);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        border-radius: 28px;
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-spec-ring), var(--glass-shadow-md);
        transition: opacity var(--t-glide), transform var(--t-spr), box-shadow var(--t);
        isolation: isolate;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 8px 6px;
      }

      .sidebar-panel:before {
        content: "";
        border-radius: inherit;
        background: var(--glass-sheen);
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: .85;
        z-index: 0;
        filter: url(#sdpv2-liquid-refract-soft);
        position: absolute;
        inset: 0;
      }

      .sidebar-panel:after {
        content: "";
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(120% 60% at 50% -10%, #ffffff40, #0000 60%);
        position: absolute;
        inset: 0;
      }

      .sidebar-panel > * {
        z-index: 1;
        position: relative;
      }

      /* Position variants */
      .sidebar-right {
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
      }

      .sidebar-right.sidebar-hidden {
        transform: translate(25px, -50%) scale(.94);
        opacity: 0;
        pointer-events: none;
      }

      .sidebar-left {
        top: 50%;
        left: 16px;
        transform: translateY(-50%);
      }

      .sidebar-left.sidebar-hidden {
        transform: translate(-25px, -50%) scale(.94);
        opacity: 0;
        pointer-events: none;
      }

      /* Pinned Scrollable Middle section */
      .sidebar-pinned {
        scrollbar-width: none;
        flex-direction: column;
        flex: auto;
        gap: 6px;
        min-width: 0;
        min-height: 0;
        display: flex;
        overflow: hidden auto;
        -webkit-mask-image: linear-gradient(#0000 0, #000 10px calc(100% - 10px), #0000 100%);
        mask-image: linear-gradient(#0000 0, #000 10px calc(100% - 10px), #0000 100%);
        width: 100%;
        align-items: center;
      }
      
      .sidebar-pinned::-webkit-scrollbar {
        display: none;
      }

      /* Sidebar Buttons styling with liquid hover */
      .sidebar-btn {
        border: none;
        border-radius: 9999px;
        width: 42px;
        height: 42px;
        color: var(--text-secondary);
        background: transparent;
        cursor: pointer;
        transition: color var(--t), transform var(--t-spr), background var(--t);
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        display: flex;
        position: relative;
      }

      .sidebar-btn:before {
        content: "";
        border-radius: inherit;
        box-shadow: none;
        transition: background var(--t), box-shadow var(--t-spr), transform var(--t-spr);
        pointer-events: none;
        z-index: 0;
        background: transparent;
        position: absolute;
        inset: 4px;
      }

      .sidebar-btn > * {
        z-index: 1;
        position: relative;
      }

      .sidebar-btn:hover {
        color: var(--text-primary);
        transform: scale(1.08);
      }

      .sidebar-btn:hover:before {
        background: var(--glass-tint-strong);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), inset 0 0 0 1px rgba(255,255,255,0.18);
      }

      .sidebar-btn.active-tool {
        color: var(--accent-purple);
      }

      .sidebar-btn.active-tool:before {
        background: radial-gradient(120% 80% at 50% 0%, var(--accent-indigo), rgba(99, 102, 241, 0.2) 70%);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
      }

      .sidebar-divider {
        background: linear-gradient(90deg, #0000, rgba(255,255,255,0.12) 30% 70%, #0000);
        height: 1px;
        width: calc(100% - 12px);
        margin: 4px 0;
        flex-shrink: 0;
      }

      /* Hover Tooltips sliding */
      .sidebar-tip {
        background: var(--glass-tint-strong);
        -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        color: var(--text-primary);
        border-radius: 12px;
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-shadow-sm);
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--t), transform var(--t-spr);
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        position: absolute;
        top: 50%;
      }

      .sidebar-right .sidebar-tip {
        right: calc(100% + 14px);
        transform: translateY(-50%) translate(6px);
      }

      .sidebar-right .sidebar-btn:hover .sidebar-tip {
        opacity: 1;
        transform: translateY(-50%) translate(0);
      }

      .sidebar-left .sidebar-tip {
        left: calc(100% + 14px);
        transform: translateY(-50%) translate(-6px);
      }

      .sidebar-left .sidebar-btn:hover .sidebar-tip {
        opacity: 1;
        transform: translateY(-50%) translate(0);
      }

      /* 2. Floating Reopen Edge Tab */
      .reopen-tab {
        position: fixed;
        z-index: 2147483647;
        color: var(--text-secondary);
        background: var(--glass-tint);
        -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-shadow-sm);
        cursor: pointer;
        transition: all var(--t-spr);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 48px;
      }

      .reopen-tab:before {
        content: "";
        border-radius: inherit;
        background: var(--glass-sheen);
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: .85;
        z-index: 0;
        filter: url(#sdpv2-liquid-refract-soft);
        position: absolute;
        inset: 0;
      }

      .reopen-tab-right {
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 12px 0 0 12px;
        border-right: none;
      }

      .reopen-tab-right:hover {
        width: 32px;
        color: var(--text-primary);
      }

      .reopen-tab-left {
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 0 12px 12px 0;
        border-left: none;
      }

      .reopen-tab-left:hover {
        width: 32px;
        color: var(--text-primary);
      }

      /* 3. Panel Drawer Container */
      .drawer-panel {
        position: fixed;
        width: var(--panel-w);
        height: calc(100vh - 32px);
        background: var(--glass-tint-strong);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
        border: var(--glass-edge);
        box-shadow: var(--glass-spec-top), var(--glass-spec-bot), var(--glass-shadow-lg);
        border-radius: 20px;
        transition: all var(--t-glide);
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        opacity: 0;
        pointer-events: none;
      }

      .drawer-panel:before {
        content: "";
        border-radius: inherit;
        background: var(--glass-sheen);
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: .85;
        z-index: 0;
        filter: url(#sdpv2-liquid-refract-soft);
        position: absolute;
        inset: 0;
      }

      .drawer-panel > * {
        z-index: 1;
        position: relative;
      }

      /* Drawer positioning — drawer is sibling of sidebar, not child, so use standalone classes */
      .drawer-panel.visible {
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      .drawer-panel-right {
        top: 16px;
        right: calc(var(--sidebar-w) + 26px);
        transform: translateX(15px);
      }

      .drawer-panel-right.visible {
        transform: translateX(0) !important;
      }

      .drawer-panel-left {
        top: 16px;
        left: calc(var(--sidebar-w) + 26px);
        transform: translateX(-15px);
      }

      .drawer-panel-left.visible {
        transform: translateX(0) !important;
      }

      .drawer-header {
        padding: 18px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .drawer-title {
        font-size: 16px;
        font-weight: 700;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
      }

      .drawer-subtitle {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .drawer-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .drawer-close:hover {
        color: var(--text-primary);
      }

      .drawer-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }

      /* Highlight Overlays */
      .highlight-overlay {
        position: fixed;
        border: 1px solid #ff4a4a; /* default red/pink */
        background-color: rgba(255, 74, 74, 0.05);
        pointer-events: none;
        z-index: 2147483640;
        display: none;
        border-radius: 4px;
        box-shadow: 0 0 8px rgba(255, 74, 74, 0.2);
        transition: border-color 0.1s, background-color 0.1s;
      }

      .highlight-guide-vl, .highlight-guide-vr, .highlight-guide-ht, .highlight-guide-hb {
        display: none;
        position: absolute;
        pointer-events: none;
      }

      .highlight-overlay.show-guides .highlight-guide-vl {
        display: block;
        top: -10000px;
        bottom: -10000px;
        left: -1px;
        width: 1px;
        border-left: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-overlay.show-guides .highlight-guide-vr {
        display: block;
        top: -10000px;
        bottom: -10000px;
        right: -1px;
        width: 1px;
        border-left: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-overlay.show-guides .highlight-guide-ht {
        display: block;
        left: -10000px;
        right: -10000px;
        top: -1px;
        height: 1px;
        border-top: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-overlay.show-guides .highlight-guide-hb {
        display: block;
        left: -10000px;
        right: -10000px;
        bottom: -1px;
        height: 1px;
        border-top: 1.5px dashed rgba(239, 68, 68, 0.55);
      }

      .highlight-label {
        position: fixed;
        background-color: var(--accent-purple);
        color: #0c0c0e;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 700;
        border-radius: 3px;
        pointer-events: none;
        z-index: 2147483641;
        display: none;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      /* CSS Inspector Hover Tooltip Card */
      .inspector-tooltip-card {
        position: fixed;
        display: none;
        z-index: 2147483645;
        width: 290px;
        background: rgba(11, 15, 25, 0.96);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        backdrop-filter: blur(14px) saturate(140%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        color: #f7f7fa;
        font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        overflow: hidden;
        pointer-events: none;
        font-size: 11px;
      }

      .tooltip-hierarchy {
        background: rgba(0, 0, 0, 0.25);
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-family: monospace;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.45);
        line-height: 1.4;
        word-break: break-all;
      }

      .tooltip-hierarchy-active {
        color: #4ade80; /* active green */
        font-weight: bold;
      }

      .tooltip-meta {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .tooltip-tag {
        font-size: 13px;
        font-weight: 700;
        color: #4ade80;
        font-family: monospace;
        margin-bottom: 4px;
      }

      .tooltip-meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.65);
        margin-top: 3px;
      }

      .tooltip-meta-row svg {
        color: rgba(255, 255, 255, 0.4);
      }

      .tooltip-css-block {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-family: monospace;
        font-size: 11px;
        max-height: 180px;
        overflow-y: auto;
        line-height: 1.45;
        scrollbar-width: none; /* Hide scrollbars for tooltips */
      }

      .tooltip-css-block::-webkit-scrollbar {
        display: none;
      }

      .css-p-row {
        display: flex;
        flex-wrap: wrap;
        padding: 2px 0;
      }

      .css-p-name {
        color: #38bdf8; /* light blue */
        margin-right: 4px;
      }

      .css-p-value {
        color: #f7f7fa;
        display: flex;
        align-items: center;
      }

      .css-p-swatch {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-right: 5px;
        box-shadow: 0 0 1px rgba(0,0,0,0.5);
      }

      .tooltip-footer {
        padding: 6px 12px;
        font-size: 9px;
        color: rgba(255, 255, 255, 0.35);
        background: rgba(0, 0, 0, 0.1);
      }

      .ruler-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 2147483639;
        display: none;
      }

      /* Command Palette Styles */
      .cmd-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 2147483647;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
        animation: fadeIn 0.15s ease-out;
      }

      .cmd-box {
        width: 480px;
        background: rgba(15, 15, 20, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .cmd-input {
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding: 16px;
        color: #fff;
        font-size: 14px;
        outline: none;
        font-family: inherit;
        box-sizing: border-box;
      }

      .cmd-list {
        max-height: 280px;
        overflow-y: auto;
        padding: 8px;
      }

      .cmd-item {
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-secondary);
        transition: all var(--t);
      }

      .cmd-item.active {
        background: rgba(184, 163, 252, 0.15);
        color: #f7f7fa;
      }

      .cmd-shortcut {
        font-size: 10px;
        font-family: monospace;
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        color: var(--text-secondary);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideDown {
        from { transform: translateY(-10px); }
        to { transform: translateY(0); }
      }

      /* Toast Notify */
      .hud-toast {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid var(--accent-purple);
        box-shadow: var(--glass-shadow-md);
        padding: 10px 20px;
        border-radius: 12px;
        color: #f7f7fa;
        font-size: 12px;
        font-weight: 600;
        z-index: 2147483647;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hud-toast.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* Audit Cards & Elements */
      .audit-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
      }
      
      .audit-card-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .audit-card-desc {
        font-size: 11px;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .audit-warning {
        border-left: 3px solid var(--accent-rose);
        background: rgba(244, 114, 182, 0.05);
      }

      .audit-success {
        border-left: 3px solid var(--accent-emerald);
        background: rgba(110, 231, 168, 0.05);
      }

      /* Box Model specs */
      .box-model-container {
        display: flex;
        justify-content: center;
        margin-top: 10px;
        font-family: monospace;
        font-size: 9px;
      }

      .box-model-layer {
        border: 1px dashed rgba(255, 255, 255, 0.2);
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        background: rgba(255,255,255,0.01);
      }

      .box-model-label {
        position: absolute;
        top: 2px;
        left: 4px;
        color: var(--text-secondary);
        font-size: 8px;
        text-transform: uppercase;
      }

      .box-model-margin { background: rgba(249, 115, 22, 0.05); border-color: rgba(249, 115, 22, 0.3); }
      .box-model-border { background: rgba(234, 179, 8, 0.05); border-color: rgba(234, 179, 8, 0.3); }
      .box-model-padding { background: rgba(110, 231, 168, 0.05); border-color: rgba(110, 231, 168, 0.3); }
      .box-model-content { background: rgba(184, 163, 252, 0.1); border-color: rgba(184, 163, 252, 0.4); padding: 8px 16px; font-weight: 700; color: #f7f7fa; }

      .inspector-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 16px;
      }

      .inspector-tab {
        flex: 1;
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 8px 0;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        border-bottom: 2px solid transparent;
        font-family: inherit;
      }

      .inspector-tab.active {
        color: var(--text-primary);
        border-bottom-color: var(--accent-purple);
      }

      .css-property-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        font-size: 11px;
        font-family: monospace;
      }

      .css-property-name {
        color: var(--accent-purple);
      }

      .css-property-value {
        color: var(--accent-emerald);
        text-align: right;
        max-width: 60%;
        word-break: break-all;
      }

      .css-editor-textarea {
        width: 100%;
        height: 150px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        resize: vertical;
        box-sizing: border-box;
      }

      /* ==========================================
       * INTERACTIVE CSS EDITOR DRAWER PANELS
       * ========================================== */
      .inspector-drawer-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: #f7f7fa;
      }

      .inspector-meta-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .inspector-meta-tag {
        font-size: 15px;
        font-weight: 700;
        color: #4ade80; /* Tag color green/purple */
        font-family: monospace;
      }

      .inspector-meta-right {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 11px;
      }

      .inspector-meta-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        transition: color 0.15s;
      }

      .inspector-meta-btn:hover {
        color: #f7f7fa;
      }

      .inspector-selector-bar {
        width: 100%;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.85);
        font-family: monospace;
        font-size: 11px;
        padding: 8px 12px;
        margin: 10px 0 14px 0;
        box-sizing: border-box;
        outline: none;
      }

      /* Row of 9 filter tabs */
      .inspector-filter-tabs {
        display: flex;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        padding: 3px;
        margin-bottom: 14px;
        gap: 2px;
      }

      .inspector-filter-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.45);
        border-radius: 5px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12.5px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .inspector-filter-btn:hover {
        color: #f7f7fa;
        background: rgba(255, 255, 255, 0.04);
      }

      .inspector-filter-btn.active {
        color: #b8a3fc;
        background: rgba(184, 163, 252, 0.15);
      }

      /* Properties rows */
      .inspector-properties-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 240px;
        overflow-y: auto;
        padding-right: 4px;
        margin-bottom: 12px;
      }

      .inspector-prop-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .inspector-prop-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .prop-eye-toggle {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        font-size: 11px;
        transition: color 0.15s;
      }

      .prop-eye-toggle.active {
        color: rgba(255, 255, 255, 0.55);
      }

      .prop-eye-toggle:hover {
        color: #f7f7fa;
      }

      .prop-label-name {
        font-family: monospace;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .inspector-prop-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1.5;
        justify-content: flex-end;
      }

      .prop-input-wrap {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 5px;
        padding: 3px 6px;
        width: 100%;
        max-width: 160px;
        box-sizing: border-box;
      }

      .prop-input-wrap input[type="text"] {
        background: none;
        border: none;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 11px;
        width: 100%;
        outline: none;
      }

      .prop-input-wrap select {
        background: transparent;
        border: none;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 11px;
        width: 100%;
        outline: none;
        cursor: pointer;
      }

      .prop-input-wrap select option {
        background: #121218;
        color: #f7f7fa;
      }

      /* Custom range slider */
      .prop-slider-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        max-width: 160px;
      }

      .prop-slider {
        -webkit-appearance: none;
        width: 65px;
        height: 3px;
        border-radius: 1.5px;
        background: rgba(255, 255, 255, 0.12);
        outline: none;
      }

      .prop-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #b8a3fc;
        cursor: pointer;
        transition: transform 0.1s;
      }

      .prop-slider::-webkit-slider-thumb:hover {
        transform: scale(1.3);
      }

      .prop-slider-num-box {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 4px;
        color: #f7f7fa;
        font-family: monospace;
        font-size: 10px;
        width: 25px;
        text-align: center;
        padding: 2px 0;
        outline: none;
      }

      .prop-slider-unit {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
        font-family: monospace;
      }

      .prop-color-picker-swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-right: 4px;
        flex-shrink: 0;
      }

      .add-prop-btn {
        background: none;
        border: none;
        color: #b8a3fc;
        font-size: 11px;
        cursor: pointer;
        padding: 4px 0;
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
        margin-top: 2px;
      }

      .add-prop-btn:hover {
        text-decoration: underline;
      }

      /* Raw CSS block pane */
      .inspector-css-pane {
        margin-top: 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 140px;
      }

      .inspector-css-pane-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .inspector-css-pane-title {
        font-size: 10.5px;
        font-family: monospace;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
      }

      .inspector-css-pane-actions {
        display: flex;
        gap: 6px;
      }

      .inspector-css-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        color: rgba(255, 255, 255, 0.65);
        font-family: inherit;
        font-size: 9.5px;
        padding: 2px 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s;
      }

      .inspector-css-btn:hover {
        color: #f7f7fa;
        background: rgba(255, 255, 255, 0.07);
      }

      .inspector-css-code-box {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 6px;
        padding: 10px;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.45;
        overflow-y: auto;
        flex: 1;
        white-space: pre-wrap;
        color: #f7f7fa;
      }

      .inspector-css-code-box .css-p-swatch {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-right: 5px;
        vertical-align: middle;
        box-shadow: 0 0 1px rgba(0,0,0,0.5);
      }

      /* Inspector Footer */
      .inspector-drawer-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        margin-top: 10px;
      }

      .inspector-footer-key {
        font-size: 9px;
        font-family: monospace;
        background: rgba(255, 255, 255, 0.04);
        padding: 1px 5px;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.35);
      }

      /* Swatches & grid elements */
      .fonts-grid, .color-swatches-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .font-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .font-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(184, 163, 252, 0.3);
      }

      .font-card-name {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .font-card-preview {
        font-size: 10px;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .swatch-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .swatch-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-2px);
      }

      .swatch-color {
        width: 100%;
        height: 40px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .swatch-text {
        font-size: 10px;
        font-weight: 600;
        font-family: monospace;
      }

      .images-gallery {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .img-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .img-thumb-container {
        width: 100%;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.25);
        border-radius: 4px;
        overflow: hidden;
      }

      .img-thumb {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .img-meta {
        font-size: 9px;
        color: var(--text-secondary);
        display: flex;
        justify-content: space-between;
      }

      .img-actions {
        display: flex;
        gap: 4px;
      }

      .img-actions button {
        flex: 1;
        padding: 4px 0;
        font-size: 9px;
        font-weight: 600;
      }

      .hud-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        padding: 6px 12px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: inherit;
      }

      .hud-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      .hud-btn.primary {
        background: var(--accent-gradient);
        border: none;
        font-weight: 600;
      }
      
      .hud-btn.primary:hover {
        opacity: 0.9;
      }

      .hud-btn.danger {
        background: rgba(244, 114, 182, 0.15);
        color: var(--accent-rose);
        border-color: rgba(244, 114, 182, 0.2);
      }

      .hud-btn.danger:hover {
        background: rgba(244, 114, 182, 0.25);
      }

      .hud-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Screenshot Preview Modal */
      .screenshot-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
      }

      .screenshot-content {
        background: #0c0c0e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 20px;
        max-width: 80%;
        max-height: 85%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-shadow: var(--glass-shadow-lg);
      }

      .screenshot-img-container {
        overflow: auto;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.05);
        background: #000;
        max-height: 50vh;
        display: flex;
        justify-content: center;
      }

      .screenshot-img-container img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
      }

      .screenshot-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      /* Visual SEO link mock preview */
      .seo-preview-box {
        background: #ffffff;
        color: #1a0dab;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #dadce0;
        margin-top: 10px;
        font-family: Arial, sans-serif;
      }

      .seo-preview-url {
        color: #202124;
        font-size: 12px;
        margin-bottom: 4px;
        word-break: break-all;
      }

      .seo-preview-title {
        font-size: 19px;
        margin: 0 0 4px 0;
        cursor: pointer;
      }

      .seo-preview-desc {
        color: #4d5156;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
      }

      /* History items logger inside drawer */
      .drawer-history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 11px;
      }

      .drawer-history-name {
        color: var(--text-secondary);
        font-family: monospace;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 180px;
        overflow: hidden;
      }
    `;
    state.shadowRoot.appendChild(style);

    // Render 2. REOPEN Edge Handle Tab
    state.reopenTabEl = document.createElement("div");
    state.reopenTabEl.className = "reopen-tab reopen-tab-right";
    state.reopenTabEl.style.display = "none";
    state.reopenTabEl.innerHTML = `<span>◀</span>`;
    state.shadowRoot.appendChild(state.reopenTabEl);

    // Render 3. SIDEBAR PANEL Dashboard (floating right)
    state.sidebarEl = document.createElement("div");
    state.sidebarEl.className = "sidebar-panel sidebar-right";
    
    // Build buttons HTML
    state.sidebarEl.innerHTML = `
      <!-- Top header branding -->
      <button class="sidebar-btn" id="sbtn-dashboard" title="SuperDev Pro">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <div class="sidebar-tip">SuperDev Pro</div>
      </button>
      
      <div class="sidebar-divider"></div>
      
      <!-- Pinned Tools scroll area -->
      <div class="sidebar-pinned custom-scroll">
        <button class="sidebar-btn" id="sbtn-css-inspector" title="CSS Inspector">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div class="sidebar-tip">CSS Inspector</div>
        </button>
        <button class="sidebar-btn" id="sbtn-live-text-editor" title="Text Editor">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <div class="sidebar-tip">Text Editor</div>
        </button>
        <button class="sidebar-btn" id="sbtn-fonts-changer" title="Font Changer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
          <div class="sidebar-tip">Font Changer</div>
        </button>
        <button class="sidebar-btn" id="sbtn-list-fonts" title="List Fonts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          <div class="sidebar-tip">List Fonts</div>
        </button>
        <button class="sidebar-btn" id="sbtn-color-picker" title="Color Picker">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><circle cx="15.5" cy="10" r="1.5" fill="currentColor"/></svg>
          <div class="sidebar-tip">Color Picker</div>
        </button>
        <button class="sidebar-btn" id="sbtn-color-palette" title="Color Palette">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"></circle><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line></svg>
          <div class="sidebar-tip">Color Palette</div>
        </button>
        <button class="sidebar-btn" id="sbtn-move-element" title="Move Element">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
          <div class="sidebar-tip">Move Element</div>
        </button>
        <button class="sidebar-btn" id="sbtn-delete-element" title="Delete Element">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
          <div class="sidebar-tip">Delete Element</div>
        </button>
        <button class="sidebar-btn" id="sbtn-export-element" title="Export Element">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <div class="sidebar-tip">Export Element</div>
        </button>
        <button class="sidebar-btn" id="sbtn-extract-images" title="Extract Images">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <div class="sidebar-tip">Extract Images</div>
        </button>
        <button class="sidebar-btn" id="sbtn-page-ruler" title="Page Ruler">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M2 6l4 6-4 6M22 6l-4 6 4 6"></path></svg>
          <div class="sidebar-tip">Page Ruler</div>
        </button>
        <button class="sidebar-btn" id="sbtn-page-outliner" title="Outliner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
          <div class="sidebar-tip">Outliner</div>
        </button>
        <button class="sidebar-btn" id="sbtn-image-replacer" title="Image Swap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
          <div class="sidebar-tip">Image Swap</div>
        </button>
        <button class="sidebar-btn" id="sbtn-take-screenshot" title="Screenshot">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <div class="sidebar-tip">Screenshot</div>
        </button>
        <button class="sidebar-btn" id="sbtn-responsive-viewer" title="Responsive Viewer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          <div class="sidebar-tip">Responsive Viewer</div>
        </button>
        
        <div class="sidebar-divider"></div>
        
        <!-- Audits & Widgets -->
        <button class="sidebar-btn" id="sbtn-tech-stack" title="Tech Stack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <div class="sidebar-tip">Tech Stack</div>
        </button>
        <button class="sidebar-btn" id="sbtn-seo-meta" title="SEO Meta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <div class="sidebar-tip">SEO Meta</div>
        </button>
        <button class="sidebar-btn" id="sbtn-a11y-audit" title="A11y Audit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M6 20v-2a6 6 0 0 1 12 0v2"></path></svg>
          <div class="sidebar-tip">A11y Audit</div>
        </button>
      </div>
      
      <div class="sidebar-divider"></div>
      
      <!-- Bottom static actions -->
      <button class="sidebar-btn" id="sbtn-cmd-palette" title="Command Palette">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
        <div class="sidebar-tip">Command Palette (Cmd+Shift+P)</div>
      </button>
      <button class="sidebar-btn" id="sbtn-settings-position" title="Dock Position">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path></svg>
        <div class="sidebar-tip">Dock Position (Left/Right)</div>
      </button>
      <button class="sidebar-btn" id="sbtn-settings-drawer" title="Settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <div class="sidebar-tip">Settings</div>
      </button>
      <button class="sidebar-btn" id="sbtn-power" title="Turn Off WebDev Pro" style="color: var(--accent-rose);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        <div class="sidebar-tip">Turn Off WebDev Pro</div>
      </button>
      <button class="sidebar-btn" id="sbtn-collapse" title="Hide Sidebar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <div class="sidebar-tip">Hide Sidebar (Cmd+Shift+E)</div>
      </button>
    `;
    state.shadowRoot.appendChild(state.sidebarEl);

    // Render 4. PANEL DRAWER (slides adjacent to sidebar)
    state.drawerEl = document.createElement("div");
    state.drawerEl.className = "drawer-panel drawer-panel-right"; // default right-side position
    state.drawerEl.innerHTML = `
      <div class="drawer-header">
        <div>
          <h3 class="drawer-title" id="drawer-title-slot">Tool Details</h3>
          <div class="drawer-subtitle" id="drawer-sub-slot">Select a tool to display diagnostics</div>
        </div>
        <button class="drawer-close" id="drawer-close-btn">&times;</button>
      </div>
      <div class="drawer-content custom-scroll" id="drawer-content-slot">
        <!-- Render content dynamic templates -->
      </div>
    `;
    state.shadowRoot.appendChild(state.drawerEl);

    // Highlight Overlays
    state.highlightOverlay = document.createElement("div");
    state.highlightOverlay.className = "highlight-overlay";
    ["vl", "vr", "ht", "hb"].forEach(g => {
      const guide = document.createElement("div");
      guide.className = `highlight-guide-${g}`;
      state.highlightOverlay.appendChild(guide);
    });
    state.shadowRoot.appendChild(state.highlightOverlay);

    state.highlightLabel = document.createElement("div");
    state.highlightLabel.className = "highlight-label";
    state.shadowRoot.appendChild(state.highlightLabel);

    state.inspectorTooltip = document.createElement("div");
    state.inspectorTooltip.className = "inspector-tooltip-card";
    state.shadowRoot.appendChild(state.inspectorTooltip);

    // Ruler Canvas
    state.rulerCanvas = document.createElement("canvas");
    state.rulerCanvas.className = "ruler-canvas";
    state.shadowRoot.appendChild(state.rulerCanvas);

    // Toast Notification
    state.toastEl = document.createElement("div");
    state.toastEl.className = "hud-toast";
    state.toastEl.innerHTML = `<span>✔️</span> <span id="toast-text-slot">Action Completed</span>`;
    state.shadowRoot.appendChild(state.toastEl);

    // Wire up events
    setupSidebarEvents();
    loadPersistentSettings();
  }

  // Persistent Settings

export   function loadPersistentSettings() {
    // All tools are free; isPremium is retained only for backward compatibility
    // with any persisted state and always resolves to unlocked.
    state.isPremium = true;
    chrome.storage.local.get(["sidebarPosition"], (res) => {
      if (res.sidebarPosition === "left") {
        setSidebarPosition("left");
      } else {
        setSidebarPosition("right");
      }
    });
  }


export   function applyDrawerPositionClass(pos) {
    if (!state.drawerEl) return;
    if (pos === "left") {
      state.drawerEl.classList.add("drawer-panel-left");
      state.drawerEl.classList.remove("drawer-panel-right");
    } else {
      state.drawerEl.classList.add("drawer-panel-right");
      state.drawerEl.classList.remove("drawer-panel-left");
    }
  }


export   function setSidebarPosition(pos) {
    state.sidebarPosition = pos;
    chrome.storage.local.set({ sidebarPosition: pos });

    // Update sidebar classes
    if (pos === "left") {
      state.sidebarEl.classList.add("sidebar-left");
      state.sidebarEl.classList.remove("sidebar-right");
      state.reopenTabEl.className = "reopen-tab reopen-tab-left";
      state.reopenTabEl.innerHTML = `<span>▶</span>`;
    } else {
      state.sidebarEl.classList.add("sidebar-right");
      state.sidebarEl.classList.remove("sidebar-left");
      state.reopenTabEl.className = "reopen-tab reopen-tab-right";
      state.reopenTabEl.innerHTML = `<span>◀</span>`;
    }

    // Apply drawer position class (drawer is sibling of sidebar, not child)
    applyDrawerPositionClass(pos);
    
    // Close active drawers on swap to reset coordinates smoothly
    closeDrawer();
  }


export   function toggleSidebarVisibility() {
    ensureHUD();
    setSidebarVisible(!state.sidebarVisible);
  }


export   function setSidebarVisible(visible) {
    state.sidebarVisible = visible;
    if (visible) {
      state.sidebarEl.classList.remove("sidebar-hidden");
      state.reopenTabEl.style.display = "none";
    } else {
      state.sidebarEl.classList.add("sidebar-hidden");
      state.reopenTabEl.style.display = "flex";
      closeDrawer();
    }
  }

  // Wire up sidebar UI click events

export   function setupSidebarEvents() {
    // Reopen Tab
    state.reopenTabEl.addEventListener("click", () => {
      setSidebarVisible(true);
    });

    // Collapse
    state.shadowRoot.getElementById("sbtn-collapse").addEventListener("click", () => {
      setSidebarVisible(false);
    });

    // Turn Off / Power
    state.shadowRoot.getElementById("sbtn-power").addEventListener("click", () => {
      destroyHUD();
    });

    // Position Toggle
    state.shadowRoot.getElementById("sbtn-settings-position").addEventListener("click", () => {
      const targetPos = state.sidebarPosition === "right" ? "left" : "right";
      setSidebarPosition(targetPos);
      showToast(`Docked position: ${targetPos.toUpperCase()}`);
    });

    // Drawer close
    state.shadowRoot.getElementById("drawer-close-btn").addEventListener("click", () => {
      deactivateCurrentTool();
    });

    // Dashboard Branding Button
    state.shadowRoot.getElementById("sbtn-dashboard").addEventListener("click", () => {
      openDashboardDrawer();
    });

    // Command Palette Trigger
    state.shadowRoot.getElementById("sbtn-cmd-palette").addEventListener("click", () => {
      openCommandPalette();
    });

    // Tools Buttons binding
    const tools = [
      { id: "css-inspector", btnId: "sbtn-css-inspector" },
      { id: "live-text-editor", btnId: "sbtn-live-text-editor" },
      { id: "fonts-changer", btnId: "sbtn-fonts-changer" },
      { id: "list-fonts", btnId: "sbtn-list-fonts" },
      { id: "color-picker", btnId: "sbtn-color-picker" },
      { id: "color-palette", btnId: "sbtn-color-palette" },
      { id: "move-element", btnId: "sbtn-move-element" },
      { id: "delete-element", btnId: "sbtn-delete-element" },
      { id: "export-element", btnId: "sbtn-export-element" },
      { id: "extract-images", btnId: "sbtn-extract-images" },
      { id: "page-ruler", btnId: "sbtn-page-ruler" },
      { id: "page-outliner", btnId: "sbtn-page-outliner" },
      { id: "image-replacer", btnId: "sbtn-image-replacer" },
      { id: "take-screenshot", btnId: "sbtn-take-screenshot" },
      { id: "responsive-viewer", btnId: "sbtn-responsive-viewer" },
      // New diagnostic tabs
      { id: "tech-stack", btnId: "sbtn-tech-stack" },
      { id: "seo-meta", btnId: "sbtn-seo-meta" },
      { id: "a11y-audit", btnId: "sbtn-a11y-audit" },
      { id: "settings", btnId: "sbtn-settings-drawer" }
    ];

    tools.forEach(tool => {
      state.shadowRoot.getElementById(tool.btnId).addEventListener("click", () => {
        if (state.activeTool === tool.id) {
          const isOverlayTool = ["settings", "responsive-viewer"].includes(tool.id);
          if (!isOverlayTool && state.drawerEl && !state.drawerEl.classList.contains("visible")) {
            state.drawerEl.classList.add("visible");
          } else {
            deactivateCurrentTool();
          }
        } else {
          activateTool(tool.id);
        }
      });
    });
  }

  // Highlight selected tool button in sidebar

export function destroyHUD() {
  deactivateCurrentTool();
  chrome.storage.local.set({ hudEnabled: false }, () => {
    if (state.hostEl) {
      state.hostEl.remove();
      state.hostEl = null;
      state.shadowRoot = null;
      state.sidebarEl = null;
      state.drawerEl = null;
      state.toastEl = null;
      state.reopenTabEl = null;
      state.highlightOverlay = null;
      state.highlightLabel = null;
      state.inspectorTooltip = null;
      state.rulerCanvas = null;
      state.sidebarVisible = false;
    }
  });
}

export   function updateSidebarActiveBtn() {
    if (!state.sidebarEl) return;
    state.sidebarEl.querySelectorAll(".sidebar-btn").forEach(btn => {
      btn.classList.remove("active-tool");
    });

    if (state.activeTool) {
      const activeBtn = state.shadowRoot.getElementById(`sbtn-${state.activeTool}`);
      if (activeBtn) activeBtn.classList.add("active-tool");
    }
  }

  // Toast

