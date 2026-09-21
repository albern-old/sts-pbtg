import React from 'react';
import { Activity, History, Smartphone, Zap } from 'lucide-react';
import { UnitSystem } from '../types';

interface HeaderProps {
  unitSystem: UnitSystem;
  onToggleUnit: (unit: UnitSystem) => void;
  onOpenHistory: () => void;
  onOpenExpoCode: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  onToggleUnit,
  onOpenHistory,
  onOpenExpoCode,
  historyCount,
}) => {
  return (
    <header className="w-full flex items-center justify-between pb-3 pt-2">
      {/* Brand & Telemetry Live Sync */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#0b1c30] text-white shadow-md shadow-slate-900/10">
          <Activity className="w-5 h-5 text-[#10b981]" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981] border-2 border-white"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[19px] font-extrabold tracking-[-0.03em] text-[#0b1c30]">
              Kinetic Pulse
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase bg-[#eff4ff] text-[#006c49] border border-[#d3e4fe]">
              <Zap className="w-2.5 h-2.5 fill-current" />
              Live Telemetry
            </span>
          </div>
          <p className="text-[12px] font-medium text-[#64748b] tracking-tight">
            High-Performance Biometric Engine
          </p>
        </div>
      </div>

      {/* Right Controls: Unit Toggle, Expo Code & History button */}
      <div className="flex items-center gap-2">
        {/* Expo Code Button */}
        <button
          type="button"
          onClick={onOpenExpoCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0b1c30] hover:bg-[#1e293b] text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
          title="Lihat Kode Expo React Native"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#10b981]" />
          <span className="hidden xs:inline sm:inline">Expo Code</span>
        </button>

        {/* Metric / Imperial Segmented Pill */}
        <div className="flex items-center p-1 rounded-full bg-[#e5eeff]/80 border border-[#dce9ff] text-[12px] font-semibold">
          <button
            type="button"
            onClick={() => onToggleUnit('metric')}
            className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
              unitSystem === 'metric'
                ? 'bg-white text-[#0b1c30] shadow-sm font-bold'
                : 'text-[#64748b] hover:text-[#0b1c30]'
            }`}
          >
            Metric
          </button>
          <button
            type="button"
            onClick={() => onToggleUnit('imperial')}
            className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
              unitSystem === 'imperial'
                ? 'bg-white text-[#0b1c30] shadow-sm font-bold'
                : 'text-[#64748b] hover:text-[#0b1c30]'
            }`}
          >
            Imperial
          </button>
        </div>

        {/* Snapshot History Trigger */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="View Telemetry History"
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-[#f8f9ff] hover:border-[#cbd5e1] transition-all cursor-pointer shadow-sm"
        >
          <History className="w-4 h-4 text-[#0b1c30]" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10b981] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
