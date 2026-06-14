import { state } from '../state.js';
import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';
import { ensureHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';
import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';
import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';
import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';

export   function setupTechStack() {
    const stack = [];

    // Scan tags & script attributes
    const scriptTags = Array.from(document.getElementsByTagName("script"));
    const scriptSrcs = scriptTags.map(s => s.src.toLowerCase()).filter(Boolean);
    const linkTags = Array.from(document.getElementsByTagName("link"));
    const linkHrefs = linkTags.map(l => l.href.toLowerCase()).filter(Boolean);

    // React
    if (document.querySelector("[data-reactroot]") || document.querySelector("#react-root") || scriptSrcs.some(s => s.includes("react"))) {
      stack.push({ name: "React", category: "Frontend Framework", icon: "⚛️" });
    }
    // Next.js
    if (document.getElementById("__NEXT_DATA__") || scriptSrcs.some(s => s.includes("_next/static"))) {
      stack.push({ name: "Next.js", category: "Server SSR Framework", icon: "▲" });
    }
    // Vue.js
    if (document.querySelector("[v-cloak]") || scriptSrcs.some(s => s.includes("vue"))) {
      stack.push({ name: "Vue.js", category: "Frontend Framework", icon: "💚" });
    }
    // Angular
    if (document.querySelector("[ng-version]") || document.querySelector("[ng-app]") || scriptSrcs.some(s => s.includes("angular"))) {
      stack.push({ name: "Angular", category: "Frontend Platform", icon: "🅰️" });
    }
    // jQuery
    if (scriptSrcs.some(s => s.includes("jquery"))) {
      stack.push({ name: "jQuery", category: "Legacy DOM Library", icon: "💸" });
    }
    // WordPress
    const generator = document.querySelector('meta[name="generator"]')?.content || "";
    if (generator.toLowerCase().includes("wordpress") || linkHrefs.some(h => h.includes("wp-content") || h.includes("wp-includes"))) {
      stack.push({ name: "WordPress", category: "CMS Engine", icon: "📝" });
    }
    // Shopify
    if (scriptSrcs.some(s => s.includes("cdn.shopify.com")) || generator.toLowerCase().includes("shopify")) {
      stack.push({ name: "Shopify", category: "Ecommerce CMS", icon: "🛍️" });
    }
    // Tailwind CSS
    if (linkHrefs.some(h => h.includes("tailwind")) || document.querySelector("[class*='grid-cols-']")) {
      stack.push({ name: "Tailwind CSS", category: "CSS Utility Framework", icon: "🎨" });
    }
    // Bootstrap
    if (linkHrefs.some(h => h.includes("bootstrap")) || document.querySelector("[class*='col-md-'], [class*='btn-primary']")) {
      stack.push({ name: "Bootstrap CSS", category: "UI CSS Framework", icon: "🅱️" });
    }
    // Google Analytics / GTag
    if (scriptSrcs.some(s => s.includes("google-analytics.com") || s.includes("googletagmanager.com/gtag"))) {
      stack.push({ name: "Google Analytics", category: "User Analytics Engine", icon: "📊" });
    }
    // Stripe
    if (scriptSrcs.some(s => s.includes("js.stripe.com"))) {
      stack.push({ name: "Stripe Checkout", category: "Payment Gateway API", icon: "💳" });
    }

    let stackHTML = `
      <div style="font-size: 11px; color:var(--text-secondary); margin-bottom:14px;">Identified web technologies stack:</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    stack.forEach(tech => {
      stackHTML += `
        <div class="audit-card audit-success">
          <div class="audit-card-title">
            <span>${tech.icon}</span>
            <span>${tech.name}</span>
          </div>
          <div class="audit-card-desc">${tech.category}</div>
        </div>
      `;
    });

    if (stack.length === 0) {
      stackHTML += `<div style="font-size:12px; color:var(--text-secondary); text-align:center; padding:20px;">No typical frontend framework signatures detected.</div>`;
    }
    stackHTML += `</div>`;

    openDrawer("Site Stack", "Web Tech Stack Analyzer", stackHTML);
  }

  // ==========================================
  // NEW FEATURE 2: SEO META INSPECTOR
  // ==========================================

