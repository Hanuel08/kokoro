import { useTheme } from "../context/ThemeContext";
import { IconSettings } from "@tabler/icons-react";
import logo from "../../public/assets/img/kokoro-logo-sin-fondo.png";

export function Header({ onOpenConfig }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border bg-white/50 dark:bg-dark-base/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Kokoro logo" className="w-8 h-8" />
        <h1 className="text-xl font-semibold text-primary">
          Kokoro
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenConfig}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          aria-label="Open settings"
        >
          <IconSettings size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
