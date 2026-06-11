import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import { avatarController } from "./avatarController";

class AvatarManager {
  constructor() {
    this.app = null;
    this.model = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init(containerElement) {
    // If already initializing, wait for it
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.app) {
      this.initPromise = (async () => {
        this.app = new PIXI.Application({
          autoStart: true,
          backgroundAlpha: 0,
          resizeTo: window, // We'll handle manual resize
        });

        try {
          this.model = await Live2DModel.from("/models/Hiyori/Hiyori.model3.json");
          this.model.anchor.set(0.5);
          this.app.stage.addChild(this.model);
          avatarController.setModel(this.model);
          this.isInitialized = true;
        } catch (err) {
          console.error("Error loading model:", err);
        }
      })();
      await this.initPromise;
    }

    // Attach to the new container
    if (this.app && containerElement) {
      containerElement.appendChild(this.app.view);
      this.resize(containerElement);
    }

    return this.app;
  }

  resize(containerElement) {
    if (!this.app || !this.model || !containerElement) return;

    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;

    this.app.renderer.resize(width, height);

    // CONFIGURACIÓN DEL AVATAR
    const AVATAR_SCALE = 0.7; // Tamaño
    const AVATAR_X = 0.45;     // Posición horizontal
    const AVATAR_Y = 0.65;    // Posición vertical

    const scale = Math.min(width / 1000, height / 1000) * AVATAR_SCALE;

    this.model.scale.set(scale);

    this.model.x = width * AVATAR_X;
    this.model.y = height * AVATAR_Y;

    // Debug (opcional)
    console.log({
      width,
      height,
      scale,
      x: this.model.x,
      y: this.model.y,
    });
  }

  focus(x, y) {
    if (this.model) {
      this.model.focus(x, y);
    }
  }

  detach() {
    // We don't destroy the app/model, we just detach the canvas from the DOM
    if (this.app && this.app.view && this.app.view.parentNode) {
      this.app.view.parentNode.removeChild(this.app.view);
    }
  }
}

export const avatarManager = new AvatarManager();
