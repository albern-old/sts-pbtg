import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface BiometricInputProps {
  label: string;
  sublabel?: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  secondaryDisplay?: string; // e.g. "5'9\"" when cm is shown or vice versa
  icon?: React.ReactNode;
  presets?: number[];
}

export const BiometricInput: React.FC<BiometricInputProps> = ({
  label,
  sublabel,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
  secondaryDisplay,
  icon,
  presets,
}) => {
  const [inputValue, setInputValue] = React.useState<string>(value.toString());

  // Keep local input text synchronized when prop value changes
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const commitValue = (valStr: string) => {
    const parsed = parseFloat(valStr);
    if (isNaN(parsed)) {
      setInputValue(value.toString());
      return;
    }
    const clamped = Math.min(max, Math.max(min, Math.round(parsed * 10) / 10));
    setInputValue(clamped.toString());
    onChange(clamped);
  };

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(Math.round(parsed * 10) / 10);
    }
  };

  const handleInputBlur = () => {
    commitValue(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue(inputValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    if (!isNaN(next)) {
      onChange(next);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col gap-3">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#006c49] flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
              {label}
            </span>
            {sublabel && (
              <span className="ml-2 text-[12px] text-[#94a3b8] font-normal">
                {sublabel}
              </span>
            )}
          </div>
        </div>

        {secondaryDisplay && (
          <span className="text-[12px] font-semibold text-[#006c49] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#d3e4fe]">
            {secondaryDisplay}
          </span>
        )}
      </div>

      {/* Input row with 40x40 circular steppers and 56px input pod */}
      <div className="flex items-center gap-2">
        {/* Decrement circular stepper */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-10 h-10 min-w-[40px] rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-[#0f172a] flex items-center justify-center transition-all cursor-pointer border border-[#e2e8f0]"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 56px input pod */}
        <div className="relative flex-1 h-[56px] bg-[#f8fafc] rounded-[16px] border-[1.5px] border-[#e2e8f0] focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all flex items-center px-4">
          <input
            type="number"
            value={inputValue}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            aria-label={`${label} in ${unit}`}
            className="w-full bg-transparent text-[22px] font-extrabold text-[#0f172a] tracking-tight focus:outline-none pr-12 font-sans [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="absolute right-3.5 flex items-center pointer-events-none">
            <span className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider">
              {unit}
            </span>
          </div>
        </div>

        {/* Increment circular stepper */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-10 h-10 min-w-[40px] rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-[#0f172a] flex items-center justify-center transition-all cursor-pointer border border-[#e2e8f0]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Tactile Range Slider */}
      <div className="px-1 pt-1 flex flex-col gap-1.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          aria-label={`${label} slider`}
          className="w-full h-2 rounded-lg cursor-pointer"
        />

        {/* Min/Max indicators & Optional Quick presets */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#94a3b8] px-0.5">
          <span>{min} {unit}</span>
          {presets && presets.length > 0 && (
            <div className="flex items-center gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(preset)}
                  className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    value === preset
                      ? 'bg-[#10b981] text-white font-bold'
                      : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
};
