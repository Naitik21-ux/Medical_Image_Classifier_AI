
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';
import { Spinner } from './Spinner';
import { CustomDropdown } from './CustomDropdown';
import type { Theme } from '../App';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
  uploadedImage: string | null;
  onReset: () => void;
  selectedBodyPart: string;
  onBodyPartChange: (part: string) => void;
  disabled?: boolean;
  theme: Theme;
}

const bodyPartOptions = ['Chest', 'Skull', 'Hand', 'Foot', 'Spine', 'Abdomen', 'Pelvis'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageUpload, 
    isProcessing, 
    uploadedImage, 
    onReset,
    selectedBodyPart,
    onBodyPartChange,
    disabled = false,
    theme
}) => {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
    setDragOver(false);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    multiple: false,
    disabled: isProcessing || !!uploadedImage || disabled,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  const headingColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  
  const baseClasses = "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out";
  const idleClasses = theme === 'dark' 
    ? "border-gray-600 bg-gray-700/20 hover:bg-gray-700/40" 
    : "border-gray-300 bg-gray-50 hover:bg-gray-100";
  const activeClasses = theme === 'dark'
    ? "border-cyan-400 bg-cyan-900/30"
    : "border-cyan-500 bg-cyan-50";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  if (uploadedImage) {
    return (
        <div className="space-y-4">
            <h3 className={`text-xl font-semibold ${headingColor}`}>Uploaded X-Ray</h3>
            <div className="relative aspect-square w-full bg-black rounded-lg overflow-hidden">
                <img src={uploadedImage} alt="Uploaded X-ray" className="object-contain w-full h-full" />
            </div>
            <button
                onClick={onReset}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isProcessing ? <Spinner className="text-white" /> : 'Analyze Another Image'}
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <h3 className={`text-xl font-semibold ${headingColor} mb-3`}>1. Select Body Part</h3>
        <label htmlFor="body-part" className="sr-only">
          Body Part
        </label>
        <CustomDropdown
          options={bodyPartOptions}
          value={selectedBodyPart}
          onChange={onBodyPartChange}
          disabled={isProcessing || disabled}
          theme={theme}
        />
      </div>

      <div>
        <h3 className={`text-xl font-semibold ${headingColor} mb-3`}>2. Upload Image</h3>
        <div {...getRootProps()} className={`${baseClasses} ${isDragActive || dragOver ? activeClasses : idleClasses} ${disabled ? disabledClasses : ''}`}>
            <input {...getInputProps()} />
            <div className="text-center">
                <UploadIcon className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-cyan-300' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`} />
                <p className={`font-semibold text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    <span className="text-cyan-400">Click to upload</span> or drag and drop
                </p>
                <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>PNG or JPG</p>
            </div>
        </div>
      </div>
      
      {isProcessing && (
        <div className={`flex items-center justify-center space-x-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
          <Spinner />
          <span>Analyzing image...</span>
        </div>
      )}
    </div>
  );
};