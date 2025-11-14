export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface CellDiff {
  column: string;
  oldValue: string;
  newValue: string;
}

export interface RowDiff {
  type: DiffType;
  rowIndex: number;
  rowData: Record<string, string>;
  changedCells?: CellDiff[];
  // For matching rows from both files
  fileAIndex?: number;
  fileBIndex?: number;
}

export interface DiffResult {
  headers: string[];
  columnDiff: {
    added: string[];
    removed: string[];
    common: string[];
  };
  rows: RowDiff[];
  summary: {
    totalRows: number;
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

// Simple hash function for row comparison
const hashRow = (row: Record<string, string>, columns: string[]): string => {
  return columns.map(col => row[col] || '').join('|');
};

// Find matching row based on content similarity
const findMatchingRow = (
  targetRow: Record<string, string>,
  candidateRows: Record<string, string>[],
  columns: string[]
): number => {
  const targetHash = hashRow(targetRow, columns);
  
  for (let i = 0; i < candidateRows.length; i++) {
    if (hashRow(candidateRows[i], columns) === targetHash) {
      return i;
    }
  }
  
  return -1;
};

// Detect cell-level differences
const detectCellChanges = (
  rowA: Record<string, string>,
  rowB: Record<string, string>,
  columns: string[]
): CellDiff[] => {
  const changes: CellDiff[] = [];
  
  for (const col of columns) {
    const valueA = rowA[col] || '';
    const valueB = rowB[col] || '';
    
    if (valueA !== valueB) {
      changes.push({
        column: col,
        oldValue: valueA,
        newValue: valueB,
      });
    }
  }
  
  return changes;
};

export const compareCSVs = (
  fileAData: { headers: string[]; rows: Record<string, string>[] },
  fileBData: { headers: string[]; rows: Record<string, string>[] }
): DiffResult => {
  // Detect column differences
  const headersA = new Set(fileAData.headers);
  const headersB = new Set(fileBData.headers);
  
  const commonHeaders = fileAData.headers.filter(h => headersB.has(h));
  const addedHeaders = fileBData.headers.filter(h => !headersA.has(h));
  const removedHeaders = fileAData.headers.filter(h => !headersB.has(h));
  
  // Combine all headers for display
  const allHeaders = [...new Set([...fileAData.headers, ...fileBData.headers])];
  
  const rowDiffs: RowDiff[] = [];
  const processedBRows = new Set<number>();
  
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;
  
  // Process File A rows
  for (let i = 0; i < fileAData.rows.length; i++) {
    const rowA = fileAData.rows[i];
    const matchIndex = findMatchingRow(rowA, fileBData.rows, commonHeaders);
    
    if (matchIndex === -1) {
      // Row removed in File B
      rowDiffs.push({
        type: 'removed',
        rowIndex: rowDiffs.length,
        rowData: rowA,
        fileAIndex: i,
      });
      removedCount++;
    } else {
      processedBRows.add(matchIndex);
      const rowB = fileBData.rows[matchIndex];
      const cellChanges = detectCellChanges(rowA, rowB, allHeaders);
      
      if (cellChanges.length > 0) {
        // Row modified
        rowDiffs.push({
          type: 'modified',
          rowIndex: rowDiffs.length,
          rowData: { ...rowA, ...rowB },
          changedCells: cellChanges,
          fileAIndex: i,
          fileBIndex: matchIndex,
        });
        modifiedCount++;
      } else {
        // Row unchanged
        rowDiffs.push({
          type: 'unchanged',
          rowIndex: rowDiffs.length,
          rowData: rowA,
          fileAIndex: i,
          fileBIndex: matchIndex,
        });
        unchangedCount++;
      }
    }
  }
  
  // Process remaining File B rows (newly added)
  for (let i = 0; i < fileBData.rows.length; i++) {
    if (!processedBRows.has(i)) {
      rowDiffs.push({
        type: 'added',
        rowIndex: rowDiffs.length,
        rowData: fileBData.rows[i],
        fileBIndex: i,
      });
      addedCount++;
    }
  }
  
  return {
    headers: allHeaders,
    columnDiff: {
      added: addedHeaders,
      removed: removedHeaders,
      common: commonHeaders,
    },
    rows: rowDiffs,
    summary: {
      totalRows: rowDiffs.length,
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      unchanged: unchangedCount,
    },
  };
};

