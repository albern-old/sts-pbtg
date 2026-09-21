import React from 'react';
import {
  Flame,
  Heart,
  Droplets,
  Scale,
  Activity,
  Percent,
  ChevronRight,
} from 'lucide-react';
import { TelemetryMetrics, UnitSystem } from '../types';

interface TelemetryGridProps {
  metrics: TelemetryMetrics;
  unitSystem: UnitSystem;
  onOpenHeartZones: () => void;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  metrics,
  unitSystem,
  onOpenHeartZones,
}) => {
  // Format ideal weight based on unit
  const idealMinFormatted =
    unitSystem === 'metric'
      ? `${metrics.idealWeightMin} kg`
      : `${(metrics.idealWeightMin * 2.20462).toFixed(1)} lbs`;

  const idealMaxFormatted =
    unitSystem === 'metric'
      ? `${metrics.idealWeightMax} kg`
      : `${(metrics.idealWeightMax * 2.20462).toFixed(1)} lbs`;

  // Hydration in Liters or Fluid Oz
  const waterFormatted =
    unitSystem === 'metric'
      ? `${metrics.waterIntakeLiters.toFixed(1)} L`
      : `${(metrics.waterIntakeLiters * 33.814).toFixed(0)} fl oz`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
          Biometric Performance Matrix
        </span>
        <span className="text-[11px] font-semibold text-[#10b981]">
          Real-time Derived
        </span>
      </div>

      {/* 2-column grid with 12px (gutter) gap */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Ideal Mass Equilibrium */}
        <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[36px] h-[36px] rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded-full border border-[#d3e4fe]">
              Target
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block mb-1">
              Ideal Equilibrium
            </span>
            <div className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.03em] text-[#0f172a] leading-tight">
              {idealMinFormatted}
            </div>
            <div className="text-[12px] font-medium text-[#64748b] mt-0.5">
              to {idealMaxFormatted}
            </div>
          </div>
        </div>

        {/* Metric 2: Active Energy Burn (TDEE) */}
        <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[36px] h-[36px] rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#f59e0b] bg-[#fffbeb] px-2 py-0.5 rounded-full border border-[#fef3c7]">
              TDEE
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block mb-1">
              Daily Calorie Burn
            </span>
            <div className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.04em] text-[#0f172a] leading-tight">
              {metrics.tdee.toLocaleString()}
            </div>
            <div className="text-[12px] font-semibold text-[#10b981] mt-0.5">
              kcal / day
            </div>
          </div>
        </div>

        {/* Metric 3: Basal Metabolic Rate (BMR) */}
        <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[36px] h-[36px] rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded-full border border-[#e2e8f0]">
              Base
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block mb-1">
              Basal Metabolic (BMR)
            </span>
            <div className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.04em] text-[#0f172a] leading-tight">
              {metrics.bmr.toLocaleString()}
            </div>
            <div className="text-[12px] font-medium text-[#64748b] mt-0.5">
              kcal idle maintenance
            </div>
          </div>
        </div>

        {/* Metric 4: Estimated Body Fat % */}
        <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[36px] h-[36px] rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded-full border border-[#d3e4fe]">
              Est. BF
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block mb-1">
              Body Fat Est.
            </span>
            <div className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.04em] text-[#0f172a] leading-tight">
              {metrics.bodyFatPercentage.toFixed(1)}%
            </div>
            <div className="text-[12px] font-medium text-[#64748b] mt-0.5">
              Deurenberg index
            </div>
          </div>
        </div>

        {/* Metric 5: Daily Hydration Requirement */}
        <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[36px] h-[36px] rounded-xl bg-[#eff4ff] text-[#3b82f6] flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#3b82f6] bg-[#eff4ff] px-2 py-0.5 rounded-full border border-[#dbeafe]">
              H2O
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block mb-1">
              Hydration Need
            </span>
            <div className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.04em] text-[#0f172a] leading-tight">
              {waterFormatted}
            </div>
            <div className="text-[12px] font-medium text-[#64748b] mt-0.5">
              fluid intake / day
            </div>
          </div>
        </div>

        {/* Metric 6: Heart Rate & Cardio Zones Trigger */}
        <button
          type="button"
          onClick={onOpenHeartZones}
          className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:border-[#10b981] hover:shadow-[0_4px_20px_rgba(16,185,129,0.12)] transition-all cursor-pointer flex flex-col justify-between text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="w-[36px] h-[36px] rounded-xl bg-[#fff1f2] text-[#e11d48] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-[#d3e4fe]">
              Zones
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block mb-1">
              Max Heart Rate
            </span>
            <div className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.04em] text-[#0f172a] leading-tight">
              {metrics.maxHeartRate}{' '}
              <span className="text-[13px] font-normal text-[#64748b]">bpm</span>
            </div>
            <div className="text-[12px] font-semibold text-[#10b981] mt-0.5 flex items-center gap-1">
              View 5 Training Zones
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
