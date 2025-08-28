
import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { Theme } from '../App';

interface HeaderProps {
    theme: Theme;
    toggleTheme: () => void;
}

const DnaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.964 1.342c.162-.27.492-.37.765-.21l.104.06 4.33 2.5c.273.158.372.488.214.76l-.06.105-3.83 6.634 5.426 3.133c.273.158.372.488.214.76l-.06.105-4.33 2.5c-.273.158-.603.058-.765-.21l-.04-.07-1.5-2.598-1.5 2.598c-.162.27-.492.37-.765.21l-.104-.06-4.33-2.5c-.273-.158-.372-.488-.214-.76l.06-.105L9.6 14.867 4.174 11.734c-.273-.158-.372-.488-.214-.76l.06-.105 4.33-2.5c.273-.158.603-.058.765.21l.04.07 1.5 2.598 1.5-2.598Z"/>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    const headerClasses = theme === 'dark'
        ? 'bg-gray-900/80 border-gray-700'
        : 'bg-white/80 border-gray-200';
    const textClasses = theme === 'dark' ? 'text-white' : 'text-gray-900';
    
  return (
    <header className={`${headerClasses} backdrop-blur-lg sticky top-0 z-50 border-b transition-colors duration-300`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <DnaIcon className="h-8 w-8 text-cyan-400"/>
            <span className={`ml-3 text-2xl font-bold ${textClasses}`}>X-Ray Vision AI</span>
          </div>
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  );
};
