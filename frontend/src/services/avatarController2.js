
export function AvatarController(model) {
  if (!model) return;

  const setExpression = (expression = "neutral") => {
    model.expression(expression);
  }

  const setMouth = (value) => {
    model.internalModel.coreModel
      .setParameterValueById(
        "ParamMouthOpenY",
        value
      );
  }

  const look = (x, y) => {
    model.focus(x, y)
  }

  const playMotion = (group) => {
    model.motion(group);
  }

  
  return {
    setExpression,
    setMouth,
    look,
    playMotion
  }
}