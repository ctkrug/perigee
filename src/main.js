import { startGame } from "./game/main.js";

startGame({
  canvas: document.getElementById("scene"),
  hudEl: document.getElementById("hud"),
  muteButton: document.getElementById("mute-toggle"),
  winOverlayEl: document.getElementById("win-overlay"),
});
