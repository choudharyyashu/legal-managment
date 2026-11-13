import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded border border-dashed border-[#D9D6CF] ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[#F5F0E5] flex items-center justify-center text-[#A4432B] mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-lg font-serif font-bold text-[#06244B]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[#667085] max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

