import React from 'react';
import { X, Heart, Zap, Award } from 'lucide-react';
import { HeartRateZone } from '../types';

interface HeartRateZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  age: number;
  maxHeartRate: number;
  zones: HeartRateZone[];
}

export const HeartRateZonesModal: React.FC<HeartRateZonesModalProps> = ({
  isOpen,
  onClose,
  age,
  maxHeartRate,
  zones,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-[28px] p-6 shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#006c49] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold text-[#0f172a] tracking-tight">
                Cardiovascular Telemetry Zones
              </h2>
              <p className="text-[12px] font-medium text-[#64748b]">
                Age {age} • Max Calculated HR: <span className="text-[#0f172a] font-bold">{maxHeartRate} BPM</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Zones List */}
        <div className="overflow-y-auto py-4 flex flex-col gap-3 pr-1">
          {zones.map((zone) => (
            <div
              key={zone.zone}
              className="p-4 rounded-[18px] bg-[#f8fafc] border border-[#e2e8f0]/80 flex flex-col gap-2 hover:border-[#cbd5e1] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: zone.color }}
                  >
                    Z{zone.zone}
                  </span>
                  <span className="text-[14px] font-bold text-[#0f172a]">
                    {zone.name}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[13px] font-extrabold text-[#0f172a]">
                    {zone.bpmRange}
                  </span>
                  <span className="block text-[10px] font-bold text-[#64748b]">
                    {zone.rangePercentage}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9] text-[11px]">
                <span
                  className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[9px]"
                  style={{
                    backgroundColor: `${zone.color}15`,
                    color: zone.color,
                  }}
                >
                  {zone.intensity}
                </span>
                <p className="text-[12px] text-[#475569] leading-snug pl-2 text-right">
                  {zone.description}
                </p>
              </div>
            </div>
          ))}

          {/* Athletic Training Note */}
          <div className="p-3.5 rounded-[18px] bg-[#eff4ff] border border-[#d3e4fe] flex items-start gap-2.5 mt-1">
            <Zap className="w-4 h-4 text-[#006c49] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#00422b] leading-relaxed">
              <span className="font-bold">Zone 2 Fat Oxidation:</span> Spending 60-80% of weekly cardio volume in Zone 2 accelerates mitochondrial biogenesis and resting metabolic fat burning efficiency.
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-3 border-t border-[#f1f5f9]">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[48px] rounded-full bg-[#0f172a] text-white font-bold text-[14px] hover:bg-[#1e293b] active:scale-[0.99] transition-all cursor-pointer shadow-md"
          >
            Close Telemetry Spectrum
          </button>
        </div>
      </div>
    </div>
  );
};
