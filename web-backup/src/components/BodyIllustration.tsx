import React from 'react';
import { BMICategoryInfo, BMICategoryType, Gender, UnitSystem } from '../types';
import { Sparkles, CheckCircle2, AlertCircle, ArrowDown, ArrowUp, Info } from 'lucide-react';

interface BodyIllustrationProps {
  gender: Gender;
  category: BMICategoryInfo;
  bmi: number;
  weightKg: number;
  idealWeightMin: number;
  idealWeightMax: number;
  weightDeltaToNormal: number;
  unitSystem?: UnitSystem;
}

export const BodyIllustration: React.FC<BodyIllustrationProps> = ({
  gender,
  category,
  bmi,
  weightKg,
  idealWeightMin,
  idealWeightMax,
  weightDeltaToNormal,
  unitSystem = 'metric',
}) => {
  // SVG body silhouette styling based on category
  const getSilhouetteScale = () => {
    switch (category.type) {
      case 'underweight':
        return { torsoScaleX: 0.82, hipScaleX: 0.85, limbWidth: 5, accentColor: '#3B82F6' };
      case 'normal':
        return { torsoScaleX: 1.0, hipScaleX: 1.0, limbWidth: 7, accentColor: '#10B981' };
      case 'overweight':
        return { torsoScaleX: 1.18, hipScaleX: 1.15, limbWidth: 8.5, accentColor: '#F59E0B' };
      case 'obese':
        return { torsoScaleX: 1.35, hipScaleX: 1.3, limbWidth: 10, accentColor: '#EF4444' };
    }
  };

  const silhouette = getSilhouetteScale();

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Decorative subtle background tint */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none opacity-25"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
        {/* Supporting Graphic: Dynamic Body Silhouette SVG */}
        <div className="relative w-36 h-48 flex items-center justify-center bg-slate-50/80 rounded-2xl border border-slate-100 p-2 shrink-0">
          <svg
            viewBox="0 0 100 160"
            className="w-full h-full transition-all duration-500"
            style={{ filter: `drop-shadow(0 4px 10px ${category.color}30)` }}
          >
            {/* Head */}
            <circle
              cx="50"
              cy="24"
              r="12"
              fill={category.color}
              className="transition-all duration-300"
            />
            {/* Neck */}
            <line x1="50" y1="36" x2="50" y2="44" stroke={category.color} strokeWidth="6" strokeLinecap="round" />

            {/* Torso / Chest with morphing width */}
            <path
              d={
                gender === 'male'
                  ? `M ${50 - 18 * silhouette.torsoScaleX} 44 
                     L ${50 + 18 * silhouette.torsoScaleX} 44 
                     L ${50 + 14 * silhouette.hipScaleX} 90 
                     L ${50 - 14 * silhouette.hipScaleX} 90 Z`
                  : `M ${50 - 15 * silhouette.torsoScaleX} 44 
                     L ${50 + 15 * silhouette.torsoScaleX} 44 
                     L ${50 + 18 * silhouette.hipScaleX} 92 
                     L ${50 - 18 * silhouette.hipScaleX} 92 Z`
              }
              fill={category.color}
              className="transition-all duration-500"
              rx="4"
            />

            {/* Arms */}
            <line
              x1={50 - 18 * silhouette.torsoScaleX}
              y1="46"
              x2={50 - 24 * silhouette.torsoScaleX}
              y2="88"
              stroke={category.color}
              strokeWidth={silhouette.limbWidth}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <line
              x1={50 + 18 * silhouette.torsoScaleX}
              y1="46"
              x2={50 + 24 * silhouette.torsoScaleX}
              y2="88"
              stroke={category.color}
              strokeWidth={silhouette.limbWidth}
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Legs */}
            <line
              x1={50 - 8 * silhouette.hipScaleX}
              y1="90"
              x2={50 - 10 * silhouette.hipScaleX}
              y2="146"
              stroke={category.color}
              strokeWidth={silhouette.limbWidth}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <line
              x1={50 + 8 * silhouette.hipScaleX}
              y1="90"
              x2={50 + 10 * silhouette.hipScaleX}
              y2="146"
              stroke={category.color}
              strokeWidth={silhouette.limbWidth}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Gender & Category Sub-label */}
          <div className="absolute bottom-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
            {gender === 'male' ? 'Pria' : 'Wanita'} • {category.label}
          </div>
        </div>

        {/* Ideal Weight Recommendation & Telemetry Guidance */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
              Rekomendasi Berat Badan Ideal
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: category.lightBg, color: category.color }}
            >
              Kategori: {category.label}
            </span>
          </div>

          {/* Target Weight Range Display */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-slate-600 font-medium">Rentang Normal (BMI 18.5 – 24.9):</span>
              <span className="text-[16px] font-black text-slate-900">
                {unitSystem === 'metric'
                  ? `${idealWeightMin} – ${idealWeightMax}`
                  : `${(idealWeightMin * 2.20462).toFixed(1)} – ${(idealWeightMax * 2.20462).toFixed(1)}`}{' '}
                <span className="text-[12px] font-bold text-slate-500">{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
              </span>
            </div>

            {/* Recommendation Delta Status */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[12px]">
              {weightDeltaToNormal > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <ArrowDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Rekomendasi: turunkan{' '}
                    <strong className="font-extrabold text-amber-900">
                      {unitSystem === 'metric'
                        ? `${weightDeltaToNormal} kg`
                        : `${(weightDeltaToNormal * 2.20462).toFixed(1)} lbs`}
                    </strong>{' '}
                    untuk mencapai batas normal.
                  </span>
                </div>
              ) : weightDeltaToNormal < 0 ? (
                <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                  <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Rekomendasi: naikkan{' '}
                    <strong className="font-extrabold text-blue-900">
                      {unitSystem === 'metric'
                        ? `${Math.abs(weightDeltaToNormal)} kg`
                        : `${(Math.abs(weightDeltaToNormal) * 2.20462).toFixed(1)} lbs`}
                    </strong>{' '}
                    untuk mencapai batas normal.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Luar biasa! Berat badan Anda sudah berada dalam rentang ideal yang sehat.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical summary tip */}
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            {category.summary} {category.nutritionAdvice}
          </p>
        </div>
      </div>
    </div>
  );
};
