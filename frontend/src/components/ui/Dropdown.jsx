import React, { useState, useRef, useEffect } from 'react';

export function Dropdown({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-56 rounded-md bg-white shadow-elevated border border-[#D9D6CF] py-1 focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-[#D9D6CF]" />;
            }
            return (
              <button
                key={index}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`flex w-full items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                  item.danger
                    ? 'text-[#B42318] hover:bg-red-50'
                    : 'text-[#202A35] hover:bg-[#F5F0E5]'
                } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {item.icon && <item.icon className="w-4 h-4 text-[#667085]" />}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] bg-[#B8C0C4]/30 px-1.5 py-0.5 rounded font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

