import React from 'react';
import { X, Trash2, Calendar, TrendingUp, TrendingDown, Minus, Check, Share2 } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: TelemetrySnapshot[];
  onClearHistory: () => void;
  onDeleteSnapshot: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  snapshots,
  onClearHistory,
  onDeleteSnapshot,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleShareSummary = () => {
    if (snapshots.length === 0) return;
    const latest = snapshots[0];
    const text = `Kinetic Pulse Telemetry Snapshot:
Date: ${latest.dateFormatted}
BMI: ${latest.bmi.toFixed(1)} (${latest.categoryLabel})
Weight: ${latest.weight} kg | Height: ${latest.height} cm
TDEE: ${latest.tdee} kcal/day | Est. Body Fat: ${latest.bodyFat}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-[28px] p-6 shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[88vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0f172a] tracking-tight">
              Telemetry Snapshots Log
            </h2>
            <p className="text-[12px] font-medium text-[#64748b]">
              {snapshots.length} historical record{snapshots.length === 1 ? '' : 's'} logged
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 flex flex-col gap-3 pr-1">
          {snapshots.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#64748b] gap-2">
              <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8]">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-[14px] font-bold text-[#0f172a]">No Snapshots Yet</p>
              <p className="text-[12px] max-w-xs">
                Tap the &quot;Log Telemetry Snapshot&quot; button on the main dashboard to record your biometric readings over time.
              </p>
            </div>
          ) : (
            snapshots.map((item, index) => {
              const prevItem = snapshots[index + 1];
              const diff = prevItem ? Math.round((item.bmi - prevItem.bmi) * 10) / 10 : null;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-[20px] bg-[#f8fafc] border border-[#e2e8f0]/80 flex flex-col gap-2.5 hover:border-[#cbd5e1] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#64748b] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.dateFormatted}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeleteSnapshot(item.id)}
                      aria-label="Delete entry"
                      className="text-[#94a3b8] hover:text-[#ef4444] transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[22px] font-extrabold tracking-[-0.04em] text-[#0f172a]"
                      >
                        {item.bmi.toFixed(1)}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          backgroundColor: `${item.categoryColor}15`,
                          color: item.categoryColor,
                        }}
                      >
                        {item.categoryLabel}
                      </span>
                    </div>

                    {diff !== null && (
                      <span
                        className={`text-[11px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                          diff > 0
                            ? 'text-[#f59e0b] bg-[#fffbeb]'
                            : diff < 0
                            ? 'text-[#10b981] bg-[#ecfdf5]'
                            : 'text-[#64748b] bg-[#f1f5f9]'
                        }`}
                      >
                        {diff > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : diff < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {diff > 0 ? `+${diff}` : diff} BMI
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b] pt-1.5 border-t border-[#f1f5f9]">
                    <span>
                      Mass: <strong className="text-[#0f172a]">{item.weight} kg</strong>
                    </span>
                    <span>
                      Height: <strong className="text-[#0f172a]">{item.height} cm</strong>
                    </span>
                    <span>
                      TDEE: <strong className="text-[#0f172a]">{item.tdee} kcal</strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#f1f5f9] flex items-center gap-2">
          {snapshots.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleShareSummary}
                className="h-[44px] px-4 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Summary'}
              </button>

              <button
                type="button"
                onClick={onClearHistory}
                className="h-[44px] px-4 rounded-full bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[44px] rounded-full bg-[#0f172a] text-white font-bold text-[13px] hover:bg-[#1e293b] transition-colors cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
