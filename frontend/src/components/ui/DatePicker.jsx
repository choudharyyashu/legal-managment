import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export function DatePicker({
  label,
  value,
  onChange,
  error,
  required = false,
  className = '',
  min,
  max,
  id,
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold tracking-wide text-[#202A35] uppercase">
          {label} {required && <span className="text-[#A4432B]">*</span>}
        </label>
      )}
      <div className="relative rounded">
        <input
          id={inputId}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required={required}
          className={`block w-full rounded border text-sm py-2 px-3 bg-white text-[#202A35] focus:outline-none focus:ring-1 ${
            error
              ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]'
              : 'border-[#D9D6CF] focus:border-[#06244B] focus:ring-[#06244B]'
          } ${className}`}
        />
      </div>
      {error && <p className="text-xs text-[#B42318] mt-1">{error}</p>}
    </div>
  );
}

