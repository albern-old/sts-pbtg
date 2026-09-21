import React from 'react';
import { AlertCircle, CheckCircle2, Dumbbell, ShieldAlert, Utensils } from 'lucide-react';
import { BMICategoryInfo } from '../types';

interface StatusCardProps {
  category: BMICategoryInfo;
  weightDelta: number; // in kg (or formatted)
  unitSystem: 'metric' | 'imperial';
}

export const StatusCard: React.FC<StatusCardProps> = ({
  category,
  weightDelta,
  unitSystem,
}) => {
  // Format delta text & localized notice
  const deltaFormatted =
    unitSystem === 'metric'
      ? `${Math.abs(weightDelta).toFixed(1)} kg`
      : `${(Math.abs(weightDelta) * 2.20462).toFixed(1)} lbs`;

  let deltaNotice = 'Massa tubuh berada dalam rentang keseimbangan klinis optimal.';
  if (weightDelta > 0) {
    deltaNotice = `Telemetri mencatat selisih +${deltaFormatted} di atas batas yang disarankan.`;
  } else if (weightDelta < 0) {
    deltaNotice = `Telemetri mencatat selisih -${deltaFormatted} di bawah batas minimum ideal.`;
  }

  return (
    <div
      className="relative bg-white rounded-[24px] p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] overflow-hidden"
      style={{
        borderLeftWidth: '5px',
        borderLeftColor: category.color,
      }}
    >
      {/* Header with status badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: category.lightBg, color: category.color }}
          >
            {category.type === 'normal' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : category.type === 'obese' ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
              Status Fisiologis
            </span>
            <h3 className="text-[16px] font-bold text-[#0f172a] tracking-tight leading-snug">
              Analisis Kategori: {category.label}
            </h3>
          </div>
        </div>

        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
          style={{ backgroundColor: category.lightBg, color: category.color }}
        >
          Rentang: {category.range} BMI
        </span>
      </div>

      {/* Summary message & Delta telemetry note */}
      <p className="text-[13px] font-medium text-[#334155] mb-2 leading-relaxed">
        {category.summary}
      </p>

      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b] mb-4 bg-[#f8fafc] px-3 py-1.5 rounded-xl border border-[#e2e8f0]/60">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
        <span>{deltaNotice}</span>
      </div>

      {/* Dual athletic & nutrition recommendation grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-[#f1f5f9]">
        {/* Kinetic Athletic Strategy */}
        <div className="bg-[#f8fafc] p-3 rounded-[16px] border border-[#e2e8f0]/70 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#006c49]">
            <Dumbbell className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Rekomendasi Aktivitas Fisik</span>
          </div>
          <p className="text-[12px] font-normal text-[#475569] leading-snug">
            {category.athleticAdvice}
          </p>
        </div>

        {/* Metabolic Fueling */}
        <div className="bg-[#f8fafc] p-3 rounded-[16px] border border-[#e2e8f0]/70 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0f172a]">
            <Utensils className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Rekomendasi Pola Nutrisi</span>
          </div>
          <p className="text-[12px] font-normal text-[#475569] leading-snug">
            {category.nutritionAdvice}
          </p>
        </div>
      </div>
    </div>
  );
};
