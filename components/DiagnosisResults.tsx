
import React from 'react';
import type { DiagnosisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Spinner } from './Spinner';
import type { Theme } from '../App';

interface DiagnosisResultsProps {
  image: string | null;
  results: DiagnosisResult | null;
  isLoading: boolean;
  error: string | null;
  theme: Theme;
}

const AttentionMap: React.FC<{ image: string; results: DiagnosisResult }> = ({ image, results }) => {
  return (
    <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
      <img src={image} alt="X-ray with attention map" className="object-contain w-full h-full" />
      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {results.diagnoses.map((diag, index) => {
          const color = `hsla(${200 + index * 40}, 90%, 60%, 0.5)`;
          const strokeColor = `hsla(${200 + index * 40}, 90%, 60%, 0.9)`;
          return (
            <circle
              key={diag.condition}
              cx={diag.attentionArea.x}
              cy={diag.attentionArea.y}
              r={diag.attentionArea.radius}
              fill={color}
              stroke={strokeColor}
              strokeWidth="0.5"
              style={{
                filter: `blur(${diag.attentionArea.radius / 10}px)`,
                transformOrigin: `${diag.attentionArea.x}% ${diag.attentionArea.y}%`,
                animation: 'pulse 2s infinite ease-in-out',
                animationDelay: `${index * 0.2}s`
              }}
            />
          );
        })}
      </svg>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const tooltipClasses = theme === 'dark' 
      ? 'bg-gray-800 border-gray-600 text-gray-200' 
      : 'bg-white border-gray-300 text-gray-800';
    return (
      <div className={`p-2 border rounded-md shadow-lg ${tooltipClasses}`}>
        <p className="label">{`${label} : ${(payload[0].value * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

export const DiagnosisResults: React.FC<DiagnosisResultsProps> = ({ image, results, isLoading, error, theme }) => {
  const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const headingColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const placeholderIconColor = theme === 'dark' ? 'text-gray-600' : 'text-gray-400';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner size="lg" className={textColor} />
        <h3 className={`text-xl font-semibold mt-4 ${textColor}`}>Analyzing X-Ray...</h3>
        <p className={`${subTextColor} mt-1`}>This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-500 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold mt-4">Analysis Failed</h3>
        <p className="text-red-600/80 dark:text-red-400/80 mt-1">{error}</p>
      </div>
    );
  }
  
  if (!results || !image) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${placeholderIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.102-.128.22-.254.354-.372M9.75 3.104A2.25 2.25 0 007.5 1.5h-3A2.25 2.25 0 002.25 3.75v16.5A2.25 2.25 0 004.5 22.5h15A2.25 2.25 0 0021.75 20.25V3.75A2.25 2.25 0 0019.5 1.5h-3a2.25 2.25 0 00-2.25 1.604M14.25 14.5l-4.25 4.5a2.25 2.25 0 000 3.182l4.25 4.5a2.25 2.25 0 003.182 0l4.25-4.5a2.25 2.25 0 000-3.182l-4.25-4.5a2.25 2.25 0 00-3.182 0z" />
        </svg>
        <h3 className={`text-xl font-semibold mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Awaiting Analysis</h3>
        <p className={`${subTextColor} mt-1`}>Upload an X-ray image to begin.</p>
      </div>
    );
  }
  
  const COLORS = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];
  const chartGridColor = theme === 'dark' ? '#4a5568' : '#e2e8f0';
  const chartYAxisColor = theme === 'dark' ? '#d1d5db' : '#374151';
  const chartBarBgColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const chartCursorColor = theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.4)';
  const reportBg = theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-200';
  const reportText = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-xl font-semibold ${headingColor} mb-2`}>Attention Map</h3>
        <p className={`text-sm ${subTextColor} mb-4`}>Highlighted areas indicate regions the AI focused on for its diagnosis.</p>
        <AttentionMap image={image} results={results} />
      </div>
      <div>
        <h3 className={`text-xl font-semibold ${headingColor} mb-4`}>Diagnosis Probabilities</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.diagnoses} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis type="number" domain={[0, 1]} hide={true} />
              <YAxis dataKey="condition" type="category" width={100} tick={{ fill: chartYAxisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: chartCursorColor }}/>
              <Bar dataKey="probability" background={{ fill: chartBarBgColor }}>
                {results.diagnoses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {results.radiologistReport && (
        <div>
          <h3 className={`text-xl font-semibold ${headingColor} mb-2`}>AI Radiologist's Report</h3>
           <p className={`text-sm ${subTextColor} mb-4`}>A narrative summary of the AI's findings in a clinical tone.</p>
          <div className={`p-4 rounded-lg border ${reportBg}`}>
            <p className={`${reportText} whitespace-pre-wrap font-serif leading-relaxed`}>
              {results.radiologistReport}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};