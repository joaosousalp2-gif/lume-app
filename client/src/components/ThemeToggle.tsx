import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      title={`Tema ${theme === 'dark' ? 'Claro' : 'Escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
