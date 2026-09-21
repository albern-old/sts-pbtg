import React from 'react';
import { motion } from 'motion/react';

interface Option<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={name}
      className="relative flex items-center p-1.5 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]/80 w-full"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[13px] font-semibold tracking-[-0.01em] transition-colors z-10 cursor-pointer rounded-full ${
              isActive ? 'text-[#0f172a] font-bold' : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-indicator-${name}`}
                className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.08)] border border-[#e2e8f0]/60 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            {option.icon && <span className="w-4 h-4 flex items-center justify-center">{option.icon}</span>}
            <span className="whitespace-nowrap">{option.label}</span>
            {option.badge && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-[#10b981]/15 text-[#006c49]">
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
