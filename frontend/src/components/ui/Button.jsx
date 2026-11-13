import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap shrink-0 font-medium transition-all duration-150 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#A4432B] hover:bg-[#8B3824] text-white shadow-sm focus:ring-[#A4432B]',
    secondary: 'bg-[#06244B] hover:bg-[#0B356D] text-white shadow-sm focus:ring-[#06244B]',
    outline: 'border border-[#D9D6CF] bg-white text-[#202A35] hover:bg-[#F5F0E5] hover:border-[#B8C0C4] focus:ring-[#06244B]',
    navyOutline: 'border border-[#06244B] text-[#06244B] bg-transparent hover:bg-[#06244B] hover:text-white focus:ring-[#06244B]',
    ghost: 'text-[#202A35] hover:bg-black/5 focus:ring-gray-400',
    danger: 'bg-[#B42318] hover:bg-[#911C13] text-white focus:ring-red-600',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}

