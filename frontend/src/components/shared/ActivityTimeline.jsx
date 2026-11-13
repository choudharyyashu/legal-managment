import React from 'react';
import { Clock, FileText, CheckCircle, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export function ActivityTimeline({ activities = [], className = '' }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[#667085]">
        No chronological activity recorded yet.
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'task':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'communication':
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'note':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
      case 'alert':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#06244B]" />;
    }
  };

  return (
    <div className={`relative pl-4 space-y-4 border-l-2 border-[#D9D6CF] ${className}`}>
      {activities.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Timeline node */}
          <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#A4432B] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A4432B]" />
          </div>

          <div className="bg-white p-3 rounded border border-[#D9D6CF] shadow-subtle group-hover:border-[#B8C0C4] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#06244B] flex items-center gap-1.5">
                {getIcon(item.type)}
                {item.title}
              </span>
              <span className="text-[11px] text-[#667085]">
                {formatDate(item.timestamp || item.date, { short: true, includeTime: true })}
              </span>
            </div>
            {item.description && (
              <p className="mt-1 text-xs text-[#202A35] leading-relaxed">
                {item.description}
              </p>
            )}
            {item.author && (
              <p className="mt-1.5 text-[10px] text-[#667085] font-medium">
                By: <span className="text-[#06244B]">{item.author}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

