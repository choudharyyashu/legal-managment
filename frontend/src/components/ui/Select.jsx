import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  id,
  placeholder = 'Select an option...',
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold tracking-wide text-[#202A35] uppercase">
          {label} {required && <span className="text-[#A4432B]">*</span>}
        </label>
      )}
      <div className="relative rounded">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`block w-full rounded border text-sm transition-colors duration-150 py-2 px-3 bg-white text-[#202A35] focus:outline-none focus:ring-1 cursor-pointer appearance-none ${
            error
              ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]'
              : 'border-[#D9D6CF] focus:border-[#06244B] focus:ring-[#06244B]'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children || options.map((opt) => (
            <option key={opt.value ?? opt.id ?? opt} value={opt.value ?? opt.id ?? opt}>
              {opt.label ?? opt.name ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#667085]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-[#B42318] mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#667085] mt-1">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

