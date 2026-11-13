import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center text-xs text-[#667085] ${className}`} aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-[#06244B] transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-[#B8C0C4]" />
            {isLast || !item.to ? (
              <span className="font-semibold text-[#06244B] truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-[#06244B] transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

