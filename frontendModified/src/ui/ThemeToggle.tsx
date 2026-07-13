import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex items-center justify-center rounded-lg border w-9 h-9 transition-colors
        border-lk-border bg-lk-s2 text-lk-t2 hover:text-lk-accent
        dark:border-dk-border dark:bg-dk-s2 dark:text-dk-t2 dark:hover:text-dk-accent
        ${className}`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
