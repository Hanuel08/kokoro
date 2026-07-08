import { useEffect, useRef } from "react";
import { avatarManager } from "../services/avatarManager.js";
import { useConfig } from "../context/ConfigContext";

export function Avatar() {
  const containerRef = useRef(null);
  const { modelInfo } = useConfig();
  const prevModelPath = useRef(null);

  useEffect(() => {
    let onPointerMove;
    let onResize;

    async function init() {
      if (!containerRef.current) return;

      const modelPath = modelInfo?.modelPath || "/models/Hiyori/Hiyori.model3.json";
      const needsReload = prevModelPath.current && prevModelPath.current !== modelPath;
      prevModelPath.current = modelPath;

      if (needsReload) {
        await avatarManager.loadModel(modelPath);
      } else {
        await avatarManager.init(containerRef.current, modelPath);
      }

      onResize = () => {
        if (containerRef.current) {
          avatarManager.resize(containerRef.current);
        }
      };
      window.addEventListener('resize', onResize);

      onPointerMove = (e) => {
        avatarManager.focus(e.clientX, e.clientY);
      };
      window.addEventListener("pointermove", onPointerMove);
    }

    init();

    return () => {
      if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
      if (onResize) window.removeEventListener('resize', onResize);
    };
  }, [modelInfo]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center opacity-0 animate-fade-in pointer-events-none"
      style={{
        animation: "fadeIn 1s ease-in-out forwards",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
