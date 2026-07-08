import { emotionManager } from "./emotionManager.js";

class AvatarController {
  model = null;

  setModel(model) {
    this.model = model;

    const expressionManager =
      this.model.internalModel.motionManager.expressionManager;

    console.log("Expression Manager:", expressionManager);
    console.log("Definitions:", expressionManager?.definitions);

    emotionManager.setModel(this.model);
  }


  setExpression(expression = "neutral") {
    if (!this.model) return;

    this.model.expression(expression);
  }

  setMouth(value) {
    if (!this.model) return;

    this.model.internalModel.coreModel
      .setParameterValueById(
        "ParamMouthOpenY",
        value
      );
  }

  look(x, y) {
    if (!this.model) return;

    this.model.focus(x, y);
  }

  playMotion(group) {
    if (!this.model) return;

    this.model.motion(group);
  }
}

export const avatarController = new AvatarController();