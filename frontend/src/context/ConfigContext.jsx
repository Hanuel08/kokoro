import { createContext, useContext, useEffect, useState } from "react";
import { getDefaultProfileImage } from "../helpers/modelImages";

const STORAGE_KEY = "kokoro_config";

const AVAILABLE_MODELS = [
  { id: "Hiyori", name: "Hiyori", modelPath: "/models/Hiyori/Hiyori.model3.json" },
  { id: "Haru",   name: "Haru",   modelPath: "/models/Haru/Haru.model3.json" },
  { id: "Hibiki", name: "Hibiki", modelPath: "/models/Hibiki/hibiki.model3.json" },
  { id: "Mao",    name: "Mao",    modelPath: "/models/Mao/Mao.model3.json" },
  { id: "Miku",   name: "Miku",   modelPath: "/models/Miku/miku.model3.json" },
  { id: "Natori", name: "Natori", modelPath: "/models/Natori/Natori.model3.json" },
  { id: "Rice",   name: "Rice",   modelPath: "/models/Rice/Rice.model3.json" },
  { id: "Wanko",  name: "Wanko",  modelPath: "/models/Wanko/Wanko.model3.json" },
  { id: "Mark",   name: "Mark",   modelPath: "/models/Mark/Mark.model3.json" },
  { id: "Ren",    name: "Ren",    modelPath: "/models/Ren/Ren.model3.json" },
];

const DEFAULT_AI_MODEL = "google/gemma-4-31b-it:free";

const DEFAULT_CONFIG = {
  modelId: "Hiyori",
  characterName: "Kokoro",
  userName: "",
  aiModel: DEFAULT_AI_MODEL,
  profileImages: {},
};

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return null;
  }
  return null;
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(loadConfig);

  useEffect(() => {
    if (config) saveConfig(config);
  }, [config]);

  const updateConfig = (partial) => {
    setConfig((prev) => {
      const next = { ...(prev || DEFAULT_CONFIG), ...partial };
      return next;
    });
  };

  const resetConfig = () => {
    clearConfig();
    setConfig(null);
  };

  const modelInfo = AVAILABLE_MODELS.find((m) => m.id === config?.modelId) || AVAILABLE_MODELS[0];

  const getProfileImage = (modelId) => {
    return config?.profileImages?.[modelId] || getDefaultProfileImage(modelId);
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        modelInfo,
        isConfigured: config !== null && !!config.characterName,
        updateConfig,
        resetConfig,
        availableModels: AVAILABLE_MODELS,
        getProfileImage,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within a ConfigProvider");
  return ctx;
}
