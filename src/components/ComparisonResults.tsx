import { useState } from 'react';
import { DiffResult, DiffType } from '@/lib/diffEngine';
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

interface ComparisonResultsProps {
  diffResult: DiffResult;
  fileAName: string;
  fileBName: string;
}

export const ComparisonResults = ({ diffResult, fileAName, fileBName }: ComparisonResultsProps) => {
  const [activeFilters, setActiveFilters] = useState<Set<DiffType>>(new Set());

  const filteredRows = diffResult.rows.filter(row => 
    activeFilters.size === 0 || activeFilters.has(row.type)
  );

  const toggleFilter = (type: DiffType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const metadata: ExportMetadata = {
    timestamp: new Date().toISOString(),
    fileAName,
    fileBName,
    summary: diffResult.summary,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diffResult.summary.totalRows}</div>
          </CardContent>
        </Card>

        <Card className="border-added/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-added">{diffResult.summary.added}</div>
          </CardContent>
        </Card>

        <Card className="border-removed/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-removed">{diffResult.summary.removed}</div>
          </CardContent>
        </Card>

        <Card className="border-modified/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-modified">{diffResult.summary.modified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unchanged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{diffResult.summary.unchanged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Column Differences */}
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

      {/* Controls */}
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
              <DropdownMenuCheckboxItem
                checked={activeFilters.has('added')}
                onCheckedChange={() => toggleFilter('added')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-added" />
                  Added ({diffResult.summary.added})
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.has('removed')}
                onCheckedChange={() => toggleFilter('removed')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-removed" />
                  Removed ({diffResult.summary.removed})
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.has('modified')}
                onCheckedChange={() => toggleFilter('modified')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-modified" />
                  Modified ({diffResult.summary.modified})
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.has('unchanged')}
                onCheckedChange={() => toggleFilter('unchanged')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-muted" />
                  Unchanged ({diffResult.summary.unchanged})
                </span>
              </DropdownMenuCheckboxItem>
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
            <DropdownMenuCheckboxItem onSelect={() => exportToXLSX(diffResult, metadata)}>
              Excel (XLSX)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <DiffTable diffResult={diffResult} filteredRows={filteredRows} />
    </div>
  );
};
