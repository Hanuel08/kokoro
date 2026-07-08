import { useConfig } from "../context/ConfigContext";
import {
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
  IconMoodAngry,
  IconMoodSurprised,
  IconMoodNervous,
  IconMoodSick,
  IconSparkles,
  IconHeart,
  IconFlame,
  IconBrain,
  IconBolt,
  IconHeartbeat
} from '@tabler/icons-react';

export function EmotionIndicator({ data }) {
  const { config, modelInfo, getProfileImage } = useConfig();

  const characterName = config?.characterName || "Kokoro";
  const emotionData = data;

  const getEmotionDetails = (emotion) => {
    switch (emotion) {
      case 'happy': return { label: 'Feliz', icon: IconMoodSmile, color: 'text-green-500' };
      case 'sad': return { label: 'Triste', icon: IconMoodSad, color: 'text-blue-500' };
      case 'angry': return { label: 'Enojada', icon: IconMoodAngry, color: 'text-red-500' };
      case 'surprised': return { label: 'Sorprendida', icon: IconMoodSurprised, color: 'text-yellow-500' };
      case 'excited': return { label: 'Emocionada', icon: IconSparkles, color: 'text-orange-500' };
      case 'fear': return { label: 'Miedo', icon: IconMoodNervous, color: 'text-purple-500' };
      case 'love': return { label: 'Amor', icon: IconHeart, color: 'text-pink-500' };
      case 'hate': return { label: 'Odio', icon: IconFlame, color: 'text-orange-600' };
      case 'disgust': return { label: 'Asco', icon: IconMoodSick, color: 'text-lime-500' };
      case 'thinking': return { label: 'Pensando', icon: IconBrain, color: 'text-indigo-500' };
      case 'neutral':
      default: return { label: 'Neutral', icon: IconMoodNeutral, color: 'text-gray-500' };
    }
  };

  const { label, icon: EmotionIcon, color } = getEmotionDetails(emotionData.emotion.current);

  const profileImgSrc = getProfileImage(modelInfo?.id);

  const renderBar = (value, colorClass) => {
    return (
      <div className="flex-1 h-2 bg-slate-200 dark:bg-dark-border rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[18rem] p-4 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-dark-border rounded-2xl shadow-lg 
      transition-colors duration-300 pointer-events-none">

      <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-dark-border pb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-primary/10">
          <img
            src={profileImgSrc}
            alt={characterName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Personaje</p>
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{characterName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-dark-border pb-3">
        <div className={`p-2 rounded-full bg-slate-50 dark:bg-dark-surface shadow-inner ${color}`}>
          <EmotionIcon stroke={2} size={24} />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Estado Emocional</p>
          <p className={`text-lg font-bold capitalize ${color}`}>{label}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-1.5 w-20 text-slate-700 dark:text-slate-300">
            <IconHeartbeat size={16} className="text-pink-500 shrink-0" />
            <span className="font-medium">Mood</span>
          </div>
          {renderBar(emotionData.state.mood, "bg-pink-500")}
          <span className="text-xs font-bold w-8 text-right text-slate-600 dark:text-slate-400">{emotionData.state.mood}%</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-1.5 w-20 text-slate-700 dark:text-slate-300">
            <IconBrain size={16} className="text-blue-500 shrink-0" />
            <span className="font-medium">Focus</span>
          </div>
          {renderBar(emotionData.state.focus, "bg-blue-500")}
          <span className="text-xs font-bold w-8 text-right text-slate-600 dark:text-slate-400">{emotionData.state.focus}%</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-1.5 w-20 text-slate-700 dark:text-slate-300">
            <IconBolt size={16} className="text-yellow-500 shrink-0" />
            <span className="font-medium">Energy</span>
          </div>
          {renderBar(emotionData.state.energy, "bg-yellow-500")}
          <span className="text-xs font-bold w-8 text-right text-slate-600 dark:text-slate-400">{emotionData.state.energy}%</span>
        </div>
      </div>
    </div>
  );
}
