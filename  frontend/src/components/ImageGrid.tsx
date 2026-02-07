import type { DragEndEvent } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { ImageFile } from '../types';
import ImagePreview from './ImagePreview';

interface ImageGridProps {
  images: ImageFile[];
  onReorder: (images: ImageFile[]) => void;
  onRemove: (id: string) => void;
}

export default function ImageGrid({ images, onReorder, onRemove }: ImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Uploaded Images 
          <span className="ml-2 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
            {images.length} {images.length === 1 ? 'page' : 'pages'}
          </span>
        </h2>
        <p className="text-sm text-gray-400">
          Drag to reorder
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <ImagePreview
                key={image.id}
                image={image}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
