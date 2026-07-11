'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const applyTheme = (nextTheme: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const nextTheme = storedTheme === 'light' ? 'light' : 'dark';
    applyTheme(nextTheme);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      applyTheme('light');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      applyTheme('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="p-2.5 rounded-xl bg-slate-100/70 hover:bg-slate-200 dark:bg-[#1f1f23] dark:hover:bg-[#28282f] text-slate-700 dark:text-slate-300 transition-colors duration-150"
    >
      {theme === 'dark' ? (
        <Sun className="w-4.5 h-4.5 text-amber-400" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-indigo-600" />
      )}
    </button>
  );
}