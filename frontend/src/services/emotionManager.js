import { avatarController } from "./avatarController";

const PARAM_VARIANTS = {
  // Head
  anglex:        ["ParamAngleX",     "PARAM_ANGLE_X"],
  angley:        ["ParamAngleY",     "PARAM_ANGLE_Y"],
  anglez:        ["ParamAngleZ",     "PARAM_ANGLE_Z"],
  // Body
  bodyanglex:    ["ParamBodyAngleX", "PARAM_BODY_ANGLE_X"],
  bodyangley:    ["ParamBodyAngleY", "PARAM_BODY_ANGLE_Y"],
  bodyanglez:    ["ParamBodyAngleZ", "PARAM_BODY_ANGLE_Z"],
  // Brows
  browly:        ["ParamBrowLY",     "PARAM_BROW_L_Y"],
  browry:        ["ParamBrowRY",     "PARAM_BROW_R_Y"],
  browlx:        ["ParamBrowLX",     "PARAM_BROW_L_X"],
  browrx:        ["ParamBrowRX",     "PARAM_BROW_R_X"],
  // Eyes
  eyelopen:      ["ParamEyeLOpen",   "PARAM_EYE_L_OPEN"],
  eyeropen:      ["ParamEyeROpen",   "PARAM_EYE_R_OPEN"],
  eyelsmile:     ["ParamEyeLSmile",  "PARAM_EYE_L_SMILE"],
  eyersmile:     ["ParamEyeRSmile",  "PARAM_EYE_R_SMILE"],
  // Mouth
  mouthform:     ["ParamMouthForm",  "PARAM_MOUTH_FORM"],
  mouthopeny:    ["ParamMouthOpenY", "PARAM_MOUTH_OPEN_Y"],
  // Other face
  cheek:         ["ParamCheek",      "PARAM_CHEEK"],
  // Arms (varies heavily between models; we try multiple names)
  arml:          ["ParamArmL",       "PARAM_ARM_L",       "ParamArmAL01"],
  armr:          ["ParamArmR",       "PARAM_ARM_R",       "ParamArmAR01"],
  // Breath
  breath:        ["ParamBreath",     "PARAM_BREATH"],
  // Shoulders (Natori/Haru)
  shoulderl:     ["ParamLeftShoulderUp",  "PARAM_LEFT_SHOULDER_UP"],
  shoulderr:     ["ParamRightShoulderUp", "PARAM_RIGHT_SHOULDER_UP"],
  // Waist (Natori)
  waistz:        ["ParamWaistAngleZ", "PARAM_WAIST_ANGLE_Z"],
  // Whole-body position (Natori)
  bodypos:       ["ParamBodyPosition", "PARAM_BODY_POSITION"],
};

class EmotionManager {
  currentEmotion = null;
  pendingParams = null;
  paramMap = {};

  setModel() {
    this._buildParamMap();
  }

  _buildParamMap() {
    const core = avatarController.model?.internalModel?.coreModel;
    if (!core?._parameterIds) {
      setTimeout(() => this._buildParamMap(), 100);
      return;
    }

    const ids = core._parameterIds;

    this.paramMap = {};
    for (const [canonical, candidates] of Object.entries(PARAM_VARIANTS)) {
      for (const candidate of candidates) {
        if (ids.includes(candidate)) {
          this.paramMap[canonical] = candidate;
          break;
        }
      }
    }

    console.log("EmotionManager paramMap:", this.paramMap);
  }

  _getId(canonical) {
    return this.paramMap[canonical];
  }

  setParameter(id, value) {
    const core = avatarController.model?.internalModel?.coreModel;
    if (!core) return;

    const index = core._parameterIds.indexOf(id);
    if (index === -1) return;

    core._parameterValues[index] = value;
  }

  set(canonical, value) {
    const id = this._getId(canonical);
    if (!id) return;

    const core = avatarController.model?.internalModel?.coreModel;
    if (!core) return;

    if (core._parameterIds.indexOf(id) === -1) return;
    this.setParameter(id, value);
  }

  setParams(params) {
    for (const [key, value] of Object.entries(params)) {
      this.set(key, value);
    }
  }

  // ─── Emotion functions ────────────────────────────────────────
  // Each receives intensity t (0-1) and returns face + body params.

  happy(t) {
    return {
      mouthform:    0.8 * t,
      mouthopeny:   0.2 * t,
      eyelsmile:    0.9 * t,
      eyersmile:    0.9 * t,
      eyelopen:     0.7,
      eyeropen:     0.7,
      browly:       0.3 * t,
      browry:       0.3 * t,
      cheek:        0.4 * t,
      anglex:       0,
      angley:       0,
      anglez:       6 * t,
      bodyanglex:   3 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:        -20 * t,
      armr:         20 * t,
      breath:       0.6,
    };
  }

  sad(t) {
    return {
      mouthform:   -0.6 * t,
      mouthopeny:   0.05 * t,
      eyelsmile:   -0.3 * t,
      eyersmile:   -0.3 * t,
      eyelopen:     0.4,
      eyeropen:     0.4,
      browly:       0.5 * t,
      browry:       0.5 * t,
      anglex:       10 * t,
      angley:       5 * t,
      anglez:       0,
      bodyanglex:  -3 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         30 * t,
      armr:        -30 * t,
      shoulderl:   -0.3 * t,
      shoulderr:   -0.3 * t,
      breath:       0.2,
    };
  }

  angry(t) {
    return {
      mouthform:   -0.5 * t,
      mouthopeny:   0.1 * t,
      eyelsmile:   -0.7 * t,
      eyersmile:   -0.7 * t,
      eyelopen:     0.4,
      eyeropen:     0.4,
      browly:      -0.8 * t,
      browry:      -0.8 * t,
      browlx:       0.3 * t,
      browrx:       0.3 * t,
      anglex:      -3 * t,
      angley:       0,
      anglez:       0,
      bodyanglex:   5 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         40 * t,
      armr:        -40 * t,
      shoulderl:    0.5 * t,
      shoulderr:    0.5 * t,
      breath:       0.7,
    };
  }

  surprised(t) {
    return {
      mouthform:    0.3 * t,
      mouthopeny:   0.8 * t,
      eyelsmile:    0,
      eyersmile:    0,
      eyelopen:     1,
      eyeropen:     1,
      browly:       0.8 * t,
      browry:       0.8 * t,
      anglex:      -5 * t,
      angley:       0,
      anglez:       0,
      bodyanglex:  -5 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:        -50 * t,
      armr:         50 * t,
      breath:       0,
    };
  }

  excited(t) {
    return {
      mouthform:    0.9 * t,
      mouthopeny:   0.5 * t,
      eyelsmile:    1.0 * t,
      eyersmile:    1.0 * t,
      eyelopen:     0.8,
      eyeropen:     0.8,
      browly:       0.6 * t,
      browry:       0.6 * t,
      anglex:       0,
      angley:       0,
      anglez:       8 * t,
      bodyanglex:   5 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:        -40 * t,
      armr:         40 * t,
      breath:       1.0,
    };
  }

  fear(t) {
    return {
      mouthform:   -0.2 * t,
      mouthopeny:   0.4 * t,
      eyelsmile:   -0.2 * t,
      eyersmile:   -0.2 * t,
      eyelopen:     0.9,
      eyeropen:     0.9,
      browly:       0.7 * t,
      browry:       0.7 * t,
      anglex:      -8 * t,
      angley:       0,
      anglez:       0,
      bodyanglex:  -5 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         40 * t,
      armr:        -40 * t,
      shoulderl:    0.6 * t,
      shoulderr:    0.6 * t,
      breath:       0.3,
    };
  }

  love(t) {
    return {
      mouthform:    0.7 * t,
      mouthopeny:   0.1 * t,
      eyelsmile:    0.8 * t,
      eyersmile:    0.8 * t,
      eyelopen:     0.6,
      eyeropen:     0.6,
      browly:       0.2 * t,
      browry:       0.2 * t,
      cheek:        0.6 * t,
      anglex:       0,
      angley:       0,
      anglez:       10 * t,
      bodyanglex:   5 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:        -15 * t,
      armr:         15 * t,
      breath:       0.5,
    };
  }

  hate(t) {
    return {
      mouthform:   -0.7 * t,
      mouthopeny:   0.1 * t,
      eyelsmile:   -0.8 * t,
      eyersmile:   -0.8 * t,
      eyelopen:     0.3,
      eyeropen:     0.3,
      browly:      -0.9 * t,
      browry:      -0.9 * t,
      browlx:       0.4 * t,
      browrx:       0.4 * t,
      anglex:      -5 * t,
      angley:       0,
      anglez:      -3 * t,
      bodyanglex:   5 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         50 * t,
      armr:        -50 * t,
      shoulderl:    0.7 * t,
      shoulderr:    0.7 * t,
      breath:       0.8,
    };
  }

  disgust(t) {
    return {
      mouthform:   -0.4 * t,
      mouthopeny:   0.05 * t,
      eyelsmile:   -0.5 * t,
      eyersmile:   -0.5 * t,
      eyelopen:     0.4,
      eyeropen:     0.4,
      browly:      -0.6 * t,
      browry:      -0.6 * t,
      anglex:      -3 * t,
      angley:       0,
      anglez:      -5 * t,
      bodyanglex:  -3 * t,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         30 * t,
      armr:        -30 * t,
      breath:       0.3,
    };
  }

  thinking(t) {
    return {
      mouthform:   -0.1 * t,
      mouthopeny:   0.05 * t,
      eyelsmile:    0,
      eyersmile:    0,
      eyelopen:     0.5,
      eyeropen:     0.5,
      browly:       0.1 * t,
      browry:       0.1 * t,
      browlx:      -0.2 * t,
      browrx:       0.2 * t,
      anglex:       0,
      angley:       0,
      anglez:       7 * t,
      bodyanglex:   0,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         0,
      armr:        -20 * t,
      breath:       0.4,
    };
  }

  neutral() {
    return {
      mouthform:    0,
      mouthopeny:   0,
      eyelsmile:    0,
      eyersmile:    0,
      eyelopen:     0.7,
      eyeropen:     0.7,
      browly:       0,
      browry:       0,
      anglex:       0,
      angley:       0,
      anglez:       0,
      bodyanglex:   0,
      bodyangley:   0,
      bodyanglez:   0,
      arml:         0,
      armr:         0,
      breath:       0.5,
    };
  }

  // ─── Emotion dispatch ────────────────────────────────────────

  get emotionFns() {
    return {
      happy:     this.happy.bind(this),
      sad:       this.sad.bind(this),
      angry:     this.angry.bind(this),
      surprised: this.surprised.bind(this),
      excited:   this.excited.bind(this),
      fear:      this.fear.bind(this),
      love:      this.love.bind(this),
      hate:      this.hate.bind(this),
      disgust:   this.disgust.bind(this),
      thinking:  this.thinking.bind(this),
      neutral:   this.neutral.bind(this),
    };
  }

  // ─── Public API ──────────────────────────────────────────────

  update(emotionData) {
    if (!emotionData?.emotion?.current) return;

    const { current, intensity = 50 } = emotionData.emotion;
    const { mood = 50, energy = 50 } = emotionData.state || {};

    const t = intensity / 100;
    this.currentEmotion = current;

    const fn = this.emotionFns[current] || this.emotionFns.neutral;
    const params = fn(t);

    this.setParams(params);
    this.set("bodyanglex", (params.bodyanglex || 0) + ((mood - 50) / 100) * 3);
    this.set("bodyanglez", (params.bodyanglez || 0) + ((energy - 50) / 100) * 2);
  }

  applyEmotion(name, intensity = 50) {
    const t = intensity / 100;
    this.currentEmotion = name;

    const fn = this.emotionFns[name] || this.emotionFns.neutral;
    const params = fn(t);

    this.setParams(params);
  }

  reset() {
    this.pendingParams = null;
    this.setParams(this.neutral(0));
    this.set("bodyanglex", 0);
    this.set("bodyanglez", 0);
  }

  flush() {
    if (this.pendingParams && avatarController.model?.internalModel?.coreModel) {
      this.setParams(this.pendingParams);
      this.pendingParams = null;
    }
  }
}

export const emotionManager = new EmotionManager();
