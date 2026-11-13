import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search records...',
  className = '',
}) {
  return (
    <div className={className}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-9 pr-8 py-2 text-sm bg-white border border-[#D9D6CF] rounded text-[#202A35] placeholder-[#667085]/60 focus:outline-none focus:border-[#06244B] focus:ring-1 focus:ring-[#06244B]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#667085] hover:text-[#06244B]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

