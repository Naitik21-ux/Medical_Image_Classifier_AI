
import React, { useState, useRef, useEffect } from 'react';
import type { Theme } from '../App';

const ChevronIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  theme: Theme;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, disabled = false, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const buttonClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';
  
  const dropdownClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-600'
    : 'bg-white border-gray-200';
    
  const optionClasses = theme === 'dark'
    ? 'text-gray-200 hover:bg-cyan-600 hover:text-white focus:bg-cyan-600 focus:text-white'
    : 'text-gray-800 hover:bg-cyan-500 hover:text-white focus:bg-cyan-500 focus:text-white';


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`relative w-full rounded-md shadow-sm py-3 px-4 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${buttonClasses}`}
      >
        <span>{value}</span>
        <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div
          role="listbox"
          className={`absolute z-10 mt-1 w-full shadow-lg rounded-md max-h-60 overflow-auto focus:outline-none animate-fade-in border ${dropdownClasses}`}
        >
          {options.map((option) => (
            <button
              key={option}
              role="option"
              aria-selected={option === value}
              onClick={() => handleSelect(option)}
              className={`block w-full text-left px-4 py-2 text-sm focus:outline-none ${optionClasses}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};