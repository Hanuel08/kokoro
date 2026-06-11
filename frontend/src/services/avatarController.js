class AvatarController {
  model = null;

  setModel(model) {
    this.model = model;
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