import { useState, useEffect } from "react";
import { useConfig } from "../context/ConfigContext";
import { Chat } from "../components/Chat.jsx"
import { Avatar } from "../components/Avatar.jsx"
import { Header } from "../components/Header.jsx"
import { EmotionIndicator } from "../components/EmotionIndicator.jsx"
import { emotionManager } from "../services/emotionManager.js"
import { Config } from "./Config.jsx"

export function Main() {
  const { config, isConfigured } = useConfig();
  const [manualConfig, setManualConfig] = useState(false);
  const showConfig = !isConfigured || manualConfig;

  const [emotionData, setEmotionData] = useState({
    emotion: { current: "excited", intensity: 50 },
    state: { mood: 50, focus: 50, energy: 50 }
  });

  useEffect(() => {
    emotionManager.update(emotionData);
  }, [emotionData]);

  const handleOpenConfig = () => setManualConfig(true);
  const handleCloseConfig = () => setManualConfig(false);

  if (showConfig) {
    return <Config onClose={isConfigured ? handleCloseConfig : undefined} />;
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <Header onOpenConfig={handleOpenConfig} />

      <main className="flex-1 flex w-[1500px] mx-auto relative z-0 min-h-0">

        <div className="flex w-full md:w-2/3 lg:w-3/4 p-4 z-10 h-full relative">
          <div className="top-4 z-20 mr-4" style={{ right: "calc(100% + 0.75rem)", width: "18rem" }}>
            <EmotionIndicator data={emotionData} />
          </div>
          <Chat key={config?.characterName || "Kokoro"} onEmotionUpdate={setEmotionData} />
        </div>

        <div className="flex w-[440px] h-[1190px] pointer-events-none z-0">
          <Avatar />
        </div>

      </main>
    </div>
  )
}
