import { useState } from "react";
import { useConfig } from "../context/ConfigContext";
import { useTheme } from "../context/ThemeContext";
import { getDefaultProfileImage } from "../helpers/modelImages";
import { IconSettings, IconUser, IconRobot, IconChevronDown, IconPhoto } from "@tabler/icons-react";

const AI_MODEL_PRESETS = [
  { label: "Gemma 4 31B (free)", value: "google/gemma-4-31b-it:free" },
  { label: "Llama 3.3 70B (free)", value: "meta-llama/llama-3.3-70b-instruct:free" },
  { label: "Qwen3 Coder 480B (free)", value: "qwen/qwen3-coder:free" },
  { label: "Nemotron 3 Super 120B (free)", value: "nvidia/nemotron-3-super-120b-a12b:free" },
  { label: "Hermes 3 405B (free)", value: "nousresearch/hermes-3-llama-3.1-405b:free" },
];

export function Config({ onClose }) {
  const { config, updateConfig, availableModels, getProfileImage } = useConfig();
  const { theme, toggleTheme } = useTheme();

  const [modelId, setModelId] = useState(config?.modelId || "Hiyori");
  const [characterName, setCharacterName] = useState(config?.characterName || "Kokoro");
  const [userName, setUserName] = useState(config?.userName || "");
  const [aiModel, setAiModel] = useState(config?.aiModel || AI_MODEL_PRESETS[0].value);
  const [customModel, setCustomModel] = useState(
    AI_MODEL_PRESETS.some((p) => p.value === config?.aiModel) ? "" : config?.aiModel || ""
  );
  const [useCustom, setUseCustom] = useState(
    !AI_MODEL_PRESETS.some((p) => p.value === config?.aiModel)
  );
  const [profileImageUrl, setProfileImageUrl] = useState(
    config?.profileImages?.[modelId] || ""
  );
  const [errors, setErrors] = useState({});

  const selectedModel = availableModels.find((m) => m.id === modelId) || availableModels[0];

  const handleModelSelect = (id) => {
    setModelId(id);
    const m = availableModels.find((m) => m.id === id);
    if (m && !characterName) {
      setCharacterName(m.name);
    }
    setProfileImageUrl(config?.profileImages?.[id] || "");
  };

  const validate = () => {
    const errs = {};
    if (!characterName.trim()) errs.characterName = "El nombre del personaje es obligatorio";
    if (useCustom && !customModel.trim()) errs.aiModel = "Indica un modelo de IA";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const profileImages = { ...(config?.profileImages || {}) };
    if (profileImageUrl.trim()) {
      profileImages[modelId] = profileImageUrl.trim();
    } else {
      delete profileImages[modelId];
    }
    updateConfig({
      modelId,
      characterName: characterName.trim(),
      userName: userName.trim(),
      aiModel: useCustom ? customModel.trim() : aiModel,
      profileImages,
    });
    onClose?.();
  };

  const previewUrl = profileImageUrl.trim() || getDefaultProfileImage(modelId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-base transition-colors duration-300 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
              <IconSettings size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Configuración</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Personaliza tu experiencia con Kokoro</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <section className="bg-white dark:bg-dark-elevated rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <IconRobot size={20} className="text-primary" />
              Personaje
            </h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre del personaje
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder={selectedModel?.name || "Kokoro"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
              />
              {errors.characterName && (
                <p className="text-red-500 text-xs mt-1">{errors.characterName}</p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                El nombre que usará la IA para presentarse
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Modelo visual (Live2D)
              </label>
              <div className="grid grid-cols-5 gap-3">
                {availableModels.map((m) => {
                  const isSelected = modelId === m.id;
                  const imgSrc = getProfileImage(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleModelSelect(m.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                          : "border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover bg-white dark:bg-dark-surface"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={m.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        {!imgSrc && (
                          <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-slate-100 dark:bg-dark-surface text-slate-500 dark:text-slate-400"
                          }`}>
                            {m.name[0]}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isSelected ? "text-primary" : "text-slate-600 dark:text-slate-400"
                      }`}>
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <IconPhoto size={16} />
                URL de la imagen de perfil
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-dark-border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder={getDefaultProfileImage(modelId)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100
                  placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-sm"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                URL de la imagen de perfil para este modelo (png, jpg, gif, etc.)
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-dark-elevated rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <IconUser size={20} className="text-primary" />
              Tu información
            </h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tu nombre
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: Juan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Cómo se dirigirá la IA hacia ti (opcional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <IconPhoto size={16} />
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-surface my-2">
                  <img
                    src={config?.userProfileUploaded ? "/assets/img/user/user_profile.jpg" : "/assets/img/user/default_profile.jpg"}
                    alt="Tu perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/assets/img/user/default_profile.jpg";
                    }}
                  />
                </div>
                <label className="px-4 py-2 rounded-xl border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors cursor-pointer font-medium text-sm">
                  {config?.userProfileUploaded ? "Cambiar foto" : "Subir foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("profile", file);
                      try {
                        const res = await fetch("/upload/profile", {
                          method: "POST",
                          body: formData,
                        });
                        if (res.ok) {
                          updateConfig({ userProfileUploaded: true });
                        } else {
                          alert("Error al subir la imagen");
                        }
                      } catch {
                        alert("Error al conectar con el servidor");
                      }
                    }}
                  />
                </label>
                {config?.userProfileUploaded && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/upload/profile", { method: "DELETE" });
                        if (res.ok) updateConfig({ userProfileUploaded: false });
                      } catch {
                        alert("Error al eliminar la imagen");
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer font-medium text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Sube una foto tuya (jpg, png, webp)
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-dark-elevated rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <IconChevronDown size={20} className="text-primary" />
              Modelo de IA
            </h2>

            <div className="space-y-3">
              {AI_MODEL_PRESETS.map((preset) => (
                <label
                  key={preset.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    !useCustom && aiModel === preset.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="aiModel"
                    checked={!useCustom && aiModel === preset.value}
                    onChange={() => { setAiModel(preset.value); setUseCustom(false); }}
                    className="accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{preset.label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-mono">{preset.value}</span>
                  </div>
                </label>
              ))}

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  useCustom
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover"
                }`}
              >
                <input
                  type="radio"
                  name="aiModel"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="accent-primary"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100 shrink-0">Custom</span>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="openai/gpt-4o-mini:free"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  onClick={() => setUseCustom(true)}
                />
              </label>
              {errors.aiModel && <p className="text-red-500 text-xs">{errors.aiModel}</p>}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors cursor-pointer font-medium"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer font-medium shadow-sm"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
