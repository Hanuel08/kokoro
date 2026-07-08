import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import { avatarController } from "./avatarController";
import { emotionManager } from "./emotionManager";

class AvatarManager {
  constructor() {
    this.app = null;
    this.model = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init(containerElement, modelPath) {
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.app) {
      this.initPromise = (async () => {
        this.app = new PIXI.Application({
          autoStart: true,
          backgroundAlpha: 0,
          resizeTo: window,
        });

        try {
          await this._loadModel(modelPath || "/models/Hiyori/Hiyori.model3.json");
          this.isInitialized = true;
        } catch (err) {
          console.error("Error loading model:", err);
        }
      })();
      await this.initPromise;
    }

    if (this.app && containerElement) {
      containerElement.appendChild(this.app.view);
      this.resize(containerElement);
    }

    return this.app;
  }

  async loadModel(modelPath) {
    if (!this.app) {
      console.warn("App not initialized yet. Model will be loaded on init.");
      return;
    }

    await this._loadModel(modelPath);

    if (this.app.view && this.app.view.parentNode) {
      this.resize(this.app.view.parentNode);
    }
  }

  async _loadModel(modelPath) {
    if (this.model) {
      this.app.stage.removeChild(this.model);
      this.model = null;
    }

    this.model = await Live2DModel.from(modelPath);

    this.model.internalModel.motionManager.groups.idle = '';

    this.model.anchor.set(0.5);
    this.app.stage.addChild(this.model);
    avatarController.setModel(this.model);
    emotionManager.flush();
  }

  getCurrentModelPath() {
    if (!this.model) return null;
    return this.model.internalModel?.settings?.url || null;
  }

  resize(containerElement) {
    if (!this.app || !this.model || !containerElement) return;

    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;

    this.app.renderer.resize(width, height);

    const AVATAR_SCALE = 0.70;
    const AVATAR_X = 0.50;
    const AVATAR_Y = 0.47;

    const scale = Math.min(width / 1000, height / 1000) * AVATAR_SCALE;

    this.model.scale.set(scale);

    this.model.x = width * AVATAR_X;
    this.model.y = height * AVATAR_Y;
  }

  focus(x, y) {
    if (this.model) {
      this.model.focus(x, y);
    }
  }

  detach() {
    if (this.app && this.app.view && this.app.view.parentNode) {
      this.app.view.parentNode.removeChild(this.app.view);
    }
  }
}

export const avatarManager = new AvatarManager();
