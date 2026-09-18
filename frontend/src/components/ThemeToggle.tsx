import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl border border-border bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 text-textPrimary transition-all cursor-pointer shadow-2xs group ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme Mode"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-textPrimary">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
