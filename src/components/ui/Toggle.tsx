'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export default function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative rounded-full transition-all duration-200',
          size === 'sm' ? 'w-8 h-4' : 'w-11 h-6',
          checked ? 'bg-red-600' : 'bg-white/20'
        )}
      >
        <div className={cn(
          'absolute top-0.5 rounded-full bg-white shadow transition-all duration-200',
          size === 'sm' ? 'w-3 h-3' : 'w-5 h-5',
          checked
            ? size === 'sm' ? 'left-4' : 'left-5'
            : 'left-0.5'
        )} />
      </div>
      {label && <span className="text-sm text-white/70">{label}</span>}
    </label>
  );
}
