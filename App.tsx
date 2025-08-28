
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DiagnosisResults } from './components/DiagnosisResults';
import { getDiagnosis } from './services/diagnosisService';
import type { DiagnosisResult } from './types';
import { ApiKeyWarning } from './components/ApiKeyWarning';

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyPart, setBodyPart] = useState<string>('Chest');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('dark');

  // Effect to set initial theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Effect to apply theme changes to the DOM and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // In a pure client-side setup without a build process, process.env.API_KEY 
  // needs to be made available to the browser for this check to work.
  useEffect(() => {
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable not found.");
      setIsApiKeyMissing(true);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setDiagnosis(null);
    setError(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setUploadedImage(base64Image);
      try {
        const result = await getDiagnosis(base64Image, bodyPart);
        setDiagnosis(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      setIsLoading(false);
    };
  }, [bodyPart]);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setDiagnosis(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-gray-200' 
    : 'bg-gray-50 text-gray-800';

  return (
    <div className={`min-h-screen ${themeClasses} font-sans transition-colors duration-300`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-8">
        {isApiKeyMissing && <ApiKeyWarning theme={theme} />}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            AI-Powered X-Ray Analysis
          </h2>
          <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Upload an X-ray to receive a simulated diagnostic analysis, including condition probabilities and an explanatory attention map. For educational purposes only.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-2xl border backdrop-blur-sm`}>
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              isProcessing={isLoading} 
              uploadedImage={uploadedImage}
              onReset={handleReset}
              selectedBodyPart={bodyPart}
              onBodyPartChange={setBodyPart}
              disabled={isApiKeyMissing}
              theme={theme}
            />
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-2xl border backdrop-blur-sm min-h-[500px]`}>
            <DiagnosisResults
              image={uploadedImage}
              results={diagnosis}
              isLoading={isLoading}
              error={error}
              theme={theme}
            />
          </div>
        </div>

        <footer className={`text-center mt-12 py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-sm`}>
          <p>Disclaimer: This is a demonstration project and not a medical tool. Do not use for actual medical diagnosis.</p>
          <p>&copy; 2024 GenAI Labs. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;