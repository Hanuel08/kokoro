import { useEffect, useRef } from "react";
import { avatarManager } from "../services/avatarManager.js";

export function Avatar() {
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let onPointerMove;
    let onResize;

    async function init() {
      if (!containerRef.current) return;
      
      await avatarManager.init(containerRef.current);
      
      if (!isMounted) {
        avatarManager.detach();
        return () => {
          isMounted = false;
          
          if (onPointerMove) {
            window.removeEventListener("pointermove", onPointerMove);
          }
          if (onResize) {
            window.removeEventListener('resize', onResize);
          }
          
          // We don't call avatarManager.detach() here to avoid race conditions with React StrictMode.
          // The canvas will safely move to the new container automatically on remount.
        };
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

    // return () => {
    //   isMounted = false;
      
    //   if (onPointerMove) {
    //     window.removeEventListener("pointermove", onPointerMove);
    //   }
    //   if (onResize) {
    //     window.removeEventListener('resize', onResize);
    //   }
      
    //   // We don't call avatarManager.detach() here to avoid race conditions with React StrictMode.
    //   // The canvas will safely move to the new container automatically on remount.
    // };
  }, []);

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
