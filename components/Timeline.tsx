import React from 'react';
import { Treatment } from '../types';
import { Calendar, DollarSign, Shield, FileImage, ArrowRight } from 'lucide-react';

interface TimelineProps {
  treatments: Treatment[];
  onSelectTreatment: (t: Treatment) => void;
  onToothClick: (id: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ treatments, onSelectTreatment, onToothClick }) => {
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
    <div className="space-y-4">
      {sortedTreatments.map((t) => (
        <div 
            key={t.id} 
            className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectTreatment(t)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <div className="bg-dental-100 p-2 rounded-full text-dental-600">
                     {/* Icon based on type could go here */}
                     <span className="font-bold text-xs">{t.type.substring(0,2).toUpperCase()}</span>
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">{t.type}</h4>
                    <span className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</span>
                </div>
            </div>
             {t.toothId && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToothClick(t.toothId!);
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                    Tooth {t.toothId} <ArrowRight size={10} />
                </button>
            )}
          </div>

          {t.notes && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{t.notes}</p>}

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {t.cost && (
                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded">
                    <DollarSign size={12} /> {t.cost} {t.currency}
                </span>
            )}
            {t.warrantyUntil && (
                <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                    <Shield size={12} /> Until {new Date(t.warrantyUntil).toLocaleDateString()}
                </span>
            )}
            {t.attachments.length > 0 && (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    <FileImage size={12} /> {t.attachments.length} Photos
                </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};