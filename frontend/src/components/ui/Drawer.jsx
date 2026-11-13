import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl',
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#06244B]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-2 sm:pl-10">
        <div className={`w-screen ${width} max-w-[90vw] sm:max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#D9D6CF]`}>
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#D9D6CF] bg-[#F5F0E5]/60 flex items-start justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#06244B]">{title}</h3>
              {subtitle && <p className="text-xs text-[#667085] mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#667085] hover:text-[#06244B] hover:bg-[#D9D6CF]/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#F5F0E5]/40 border-t border-[#D9D6CF] flex flex-wrap items-center justify-end gap-2.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

