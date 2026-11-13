import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  required = false,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold tracking-wide text-[#202A35] uppercase">
          {label} {required && <span className="text-[#A4432B]">*</span>}
        </label>
      )}
      <div className="relative rounded">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded border text-sm transition-colors duration-150 py-2 px-3 bg-white text-[#202A35] placeholder-[#667085]/60 focus:outline-none focus:ring-1 ${
            Icon ? 'pl-9' : 'pl-3'
          } ${
            error
              ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]'
              : 'border-[#D9D6CF] focus:border-[#06244B] focus:ring-[#06244B]'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#B42318] mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#667085] mt-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

