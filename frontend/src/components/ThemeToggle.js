import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <div className={`theme-toggle-slider ${theme}`}>
        <div className="toggle-knob">
          {theme === 'dark' ? <FaMoon className="toggle-icon moon" /> : <FaSun className="toggle-icon sun" />}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
