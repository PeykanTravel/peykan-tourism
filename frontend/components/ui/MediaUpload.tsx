'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, ImageIcon, FileIcon } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (files: File[]) => void;
  onRemove?: (index: number) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  uploadedFiles?: File[];
  className?: string;
}

export default function MediaUpload({
  onUpload,
  onRemove,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles = 5,
  maxFileSize = 10,
  uploadedFiles = [],
  className
}: MediaUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
    } else if (validFiles.length > 0) {
      onUpload(validFiles);
    }

    setErrors(newErrors);
  }, [onUpload, uploadedFiles.length, maxFiles, maxFileSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          id="media-upload"
        />
        
        <label htmlFor="media-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500">
            Supports: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max {maxFiles} files, {maxFileSize}MB each
          </p>
        </label>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  ) : (
                    <FileIcon className="w-8 h-8 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {onRemove && (
                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 