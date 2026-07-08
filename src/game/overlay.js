import { createBurst } from "./particles.js";

// DOM wiring for the win overlay: shows run stats, spawns the win-celebration
// spark burst, copies the share string to the clipboard, and traps focus
// while the dialog is open (Tab cycles within it, Escape dismisses).
export function createWinOverlay(root) {
  const shotsEl = root.querySelector("#win-shots");
  const parEl = root.querySelector("#win-par");
  const shareBtn = root.querySelector("#win-share");
  const dismissBtn = root.querySelector("#win-dismiss");
  const particleLayer = root.querySelector(".win-particles");
  const focusable = [shareBtn, dismissBtn];

  let onDismiss = null;
  let lastFocused = null;
  let copyResetTimer = null;

  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      hide();
      return;
    }
    if (event.key !== "Tab") return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function spawnParticles(reduceMotion) {
    particleLayer.innerHTML = "";
    if (reduceMotion) return;
    for (const particle of createBurst()) {
      const spark = document.createElement("span");
      spark.className = "win-spark";
      spark.style.setProperty("--dx", `${particle.dx}px`);
      spark.style.setProperty("--dy", `${particle.dy}px`);
      spark.style.animationDelay = `${particle.delayMs}ms`;
      particleLayer.appendChild(spark);
    }
  }

  function hide() {
    root.hidden = true;
    document.removeEventListener("keydown", trapFocus);
    const dismiss = onDismiss;
    onDismiss = null;
    lastFocused?.focus?.();
    dismiss?.();
  }

  function show({ shots, par, shareText, reduceMotion, dismiss }) {
    onDismiss = dismiss;
    lastFocused = document.activeElement;
    shotsEl.textContent = String(shots);
    parEl.textContent = String(par);
    shareBtn.dataset.shareText = shareText;
    shareBtn.textContent = "Copy result";
    spawnParticles(reduceMotion);
    root.hidden = false;
    document.addEventListener("keydown", trapFocus);
    dismissBtn.focus();
  }

  shareBtn.addEventListener("click", async () => {
    const text = shareBtn.dataset.shareText || "";
    window.clearTimeout(copyResetTimer);
    try {
      await navigator.clipboard.writeText(text);
      shareBtn.textContent = "Copied!";
    } catch {
      shareBtn.textContent = "Copy failed";
    }
    copyResetTimer = window.setTimeout(() => {
      shareBtn.textContent = "Copy result";
    }, 1500);
  });

  dismissBtn.addEventListener("click", hide);

  return { show, hide };
}
