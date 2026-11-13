import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-[#D9D6CF] w-full overflow-hidden ${className}`}>
      <nav
        className="-mb-px flex space-x-1 sm:space-x-4 overflow-x-auto scroll-smooth overscroll-x-contain py-0.5 no-scrollbar"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap py-2.5 sm:py-3 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer flex-shrink-0 min-h-[42px] ${
                isActive
                  ? 'border-[#A4432B] text-[#06244B] font-semibold'
                  : 'border-transparent text-[#667085] hover:text-[#06244B] hover:border-[#B8C0C4]'
              }`}
            >
              {tab.icon && (
                <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isActive ? 'text-[#A4432B]' : 'text-[#667085]'}`} />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs ${
                    isActive
                      ? 'bg-[#A4432B]/10 text-[#A4432B] font-bold'
                      : 'bg-[#D9D6CF]/60 text-[#202A35]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
