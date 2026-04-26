import { ColorStr } from '../engine/types';

export const BorderColorMap: Record<ColorStr | 'U', string> = {
  'R': 'border-red-500',
  'G': 'border-green-500',
  'B': 'border-blue-500',
  'U': 'border-slate-500',
};

export const ColorMap: Record<ColorStr | 'U', string> = {
  'R': 'bg-red-500',
  'G': 'bg-green-500',
  'B': 'bg-blue-500',
  'U': 'bg-slate-500',
};

export const TextColorMap: Record<ColorStr, string> = {
  'R': 'text-red-500',
  'G': 'text-green-500',
  'B': 'text-blue-500',
};
