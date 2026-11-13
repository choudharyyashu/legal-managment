import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#06244B]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-2.5 sm:p-6 text-center">
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all w-full ${maxWidth} border border-[#D9D6CF] my-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#D9D6CF] bg-[#F5F0E5]/50">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#06244B] font-serif leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-1 text-xs text-[#667085] leading-normal">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-[#667085] hover:bg-[#D9D6CF]/40 hover:text-[#06244B] transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[calc(88vh-110px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#F5F0E5]/30 border-t border-[#D9D6CF] flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

