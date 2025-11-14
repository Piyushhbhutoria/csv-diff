import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { DiffResult, RowDiff } from '@/lib/diffEngine';
import { cn } from '@/lib/utils';

interface DiffTableProps {
  diffResult: DiffResult;
  filteredRows: RowDiff[];
}

export const DiffTable = ({ diffResult, filteredRows }: DiffTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 10,
  });

  const getRowClassName = (type: RowDiff['type']) => {
    switch (type) {
      case 'added':
        return 'bg-added-light hover:bg-added-light/80';
      case 'removed':
        return 'bg-removed-light hover:bg-removed-light/80';
      case 'modified':
        return 'bg-modified-light hover:bg-modified-light/80';
      default:
        return 'bg-unchanged hover:bg-muted/50';
    }
  };

  const getCellClassName = (row: RowDiff, column: string) => {
    if (row.type !== 'modified' || !row.changedCells) return '';
    
    const isChanged = row.changedCells.some(cell => cell.column === column);
    return isChanged ? 'bg-modified/30 font-medium' : '';
  };

  const getStatusBadge = (type: RowDiff['type']) => {
    const badges = {
      added: { label: 'ADDED', className: 'bg-added text-added-foreground' },
      removed: { label: 'REMOVED', className: 'bg-removed text-removed-foreground' },
      modified: { label: 'MODIFIED', className: 'bg-modified text-modified-foreground' },
      unchanged: { label: 'UNCHANGED', className: 'bg-muted text-muted-foreground' },
    };
    
    const badge = badges[type];
    return (
      <span className={cn('px-2 py-1 text-xs font-semibold rounded', badge.className)}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-table-header text-table-header-foreground overflow-x-auto">
        <div className="flex min-w-max">
          <div className="flex-shrink-0 w-32 px-4 py-3 font-semibold text-xs uppercase tracking-wider border-r border-border/20">
            Status
          </div>
          {diffResult.headers.map((header, i) => (
            <div
              key={i}
              className="flex-shrink-0 min-w-[150px] px-4 py-3 font-semibold text-xs uppercase tracking-wider border-r border-border/20 last:border-r-0"
            >
              {header}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: '600px' }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = filteredRows[virtualRow.index];
            
            return (
              <div
                key={virtualRow.index}
                className={cn(
                  'absolute top-0 left-0 w-full flex min-w-max border-b border-border transition-colors',
                  getRowClassName(row.type)
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="flex-shrink-0 w-32 px-4 py-3 border-r border-border/20 flex items-center">
                  {getStatusBadge(row.type)}
                </div>
                {diffResult.headers.map((header, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-shrink-0 min-w-[150px] px-4 py-3 text-sm border-r border-border/20 last:border-r-0',
                      getCellClassName(row, header)
                    )}
                  >
                    {row.rowData[header] || '-'}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
