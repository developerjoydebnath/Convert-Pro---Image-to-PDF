import { Upload } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';
import { useRef, useState } from 'react';
import type { ImageFile } from '../types';

interface ImageUploadCardProps {
  onImagesAdd: (images: ImageFile[]) => void;
}

export default function ImageUploadCard({ onImagesAdd }: ImageUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        imageFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    if (imageFiles.length > 0) {
      onImagesAdd(imageFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`upload-zone glass-card cursor-pointer p-12 text-center transition-all duration-300 ${
        isDragOver ? 'drag-over' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-6">
        <div className={`relative ${isDragOver ? 'float-animation' : ''}`}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Upload className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {isDragOver ? 'Drop your images here' : 'Upload Images'}
          </h3>
          <p className="text-gray-400 text-sm max-w-md">
            Drag and drop your images here, or click to browse.
            <br />
            <span className="text-purple-400">Supports JPG, PNG, GIF, WebP</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Multiple files supported
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Any image size
          </span>
        </div>
      </div>
    </div>
  );
}
