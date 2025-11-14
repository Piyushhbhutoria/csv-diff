import * as XLSX from 'xlsx';
import { DiffResult } from './diffEngine';

export interface ExportMetadata {
  timestamp: string;
  fileAName: string;
  fileBName: string;
  summary: DiffResult['summary'];
}

export const exportToCSV = (diffResult: DiffResult, metadata: ExportMetadata) => {
  const rows = [
    // Metadata header
    ['CSV Comparison Report'],
    ['Generated:', metadata.timestamp],
    ['File A:', metadata.fileAName],
    ['File B:', metadata.fileBName],
    [],
    ['Summary'],
    ['Total Rows:', metadata.summary.totalRows.toString()],
    ['Added:', metadata.summary.added.toString()],
    ['Removed:', metadata.summary.removed.toString()],
    ['Modified:', metadata.summary.modified.toString()],
    ['Unchanged:', metadata.summary.unchanged.toString()],
    [],
    // Column headers
    ['Status', ...diffResult.headers],
  ];

  // Data rows
  diffResult.rows.forEach(row => {
    const rowData = [
      row.type.toUpperCase(),
      ...diffResult.headers.map(header => row.rowData[header] || ''),
    ];
    rows.push(rowData);
  });

  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `comparison_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToJSON = (diffResult: DiffResult, metadata: ExportMetadata) => {
  const exportData = {
    metadata,
    columnDiff: diffResult.columnDiff,
    summary: diffResult.summary,
    rows: diffResult.rows,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `comparison_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToXLSX = (diffResult: DiffResult, metadata: ExportMetadata) => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['CSV Comparison Report'],
    [],
    ['Generated:', metadata.timestamp],
    ['File A:', metadata.fileAName],
    ['File B:', metadata.fileBName],
    [],
    ['Summary'],
    ['Total Rows:', metadata.summary.totalRows],
    ['Added:', metadata.summary.added],
    ['Removed:', metadata.summary.removed],
    ['Modified:', metadata.summary.modified],
    ['Unchanged:', metadata.summary.unchanged],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Data sheet
  const dataRows = [
    ['Status', ...diffResult.headers],
    ...diffResult.rows.map(row => [
      row.type.toUpperCase(),
      ...diffResult.headers.map(header => row.rowData[header] || ''),
    ]),
  ];
  const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Comparison');

  // Write file
  XLSX.writeFile(workbook, `comparison_${Date.now()}.xlsx`);
};
