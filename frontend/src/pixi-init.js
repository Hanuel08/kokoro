import * as PIXI from "pixi.js";

// Make PIXI available globally before importing pixi-live2d-display
if (typeof window !== "undefined") {
  window.PIXI = PIXI;
}
