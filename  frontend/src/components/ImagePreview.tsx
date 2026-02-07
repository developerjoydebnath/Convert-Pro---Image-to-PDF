import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { ImageFile } from '../types';

interface ImagePreviewProps {
  image: ImageFile;
  index: number;
  onRemove: (id: string) => void;
}

export default function ImagePreview({ image, index, onRemove }: ImagePreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`image-card glass-card relative overflow-hidden group ${
        isDragging ? 'dragging' : ''
      }`}
    >
      {/* Page Number Badge */}
      <div className="page-badge absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-3 right-12 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(image.id)}
        className="remove-btn absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-all"
        title="Remove image"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={image.previewUrl}
          alt={`Page ${index + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Filename */}
      <div className="p-3 border-t border-white/5">
        <p className="text-xs text-gray-400 truncate" title={image.file.name}>
          {image.file.name}
        </p>
      </div>
    </div>
  );
}
