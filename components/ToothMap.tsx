
import React from 'react';
import { Tooth, ToothStatus } from '../types';

interface ToothMapProps {
  teeth: Tooth[];
  onToothClick: (tooth: Tooth) => void;
  selectedToothId: number | null;
}

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

  return { className: `${base} ${fill} ${stroke}`, textClass: `text-[10px] font-semibold select-none ${textFill}` };
};

// Bigger rounded rectangle tooth shape - all teeth same size
const TOOTH_WIDTH = 24;
const TOOTH_HEIGHT = 36;
const TOOTH_PATH = `M -${TOOTH_WIDTH/2} -${TOOTH_HEIGHT/2}
  Q -${TOOTH_WIDTH/2} -${TOOTH_HEIGHT/2 + 5} 0 -${TOOTH_HEIGHT/2 + 5}
  Q ${TOOTH_WIDTH/2} -${TOOTH_HEIGHT/2 + 5} ${TOOTH_WIDTH/2} -${TOOTH_HEIGHT/2}
  L ${TOOTH_WIDTH/2} ${TOOTH_HEIGHT/2 - 5}
  Q ${TOOTH_WIDTH/2} ${TOOTH_HEIGHT/2} 0 ${TOOTH_HEIGHT/2}
  Q -${TOOTH_WIDTH/2} ${TOOTH_HEIGHT/2} -${TOOTH_WIDTH/2} ${TOOTH_HEIGHT/2 - 5}
  Z`;

// Fixed positions for each tooth - 11/21 at top center, 31/41 at bottom center
const generatePositions = () => {
  const center = { x: 200, y: 200 };
  const pos: Record<number, { x: number; y: number; rot: number; labelX: number; labelY: number }> = {};

  // Same radius for both jaws (equal width)
  const rx = 140;
  const ry = 120;

  const spacing = 11; // degrees between teeth

  // Upper Right: 11-18 (11 at center, 18 at far left)
  // 11 is at 270° - half spacing, going towards 180°
  const upperRight = [11, 12, 13, 14, 15, 16, 17, 18];
  upperRight.forEach((id, i) => {
    const angleDeg = (270 - spacing/2) - i * spacing; // 11 near center, going left
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center.x + rx * Math.cos(angleRad);
    const y = center.y + ry * Math.sin(angleRad);

    // Label position - outside the arc
    const labelX = center.x + (rx + 40) * Math.cos(angleRad);
    const labelY = center.y + (ry + 40) * Math.sin(angleRad);

    pos[id] = { x, y, rot: angleDeg + 90, labelX, labelY };
  });

  // Upper Left: 21-28 (21 at center, 28 at far right)
  // 21 is at 270° + half spacing, going towards 360°
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  upperLeft.forEach((id, i) => {
    const angleDeg = (270 + spacing/2) + i * spacing; // 21 near center, going right
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center.x + rx * Math.cos(angleRad);
    const y = center.y + ry * Math.sin(angleRad);

    const labelX = center.x + (rx + 40) * Math.cos(angleRad);
    const labelY = center.y + (ry + 40) * Math.sin(angleRad);

    pos[id] = { x, y, rot: angleDeg + 90, labelX, labelY };
  });

  // Lower Left: 31-38 (31 at center, 38 at far right)
  // 31 is at 90° + half spacing, going towards 0°
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];
  lowerLeft.forEach((id, i) => {
    const angleDeg = (90 + spacing/2) + i * spacing; // 31 near center, going right
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center.x + rx * Math.cos(angleRad);
    const y = center.y + ry * Math.sin(angleRad);

    const labelX = center.x + (rx + 40) * Math.cos(angleRad);
    const labelY = center.y + (ry + 40) * Math.sin(angleRad);

    pos[id] = { x, y, rot: angleDeg - 90, labelX, labelY };
  });

  // Lower Right: 41-48 (41 at center, 48 at far left)
  // 41 is at 90° - half spacing, going towards 180°
  const lowerRight = [41, 42, 43, 44, 45, 46, 47, 48];
  lowerRight.forEach((id, i) => {
    const angleDeg = (90 - spacing/2) - i * spacing; // 41 near center, going left
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center.x + rx * Math.cos(angleRad);
    const y = center.y + ry * Math.sin(angleRad);

    const labelX = center.x + (rx + 40) * Math.cos(angleRad);
    const labelY = center.y + (ry + 40) * Math.sin(angleRad);

    pos[id] = { x, y, rot: angleDeg - 90, labelX, labelY };
  });

  return pos;
};

const TOOTH_POSITIONS = generatePositions();

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
            viewBox="0 0 400 400"
            className="w-full h-auto max-w-[450px]"
            style={{ maxHeight: '55vh' }}
        >
            {/* Background guide circle */}
            <circle cx="200" cy="200" r="135" fill="none" stroke="#f1f5f9" strokeWidth="50" />

            {/* Center divider lines */}
            <line x1="200" y1="40" x2="200" y2="360" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

            {teeth.map((tooth) => {
              const pos = TOOTH_POSITIONS[tooth.id];
              if (!pos) return null;

              const isSelected = selectedToothId === tooth.id;
              const { className, textClass } = getToothStyle(tooth.status, isSelected);

              const isMissing = tooth.status === ToothStatus.MISSING;
              const finalClassName = isMissing
                  ? className.replace('fill-slate-100', 'fill-transparent').replace('stroke-[1.5]', 'stroke-[1.5] stroke-dashed opacity-40')
                  : className;

              return (
                  <g
                    key={tooth.id}
                    onClick={() => onToothClick(tooth)}
                    className="cursor-pointer"
                  >
                    {/* Tooth Shape */}
                    <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot})`}>
                      <path
                          d={TOOTH_PATH}
                          className={finalClassName}
                          filter={isSelected ? "url(#glow)" : ""}
                      />
                    </g>

                    {/* Tooth Number - positioned outside the arc */}
                    <text
                        x={pos.labelX}
                        y={pos.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={textClass}
                    >
                        {tooth.label}
                    </text>
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
