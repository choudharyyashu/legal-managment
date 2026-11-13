import React from 'react';

export function Badge({
  children,
  variant = 'default', // 'default', 'success', 'warning', 'danger', 'info', 'terracotta'
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-[#B8C0C4]/25 text-[#202A35] border-[#B8C0C4]/40',
    navy: 'bg-[#06244B]/10 text-[#06244B] border-[#06244B]/20',
    terracotta: 'bg-[#A4432B]/10 text-[#A4432B] border-[#A4432B]/30 font-semibold',
    success: 'bg-[#287A55]/15 text-[#1b553b] border-[#287A55]/30',
    warning: 'bg-[#A66A16]/15 text-[#7c4f10] border-[#A66A16]/30',
    danger: 'bg-[#B42318]/15 text-[#8f1c13] border-[#B42318]/30',
    info: 'bg-[#315F8C]/15 text-[#234464] border-[#315F8C]/30',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-medium rounded border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}

