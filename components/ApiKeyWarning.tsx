
import React from 'react';
import type { Theme } from '../App';

interface ApiKeyWarningProps {
  theme: Theme;
}

export const ApiKeyWarning: React.FC<ApiKeyWarningProps> = ({ theme }) => {
  const warningClasses = theme === 'dark'
    ? 'bg-yellow-900/50 border-yellow-600 text-yellow-200'
    : 'bg-yellow-100 border-yellow-400 text-yellow-800';

  return (
    <div className={`${warningClasses} border px-4 py-3 rounded-lg relative mb-6 shadow-lg`} role="alert">
      <strong className="font-bold">Configuration Warning:</strong>
      <span className="block sm:inline ml-2">An API key has not been provided. The analysis functionality will be disabled.</span>
    </div>
  );
};