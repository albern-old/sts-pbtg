import React from 'react';
import { motion } from 'motion/react';
import { BMICategoryInfo } from '../types';

interface BmiGaugeProps {
  bmi: number;
  category: BMICategoryInfo;
}

export const BmiGauge: React.FC<BmiGaugeProps> = ({ bmi, category }) => {
  // SVG circular progress halo geometry
  const radius = 68;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Normalizing BMI for circular ring: 14 BMI = 0%, 38 BMI = 100%
  const minBmi = 14;
  const maxBmi = 40;
  const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
  const progressRatio = (clampedBmi - minBmi) / (maxBmi - minBmi);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Piecewise linear interpolation to map BMI directly to the 4 visual segments:
  // Segment 1 (0% - 25%): BMI 14 - 18.5 (Kurus)
  // Segment 2 (25% - 50%): BMI 18.5 - 25.0 (Normal)
  // Segment 3 (50% - 75%): BMI 25.0 - 30.0 (Gemuk)
  // Segment 4 (75% - 100%): BMI 30.0 - 40.0 (Obesitas)
  const calculateHorizontalPercent = (val: number) => {
    if (val <= 14) return 0;
    if (val < 18.5) {
      return ((val - 14) / (18.5 - 14)) * 25;
    }
    if (val < 25.0) {
      return 25 + ((val - 18.5) / (25.0 - 18.5)) * 25;
    }
    if (val < 30.0) {
      return 50 + ((val - 25.0) / (30.0 - 25.0)) * 25;
    }
    if (val < 40.0) {
      return 75 + ((val - 30.0) / (40.0 - 30.0)) * 25;
    }
    return 100;
  };

  const horizontalPercent = Math.max(3, Math.min(97, calculateHorizontalPercent(bmi)));

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col items-center">
      {/* Header telemetry subtitle */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></span>
          <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
            Biometric Telemetry Index
          </span>
        </div>
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-colors"
          style={{
            backgroundColor: category.lightBg,
            color: category.color,
          }}
        >
          {category.badge}
        </span>
      </div>

      {/* Circular Progress Halo & Score display */}
      <div className="relative flex items-center justify-center my-4">
        <svg
          className="transform -rotate-90"
          width="170"
          height="170"
          viewBox="0 0 170 170"
        >
          <defs>
            {/* Linear gradient from Emerald to Electric Lime */}
            <linearGradient id="kineticHaloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#84CC16" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="haloGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={category.color} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Track (10px, #E2E8F0) */}
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />

          {/* Foreground dynamic progress stroke with rounded caps */}
          <motion.circle
            cx="85"
            cy="85"
            r={radius}
            fill="transparent"
            stroke={category.type === 'normal' ? 'url(#kineticHaloGradient)' : category.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            filter="url(#haloGlow)"
          />
        </svg>

        {/* Center telemetry text container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] leading-none mb-1">
            BODY MASS
          </span>
          <motion.span
            key={bmi}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="text-[38px] font-extrabold tracking-[-0.04em] text-[#0f172a] leading-none"
          >
            {bmi.toFixed(1)}
          </motion.span>
          <span
            className="mt-1 text-[13px] font-bold tracking-tight px-2 py-0.5 rounded-full"
            style={{ color: category.color }}
          >
            {category.label}
          </span>
        </div>
      </div>

      {/* Continuous Segmented Horizontal Bar Gauge with Hovering Pin */}
      <div className="w-full mt-2 pt-3 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between mb-3 text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
          <span>Spektrum BMI: berat ÷ [tinggi (m)]²</span>
          <span>Ideal: 18.5 – 24.9</span>
        </div>

        {/* Bar & Pin Container */}
        <div className="relative pt-6 pb-2">
          {/* Animated Pin Pill (#0F172A background, white label) */}
          <motion.div
            className="absolute top-0 transform -translate-x-1/2 z-20"
            style={{ left: `${horizontalPercent}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-[#0f172a] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1 border border-slate-700">
                <span>{bmi.toFixed(1)}</span>
                <span className="text-[9px] text-[#10b981]">BMI</span>
              </div>
              {/* Little indicator arrow pointer */}
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#0f172a]" />
            </div>
          </motion.div>

          {/* 4 Segmented color track (25% each for equal visual calibration) */}
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {/* Kurus: < 18.5 */}
            <div
              className="h-full transition-opacity"
              style={{
                width: '25%',
                backgroundColor: '#3B82F6',
                opacity: category.type === 'underweight' ? 1 : 0.65,
              }}
              title="Kurus (< 18.5)"
            />
            {/* Normal: 18.5 - 24.9 */}
            <div
              className="h-full transition-opacity"
              style={{
                width: '25%',
                backgroundColor: '#10B981',
                opacity: category.type === 'normal' ? 1 : 0.65,
              }}
              title="Normal (18.5 - 24.9)"
            />
            {/* Gemuk: 25.0 - 29.9 */}
            <div
              className="h-full transition-opacity"
              style={{
                width: '25%',
                backgroundColor: '#F59E0B',
                opacity: category.type === 'overweight' ? 1 : 0.65,
              }}
              title="Gemuk (25.0 - 29.9)"
            />
            {/* Obesitas: >= 30 */}
            <div
              className="h-full transition-opacity"
              style={{
                width: '25%',
                backgroundColor: '#EF4444',
                opacity: category.type === 'obese' ? 1 : 0.65,
              }}
              title="Obesitas (>= 30.0)"
            />
          </div>

          {/* Segment ticks exactly aligned at 25%, 50%, 75% boundaries */}
          <div className="relative w-full h-4 mt-1.5 text-[10px] font-bold">
            <span className="absolute left-[25%] -translate-x-1/2 text-[#3B82F6]">18.5</span>
            <span className="absolute left-[50%] -translate-x-1/2 text-[#10B981]">25.0</span>
            <span className="absolute left-[75%] -translate-x-1/2 text-[#F59E0B]">30.0</span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center mt-0.5 text-[10px] font-extrabold uppercase tracking-wider">
            <span className={category.type === 'underweight' ? 'text-[#3B82F6]' : 'text-slate-400'}>Kurus</span>
            <span className={category.type === 'normal' ? 'text-[#10B981]' : 'text-slate-400'}>Normal</span>
            <span className={category.type === 'overweight' ? 'text-[#F59E0B]' : 'text-slate-400'}>Gemuk</span>
            <span className={category.type === 'obese' ? 'text-[#EF4444]' : 'text-slate-400'}>Obesitas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
