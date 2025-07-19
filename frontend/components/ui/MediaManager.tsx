'use client';

import React, { useState, useCallback } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage, FaVideo, FaFile, FaExpand, FaPlay, FaPause } from 'react-icons/fa';
import OptimizedImage from './OptimizedImage';
import Modal from './Modal';

interface MediaItem {
  id: string | number;
  src: string;
  alt: string;
  type: 'image' | 'video';
  thumbnail?: string;
  caption?: string;
}

interface MediaManagerProps {
  items: MediaItem[];
  onUpload?: (files: File[]) => void;
  onRemove?: (item: MediaItem) => void;
  onItemClick?: (item: MediaItem, index: number) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  showUpload?: boolean;
  showGallery?: boolean;
  showLightbox?: boolean;
  columns?: number;
  gap?: number;
  uploadText?: string;
  dragText?: string;
}

const MediaManager: React.FC<MediaManagerProps> = ({
  items = [],
  onUpload,
  onRemove,
  onItemClick,
  multiple = false,
  accept = 'image/*,video/*',
  maxSize = 10,
  maxFiles = 5,
  className = '',
  disabled = false,
  showUpload = true,
  showGallery = true,
  showLightbox = true,
  columns = 3,
  gap = 4,
  uploadText = 'فایل‌ها را آپلود کنید',
  dragText = 'یا فایل‌ها را اینجا بکشید'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `فایل ${file.name} بزرگتر از ${maxSize}MB است`;
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `نوع فایل ${file.name} پشتیبانی نمی‌شود`;
    }

    return null;
  }, [accept, maxSize]);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || !onUpload) return;

    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    if (items.length + fileArray.length > maxFiles) {
      newErrors.push(`حداکثر ${maxFiles} فایل مجاز است`);
      setErrors(newErrors);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  }, [items.length, maxFiles, validateFile, onUpload]);

  // Handle drag and drop
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
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (e.target) {
      e.target.value = '';
    }
  }, [handleFileSelect]);

  // Lightbox functions
  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
    onItemClick?.(items[index], index);
  }, [items, onItemClick]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => prev === 0 ? items.length - 1 : (prev || 0) - 1);
  }, [selectedIndex, items.length]);

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => prev === null || prev >= items.length - 1 ? 0 : prev + 1);
  }, [selectedIndex, items.length]);

  // Get grid classes
  const getGridColsClass = () => {
    const colsMap: { [key: number]: string } = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };
    return colsMap[columns] || colsMap[3];
  };

  const getGapClass = () => {
    const gapMap: { [key: number]: string } = {
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8'
    };
    return gapMap[gap] || gapMap[4];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      {showUpload && onUpload && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('media-upload-input')?.click()}
        >
          <input
            id="media-upload-input"
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {uploadText}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {dragText}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            حداکثر اندازه: {maxSize}MB | انواع مجاز: {accept}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Gallery Section */}
      {showGallery && items.length > 0 && (
        <div className={`grid ${getGridColsClass()} ${getGapClass()}`}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => showLightbox && openLightbox(index)}
            >
              {/* Media Item */}
              <div className="aspect-square relative">
                {item.type === 'image' ? (
                  <OptimizedImage
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.src}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaPlay className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaExpand className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Remove Button */}
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                )}

                {/* Caption */}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{item.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showGallery && items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🖼️</div>
          <p>هیچ تصویری برای نمایش وجود ندارد</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedIndex !== null && (
        <Modal
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
          showCloseButton={true}
          closeOnOverlayClick={true}
          size="xl"
          className="p-0"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-2 rounded-full"
                >
                  ←
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-2 rounded-full"
                >
                  →
                </button>
              </>
            )}

            {/* Main Content */}
            <div className="max-w-full max-h-full">
              {items[selectedIndex].type === 'image' ? (
                <OptimizedImage
                  src={items[selectedIndex].src}
                  alt={items[selectedIndex].alt}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={items[selectedIndex].src}
                  className="max-w-full max-h-full"
                  controls
                  autoPlay
                />
              )}
            </div>

            {/* Caption */}
            {items[selectedIndex].caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-lg font-medium bg-black/50 px-4 py-2 rounded-lg">
                  {items[selectedIndex].caption}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MediaManager; 