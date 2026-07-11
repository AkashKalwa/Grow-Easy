'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PreviewTableProps {
  headers: string[];
  rows: string[][];
  maxHeight?: number;
}

export default function PreviewTable({ headers, rows, maxHeight = 400 }: PreviewTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(maxHeight);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight || maxHeight);
    }
  }, [maxHeight]);

  const totalRows = rows.length;
  const rowHeight = 44; 
  const buffer = 15; 

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + buffer);

  const visibleRows = rows.slice(startIndex, endIndex);

  const topSpacerHeight = startIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, (totalRows - endIndex) * rowHeight);

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#1f1f23] transition-colors duration-200 no-outline-card">
      {/* Table Header Info */}
      <div className="px-5 py-4 bg-slate-50/50 dark:bg-[#28282f]/40 flex justify-between items-center select-none">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Detected Fields ({headers.length})
        </span>
        <span className="text-[10px] font-extrabold px-3 py-1 bg-[#ef5a3f]/10 dark:bg-[#ef5a3f]/15 text-[#ef5a3f] rounded-lg">
          {totalRows.toLocaleString()} Rows
        </span>
      </div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        onScroll={onScroll}
        className="overflow-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <table className="w-full border-collapse text-left text-xs table-auto">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#25252b] text-slate-700 dark:text-slate-200 select-none">
            <tr>
              <th className="px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 text-center w-12 bg-slate-100 dark:bg-[#25252b]">
                #
              </th>
              {headers.map((header, idx) => (
                <th 
                  key={idx} 
                  className="px-5 py-3.5 font-bold text-slate-600 dark:text-slate-300 min-w-[160px]"
                >
                  {header || `Column ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/10">
            {/* Top virtual spacer */}
            {topSpacerHeight > 0 && (
              <tr>
                <td style={{ height: `${topSpacerHeight}px` }} colSpan={headers.length + 1} className="p-0 border-0" />
              </tr>
            )}

            {/* Visible rows */}
            {visibleRows.map((row, relativeIdx) => {
              const absoluteIdx = startIndex + relativeIdx;
              return (
                <tr 
                  key={absoluteIdx} 
                  className="hover:bg-slate-50/40 dark:hover:bg-[#28282f]/30 transition-colors duration-100"
                  style={{ height: `${rowHeight}px` }}
                >
                  <td className="px-5 py-2 text-center text-slate-400 dark:text-slate-600 font-mono text-[10px] select-none">
                    {absoluteIdx + 1}
                  </td>
                  {headers.map((_, colIdx) => (
                    <td 
                      key={colIdx} 
                      className="px-5 py-2 text-slate-700 dark:text-slate-300 max-w-[260px] truncate"
                      title={row[colIdx] || ''}
                    >
                      {row[colIdx] !== undefined ? row[colIdx] : ''}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Bottom virtual spacer */}
            {bottomSpacerHeight > 0 && (
              <tr>
                <td style={{ height: `${bottomSpacerHeight}px` }} colSpan={headers.length + 1} className="p-0 border-0" />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
