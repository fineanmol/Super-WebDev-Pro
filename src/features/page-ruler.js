import { state } from '../state.js';
import { openDrawer } from '../ui/drawer.js';
export function setupPageRuler() {
    const guideHTML = `
      <div class="audit-card">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>📏</span> Page Ruler Active
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
          Move the mouse to draw coordinate lines. Click and drag to measure relative distance bounding boxes on the webpage layout.
        </p>
      </div>
    `;

    openDrawer("Page Ruler", "Canvas-based layout measurement", guideHTML);

    const canvas = state.rulerCanvas;
    if (!canvas) return;

    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let startX = null, startY = null;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    const drawRuler = (curX, curY) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(184, 163, 252, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(canvas.width, curY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, canvas.height);
      ctx.stroke();

      if (isDragging && startX !== null && startY !== null) {
        const dx = curX - startX;
        const dy = curY - startY;

        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(110, 231, 168, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, startY, dx, dy);

        ctx.fillStyle = "rgba(110, 231, 168, 0.08)";
        ctx.fillRect(startX, startY, dx, dy);

        const wStr = `${Math.abs(dx)}px`;
        const hStr = `${Math.abs(dy)}px`;

        ctx.fillStyle = "#121218";
        ctx.fillRect(startX + dx / 2 - 30, startY + dy / 2 - 12, 60, 24);
        ctx.strokeStyle = "rgba(110, 231, 168, 0.4)";
        ctx.strokeRect(startX + dx / 2 - 30, startY + dy / 2 - 12, 60, 24);

        ctx.fillStyle = "#6ee7a8";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${wStr}×${hStr}`, startX + dx / 2, startY + dy / 2);
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(curX + 12, curY - 25, 100, 20);
        ctx.strokeStyle = "rgba(184, 163, 252, 0.5)";
        ctx.strokeRect(curX + 12, curY - 25, 100, 20);

        ctx.fillStyle = "#f7f7fa";
        ctx.font = "bold 9.5px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`X: ${curX} Y: ${curY}`, curX + 18, curY - 15);
      }
    };

    trackListener(document, "mousemove", (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      drawRuler(lastX, lastY);
    }, true);

    trackListener(document, "mousedown", (e) => {
      if (isHUDElement(e.target)) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    }, true);

    trackListener(document, "mouseup", () => {
      isDragging = false;
      startX = null;
      startY = null;
    }, true);

    state.activeListeners.push({
      target: window,
      event: "resize",
      callback: resizeCanvas,
      useCapture: false
    });
  }

