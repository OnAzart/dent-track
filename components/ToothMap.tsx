import React from 'react';
import { Tooth, ToothStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface ToothMapProps {
  teeth: Tooth[];
  onToothClick: (tooth: Tooth) => void;
  selectedToothId: number | null;
}

const Quadrant: React.FC<{ 
  teeth: Tooth[]; 
  onToothClick: (t: Tooth) => void;
  selectedToothId: number | null;
}> = ({ teeth, onToothClick, selectedToothId }) => {
  return (
    <div className="flex gap-1 sm:gap-2">
      {teeth.map((tooth) => (
        <button
          key={tooth.id}
          onClick={() => onToothClick(tooth)}
          className={`
            relative w-8 h-10 sm:w-10 sm:h-14 rounded-md border-2 flex items-center justify-center
            transition-all duration-200 transform hover:scale-110 hover:z-10 shadow-sm
            ${STATUS_COLORS[tooth.status]}
            ${selectedToothId === tooth.id ? 'ring-4 ring-dental-500 z-20 scale-110' : ''}
            ${tooth.status === ToothStatus.MISSING ? 'border-dashed' : 'border-solid'}
          `}
          title={`Tooth ${tooth.id} - ${tooth.status}`}
        >
          <span className="text-xs font-bold select-none">{tooth.label}</span>
          
          {/* Visual indicators for specific procedures */}
          {tooth.status === ToothStatus.TREATED && (
            <div className="absolute bottom-1 w-1 h-3 bg-red-400 rounded-full opacity-50"></div>
          )}
          {tooth.status === ToothStatus.IMPLANT && (
             <div className="absolute -bottom-1 w-2 h-4 bg-gray-500 rounded-sm"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export const ToothMap: React.FC<ToothMapProps> = ({ teeth, onToothClick, selectedToothId }) => {
  // Explicitly sort quadrants for visual display
  // Quadrant 1 (UR): 18 -> 11 (Right side of patient, Left side of screen)
  const ur = teeth
    .filter(t => t.id >= 11 && t.id <= 18)
    .sort((a, b) => b.id - a.id);

  // Quadrant 2 (UL): 21 -> 28 (Left side of patient, Right side of screen)
  const ul = teeth
    .filter(t => t.id >= 21 && t.id <= 28)
    .sort((a, b) => a.id - b.id);

  // Quadrant 4 (LR): 48 -> 41 (Right side of patient, Left side of screen)
  const lr = teeth
    .filter(t => t.id >= 41 && t.id <= 48)
    .sort((a, b) => b.id - a.id);

  // Quadrant 3 (LL): 31 -> 38 (Left side of patient, Right side of screen)
  const ll = teeth
    .filter(t => t.id >= 31 && t.id <= 38)
    .sort((a, b) => a.id - b.id);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-slate-100 select-none">
      
      {/* Upper Jaw */}
      <div className="mb-8 relative">
        <h3 className="text-center text-slate-400 text-xs tracking-widest uppercase mb-2">Upper Arch</h3>
        <div className="flex gap-4 sm:gap-8 justify-center items-end">
          <Quadrant teeth={ur} onToothClick={onToothClick} selectedToothId={selectedToothId} />
          <div className="w-px h-12 bg-slate-200 mx-1 hidden sm:block"></div>
          <Quadrant teeth={ul} onToothClick={onToothClick} selectedToothId={selectedToothId} />
        </div>
      </div>

      {/* Lower Jaw */}
      <div className="relative">
        <div className="flex gap-4 sm:gap-8 justify-center items-start">
          <Quadrant teeth={lr} onToothClick={onToothClick} selectedToothId={selectedToothId} />
           <div className="w-px h-12 bg-slate-200 mx-1 hidden sm:block"></div>
          <Quadrant teeth={ll} onToothClick={onToothClick} selectedToothId={selectedToothId} />
        </div>
        <h3 className="text-center text-slate-400 text-xs tracking-widest uppercase mt-2">Lower Arch</h3>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs text-slate-600">
        {Object.values(ToothStatus).map(status => (
           <div key={status} className="flex items-center gap-1.5">
             <div className={`w-3 h-3 border rounded-sm ${STATUS_COLORS[status].split(' ')[0]} ${STATUS_COLORS[status].split(' ')[1]}`}></div>
             <span>{status}</span>
           </div>
        ))}
      </div>
    </div>
  );
};