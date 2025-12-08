import { Tooth, ToothStatus } from './types';

// Standard FDI Notation Layout
// Quadrant 1: Upper Right (18 to 11)
// Quadrant 2: Upper Left (21 to 28)
// Quadrant 3: Lower Left (38 to 31) -> In chart displayed as 31-38 from center
// Quadrant 4: Lower Right (48 to 41) -> In chart displayed as 41-48 from center

export const INITIAL_TEETH: Tooth[] = [
  // Upper Right (18-11)
  { id: 18, label: '18', status: ToothStatus.HEALTHY },
  { id: 17, label: '17', status: ToothStatus.HEALTHY },
  { id: 16, label: '16', status: ToothStatus.HEALTHY },
  { id: 15, label: '15', status: ToothStatus.HEALTHY },
  { id: 14, label: '14', status: ToothStatus.HEALTHY },
  { id: 13, label: '13', status: ToothStatus.HEALTHY },
  { id: 12, label: '12', status: ToothStatus.HEALTHY },
  { id: 11, label: '11', status: ToothStatus.HEALTHY },
  // Upper Left (21-28)
  { id: 21, label: '21', status: ToothStatus.HEALTHY },
  { id: 22, label: '22', status: ToothStatus.HEALTHY },
  { id: 23, label: '23', status: ToothStatus.HEALTHY },
  { id: 24, label: '24', status: ToothStatus.HEALTHY },
  { id: 25, label: '25', status: ToothStatus.HEALTHY },
  { id: 26, label: '26', status: ToothStatus.HEALTHY },
  { id: 27, label: '27', status: ToothStatus.HEALTHY },
  { id: 28, label: '28', status: ToothStatus.HEALTHY },
  // Lower Left (31-38)
  { id: 31, label: '31', status: ToothStatus.HEALTHY },
  { id: 32, label: '32', status: ToothStatus.HEALTHY },
  { id: 33, label: '33', status: ToothStatus.HEALTHY },
  { id: 34, label: '34', status: ToothStatus.HEALTHY },
  { id: 35, label: '35', status: ToothStatus.HEALTHY },
  { id: 36, label: '36', status: ToothStatus.HEALTHY },
  { id: 37, label: '37', status: ToothStatus.HEALTHY },
  { id: 38, label: '38', status: ToothStatus.HEALTHY },
  // Lower Right (41-48)
  { id: 41, label: '41', status: ToothStatus.HEALTHY },
  { id: 42, label: '42', status: ToothStatus.HEALTHY },
  { id: 43, label: '43', status: ToothStatus.HEALTHY },
  { id: 44, label: '44', status: ToothStatus.HEALTHY },
  { id: 45, label: '45', status: ToothStatus.HEALTHY },
  { id: 46, label: '46', status: ToothStatus.HEALTHY },
  { id: 47, label: '47', status: ToothStatus.HEALTHY },
  { id: 48, label: '48', status: ToothStatus.HEALTHY },
];

export const STATUS_COLORS: Record<ToothStatus, string> = {
  [ToothStatus.HEALTHY]: 'bg-white border-slate-300 text-slate-700',
  [ToothStatus.FILLED]: 'bg-blue-100 border-blue-500 text-blue-800',
  [ToothStatus.TREATED]: 'bg-red-50 border-red-400 text-red-800',
  [ToothStatus.CROWN]: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  [ToothStatus.VENEER]: 'bg-purple-50 border-purple-400 text-purple-800',
  [ToothStatus.MISSING]: 'bg-slate-100 border-slate-200 text-slate-300 opacity-60 dashed-border',
  [ToothStatus.IMPLANT]: 'bg-gray-200 border-gray-600 text-gray-900',
  [ToothStatus.ATTENTION]: 'bg-orange-100 border-orange-500 text-orange-800 ring-2 ring-orange-200',
};