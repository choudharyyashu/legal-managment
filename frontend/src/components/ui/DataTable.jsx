import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTable({
  columns,
  data = [],
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No records found matching your criteria.',
  className = '',
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const safeData = useMemo(() => (Array.isArray(data) ? data.filter(Boolean) : []), [data]);

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!safeData || safeData.length === 0) return [];
    if (!sortField) return safeData;
    return [...safeData].sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className={`w-full overflow-hidden rounded border border-[#D9D6CF] bg-white shadow-subtle ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D9D6CF] text-left text-sm">
          <thead className="bg-[#F5F0E5]/80 text-[#06244B]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  onClick={() => col.sortable && handleSort(col.sortField || col.key)}
                  className={`px-2.5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-[#D9D6CF]/40' : ''
                  } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-[#667085]">
                        {sortField === (col.sortField || col.key) ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#A4432B]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#A4432B]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D6CF]/60 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[#667085]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-100 ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F5F0E5]/40' : ''
                  } ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F0]/30'}`}
                >
                  {columns.map((col, colIdx) => {
                    const safeRow = row || {};
                    const cellValue = col.key ? safeRow[col.key] : undefined;

                    let renderedContent = null;
                    if (typeof col.render === 'function') {
                      try {
                        const firstArg = cellValue !== undefined ? cellValue : null;
                        renderedContent = col.render(firstArg, safeRow);
                      } catch (err) {
                        console.warn(`DataTable error rendering column "${col.key || col.label}":`, err);
                        renderedContent = <span className="text-xs text-[#667085] italic">Not Available</span>;
                      }
                    } else {
                      renderedContent = cellValue !== undefined && cellValue !== null && cellValue !== '' ? String(cellValue) : '—';
                    }

                    return (
                      <td
                        key={col.key || colIdx}
                        className={`px-2.5 py-3 text-[#202A35] ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {renderedContent ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#D9D6CF] bg-[#F5F0E5]/40 px-4 py-3 text-xs text-[#667085] gap-2">
          <div className="text-center sm:text-left">
            Showing <span className="font-semibold text-[#06244B]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#06244B]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-[#06244B]">{sortedData.length}</span> results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-[#D9D6CF] bg-white text-[#202A35] hover:bg-[#F5F0E5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-[#06244B]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-[#D9D6CF] bg-white text-[#202A35] hover:bg-[#F5F0E5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

