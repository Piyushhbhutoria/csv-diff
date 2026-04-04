import { useState } from 'react';
import { DiffResult, DiffType } from '@/lib/diffEngine';
import { DIFF_TYPE_META, DIFF_TYPE_ORDER } from '@/lib/diffPresentation';
import { DiffTable } from './DiffTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { exportToCSV, exportToJSON, exportToXLSX, ExportMetadata } from '@/lib/exportUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

interface ComparisonResultsProps {
  diffResult: DiffResult;
  fileAName: string;
  fileBName: string;
}

const SUMMARY_CARDS: Array<{
  key: keyof DiffResult['summary'];
  label: string;
  cardClassName?: string;
  valueClassName?: string;
}> = [
  { key: 'totalRows', label: 'Total Rows' },
  { key: 'added', label: 'Added', cardClassName: DIFF_TYPE_META.added.summaryBorderClassName, valueClassName: DIFF_TYPE_META.added.summaryTextClassName },
  { key: 'removed', label: 'Removed', cardClassName: DIFF_TYPE_META.removed.summaryBorderClassName, valueClassName: DIFF_TYPE_META.removed.summaryTextClassName },
  { key: 'modified', label: 'Modified', cardClassName: DIFF_TYPE_META.modified.summaryBorderClassName, valueClassName: DIFF_TYPE_META.modified.summaryTextClassName },
  { key: 'unchanged', label: 'Unchanged', valueClassName: DIFF_TYPE_META.unchanged.summaryTextClassName },
];

export const ComparisonResults = ({ diffResult, fileAName, fileBName }: ComparisonResultsProps) => {
  const [activeFilters, setActiveFilters] = useState<Set<DiffType>>(new Set());

  const filteredRows = diffResult.rows.filter(row => 
    activeFilters.size === 0 || activeFilters.has(row.type)
  );

  const toggleFilter = (type: DiffType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const metadata: ExportMetadata = {
    timestamp: new Date().toISOString(),
    fileAName,
    fileBName,
    summary: diffResult.summary,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <Card key={card.key} className={card.cardClassName}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', card.valueClassName)}>{diffResult.summary[card.key]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(diffResult.columnDiff.added.length > 0 || diffResult.columnDiff.removed.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Column Differences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diffResult.columnDiff.added.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Added:</span>
                {diffResult.columnDiff.added.map((col, i) => (
                  <Badge key={i} className="bg-added text-added-foreground">
                    {col}
                  </Badge>
                ))}
              </div>
            )}
            {diffResult.columnDiff.removed.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Removed:</span>
                {diffResult.columnDiff.removed.map((col, i) => (
                  <Badge key={i} className="bg-removed text-removed-foreground">
                    {col}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilters.size > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Show rows</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DIFF_TYPE_ORDER.map((type) => (
                <DropdownMenuCheckboxItem key={type} checked={activeFilters.has(type)} onCheckedChange={() => toggleFilter(type)}>
                  <span className="flex items-center gap-2">
                    <span className={cn('w-3 h-3 rounded', DIFF_TYPE_META[type].filterSwatchClassName)} />
                    {DIFF_TYPE_META[type].label} ({diffResult.summary[type]})
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-sm text-muted-foreground">
            Showing {filteredRows.length} of {diffResult.summary.totalRows} rows
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem onSelect={() => exportToCSV(diffResult, metadata)}>
              CSV Format
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onSelect={() => exportToJSON(diffResult, metadata)}>
              JSON Format
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onSelect={() => {
                void exportToXLSX(diffResult, metadata);
              }}
            >
              Excel (XLSX)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DiffTable diffResult={diffResult} filteredRows={filteredRows} />
    </div>
  );
};
