import React from 'react';
import { Breadcrumbs } from '../layout/Breadcrumbs';

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = '',
}) {
  return (
    <div className={`mb-6 pb-4 border-b border-[#D9D6CF]/60 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 w-full">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#06244B] tracking-tight break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-[#667085] max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 max-w-full shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

