import React, { useState, useRef } from 'react';
import { Treatment } from '../types';
import { Calendar, DollarSign, FileImage, Edit3, Trash2 } from 'lucide-react';

interface TimelineProps {
  treatments: Treatment[];
  onSelectTreatment: (t: Treatment) => void;
  onToothClick: (id: number) => void;
  onEditTreatment?: (t: Treatment) => void;
  onDeleteTreatment?: (id: string) => void;
}

interface SwipeableItemProps {
  treatment: Treatment;
  onToothClick: (id: number) => void;
  onEditTreatment?: (t: Treatment) => void;
  onDeleteTreatment?: (id: string) => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ treatment, onToothClick, onEditTreatment, onDeleteTreatment }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteThreshold = -80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    // Only allow swiping left (negative diff)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
    } else if (translateX < 0) {
      // Allow swiping back right
      setTranslateX(Math.min(0, translateX + diff));
      startX.current = currentX.current;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX < deleteThreshold) {
      // Show delete button
      setTranslateX(-80);
      setShowDeleteConfirm(true);
    } else {
      // Snap back
      setTranslateX(0);
      setShowDeleteConfirm(false);
    }
  };

  const handleDelete = () => {
    if (onDeleteTreatment) {
      onDeleteTreatment(treatment.id);
    }
  };

  const handleCancelDelete = () => {
    setTranslateX(0);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete Button Background */}
      <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
        {showDeleteConfirm ? (
          <button onClick={handleDelete} className="text-white p-2">
            <Trash2 size={24} />
          </button>
        ) : (
          <Trash2 size={20} className="text-white opacity-50" />
        )}
      </div>

      {/* Main Content */}
      <div
        className="bg-white p-4 border border-slate-200 relative"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={showDeleteConfirm ? handleCancelDelete : undefined}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-dental-100 p-2 rounded-full text-dental-600">
              <span className="font-bold text-xs">{treatment.type.substring(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{treatment.type}</h4>
              <span className="text-xs text-slate-500">{new Date(treatment.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {treatment.toothId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToothClick(treatment.toothId!);
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors"
              >
                Tooth {treatment.toothId}
              </button>
            )}
            {onEditTreatment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTreatment(treatment);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                title="Edit treatment"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
        </div>

        {treatment.notes && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{treatment.notes}</p>}

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {treatment.cost && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded">
              <DollarSign size={12} /> {treatment.cost} {treatment.currency}
            </span>
          )}
          {treatment.attachments.length > 0 && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              <FileImage size={12} /> {treatment.attachments.length} Photos
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({ treatments, onSelectTreatment, onToothClick, onEditTreatment, onDeleteTreatment }) => {
  const sortedTreatments = [...treatments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedTreatments.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Calendar className="mx-auto mb-3 opacity-50" size={40} />
        <p>No treatments recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400 text-center">Swipe left to delete</p>
      {sortedTreatments.map((t) => (
        <SwipeableItem
          key={t.id}
          treatment={t}
          onToothClick={onToothClick}
          onEditTreatment={onEditTreatment}
          onDeleteTreatment={onDeleteTreatment}
        />
      ))}
    </div>
  );
};
