import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // { value: '+12%', isPositive: true }
  onClick,
  active = false,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded bg-white p-5 border transition-all duration-150 ${
        active
          ? 'border-[#A4432B] shadow-elevated ring-1 ring-[#A4432B]'
          : 'border-[#D9D6CF] shadow-subtle hover:border-[#B8C0C4] hover:shadow-card'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] leading-snug">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#06244B]">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="p-2.5 rounded bg-[#F5F0E5] text-[#06244B] shrink-0">
            <Icon className="w-5 h-5 text-[#A4432B]" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {trend && (
            <span
              className={`font-semibold whitespace-nowrap shrink-0 ${
                trend.isPositive ? 'text-[#287A55]' : 'text-[#B42318]'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-[#667085]">{subtitle}</span>}
        </div>
      )}

      {/* Subtle bottom brand accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A4432B]/0 hover:bg-[#A4432B] transition-colors" />
    </div>
  );
}

