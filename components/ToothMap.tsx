
import React from 'react';
import { Tooth, ToothStatus } from '../types';

interface ToothMapProps {
  teeth: Tooth[];
  onToothClick: (tooth: Tooth) => void;
  selectedToothId: number | null;
}

// Tooth Types for scaling and indicators
type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar';

const getToothType = (id: number): ToothType => {
  const n = id % 10;
  if (n === 1 || n === 2) return 'incisor';
  if (n === 3) return 'canine';
  if (n === 4 || n === 5) return 'premolar';
  return 'molar';
};

const getToothScale = (type: ToothType) => {
  switch (type) {
    case 'incisor': return 1;
    case 'canine': return 1.1;
    case 'premolar': return 1.25;
    case 'molar': return 1.5;
  }
};

// Rendering indicators based on tooth type
const ToothIndicator: React.FC<{ type: ToothType; status: ToothStatus }> = ({ type, status }) => {
  const isMissing = status === ToothStatus.MISSING;
  if (isMissing) return null;

  const color = "fill-slate-300 opacity-40";

  switch (type) {
    case 'incisor':
      return <rect x="-5" y="-23" width="10" height="1.5" rx="0.5" className={color} />;
    case 'canine':
      return <path d="M 0 -25 L 4 -20 L 0 -15 L -4 -20 Z" className={color} />;
    case 'premolar':
      return (
        <g className={color}>
          <ellipse cx="-3.5" cy="-21" rx="2" ry="3" />
          <ellipse cx="3.5" cy="-21" rx="2" ry="3" />
        </g>
      );
    case 'molar':
      return (
        <g className={color}>
          <circle cx="-4" cy="-23" r="2.2" />
          <circle cx="4" cy="-23" r="2.2" />
          <circle cx="-4" cy="-17" r="2.2" />
          <circle cx="4" cy="-17" r="2.2" />
        </g>
      );
    default:
      return null;
  }
};

const getToothStyle = (status: ToothStatus, isSelected: boolean) => {
  const base = "transition-all duration-300 cursor-pointer hover:opacity-90";
  const stroke = isSelected ? "stroke-dental-600 stroke-[3]" : "stroke-slate-300 stroke-[1.5]";
  
  let fill = "fill-white";
  let textFill = "fill-slate-400";

  switch (status) {
    case ToothStatus.HEALTHY:
      fill = "fill-white";
      break;
    case ToothStatus.FILLED:
      fill = "fill-blue-50";
      textFill = "fill-blue-600";
      break;
    case ToothStatus.TREATED:
      fill = "fill-red-50";
      textFill = "fill-red-700";
      break;
    case ToothStatus.CROWN:
      fill = "fill-yellow-50";
      textFill = "fill-yellow-700";
      break;
    case ToothStatus.VENEER:
      fill = "fill-purple-50";
      textFill = "fill-purple-700";
      break;
    case ToothStatus.MISSING:
      fill = "fill-slate-100";
      textFill = "fill-slate-300";
      break;
    case ToothStatus.IMPLANT:
      fill = "fill-gray-200";
      textFill = "fill-gray-700";
      break;
    case ToothStatus.ATTENTION:
      fill = "fill-orange-100";
      textFill = "fill-orange-700";
      break;
  }
  
  if (isSelected) fill = "fill-dental-50";

  return { className: `${base} ${fill} ${stroke}`, textClass: `text-[9px] font-bold select-none ${textFill}` };
};

const TOOTH_PATH = "M -11 -18 C -11 -26 11 -26 11 -18 L 10 12 C 10 20 -10 20 -10 12 Z";

// Helper to generate circular/oval layout
const generateCircularPositions = () => {
  const center = { x: 207, y: 200 };
  const rx = 155;
  const ry = 150;
  const pos: Record<number, { x: number; y: number; rot: number }> = {};

  // Upper Teeth (18...11, 21...28)
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  upperTeeth.forEach((id, i) => {
    // Top arc: 195 to 345 degrees
    const startAngle = 195;
    const endAngle = 345;
    const angleDeg = startAngle + (i / (upperTeeth.length - 1)) * (endAngle - startAngle);
    const angleRad = (angleDeg * Math.PI) / 180;
    
    pos[id] = {
      x: center.x + rx * Math.cos(angleRad),
      y: center.y + ry * Math.sin(angleRad),
      rot: angleDeg - 90
    };
  });

  // Lower Teeth (48...41, 31...38)
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  lowerTeeth.forEach((id, i) => {
    // Bottom arc: 165 to 15 degrees
    const startAngle = 165;
    const endAngle = 15;
    const angleDeg = startAngle - (i / (lowerTeeth.length - 1)) * (startAngle - endAngle);
    const angleRad = (angleDeg * Math.PI) / 180;

    pos[id] = {
      x: center.x + rx * Math.cos(angleRad),
      y: center.y + ry * Math.sin(angleRad),
      rot: angleDeg + 90
    };
  });

  return pos;
};

const TOOTH_POSITIONS = generateCircularPositions();

const LEGEND = [
  { label: 'Healthy', className: 'bg-white border border-slate-300' },
  { label: 'Filled', className: 'bg-blue-50 border border-blue-200' },
  { label: 'Root Canal', className: 'bg-red-50 border border-red-200' },
  { label: 'Crown', className: 'bg-yellow-50 border border-yellow-200' },
  { label: 'Veneer', className: 'bg-purple-50 border border-purple-200' },
  { label: 'Missing', className: 'bg-slate-100 border border-slate-300 border-dashed' },
  { label: 'Implant', className: 'bg-gray-200 border border-gray-400' },
  { label: 'Attention', className: 'bg-orange-100 border border-orange-200' },
];

export const ToothMap: React.FC<ToothMapProps> = ({ teeth, onToothClick, selectedToothId }) => {
  return (
    <div className="w-full flex flex-col items-center py-4 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden relative">
      <div className="w-full flex justify-center items-center relative flex-1">
        <svg 
            viewBox="0 0 414 400" 
            className="w-full h-auto max-w-[500px]"
            style={{ maxHeight: '60vh' }}
        >
            {/* Guide Lines */}
            <circle cx="207" cy="200" r="150" fill="none" stroke="#f1f5f9" strokeWidth="40" strokeLinecap="round" />
            <line x1="207" y1="20" x2="207" y2="380" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <line x1="20" y1="200" x2="394" y2="200" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

            <text x="385" y="150" textAnchor="middle" className="fill-slate-300 text-[9px] font-bold tracking-widest uppercase rotate-90">Upper Left</text>
            <text x="29" y="150" textAnchor="middle" className="fill-slate-300 text-[9px] font-bold tracking-widest uppercase -rotate-90">Upper Right</text>
            <text x="385" y="250" textAnchor="middle" className="fill-slate-300 text-[9px] font-bold tracking-widest uppercase rotate-90">Lower Left</text>
            <text x="29" y="250" textAnchor="middle" className="fill-slate-300 text-[9px] font-bold tracking-widest uppercase -rotate-90">Lower Right</text>

            {teeth.map((tooth) => {
              const pos = TOOTH_POSITIONS[tooth.id];
              if (!pos) return null;

              const isSelected = selectedToothId === tooth.id;
              const { className, textClass } = getToothStyle(tooth.status, isSelected);
              const type = getToothType(tooth.id);
              const scale = getToothScale(type);

              const isLower = tooth.id >= 31 && tooth.id <= 48;
              const verticalScale = isLower ? -1 : 1;
              
              const isMissing = tooth.status === ToothStatus.MISSING;
              const finalClassName = isMissing 
                  ? className.replace('fill-slate-100', 'fill-transparent').replace('stroke-[1.5]', 'stroke-[1.5] stroke-dashed opacity-30') 
                  : className;

              return (
                  <g 
                  key={tooth.id} 
                  transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot})`}
                  onClick={() => onToothClick(tooth)}
                  className="cursor-pointer"
                  >
                    <g transform={`scale(${scale}, ${verticalScale * scale})`}>
                        {/* Tooth Shape */}
                        <path 
                            d={TOOTH_PATH} 
                            className={finalClassName}
                            filter={isSelected ? "url(#glow)" : ""}
                        />
                        
                        {/* Anatomical Indicator */}
                        <ToothIndicator type={type} status={tooth.status} />
                    </g>
                    
                    {/* Tooth Number */}
                    <text 
                        y={isLower ? 38 * scale : -38 * scale} 
                        textAnchor="middle" 
                        className={textClass}
                        transform={`rotate(${-pos.rot})`}
                        dy="0.3em"
                    >
                        {tooth.label}
                    </text>

                    {tooth.status === ToothStatus.TREATED && (
                        <circle cy={isLower ? 12 : -12} r="2.5" fill="#ef4444" opacity="0.6" />
                    )}
                  </g>
              );
            })}

            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
            </defs>
        </svg>
      </div>

      <div className="w-full px-6 mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-50 pt-4">
        {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full shadow-sm ${item.className}`} />
                <span className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wide">{item.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};
