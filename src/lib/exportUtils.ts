import ExcelJS from 'exceljs';
import { DiffResult } from './diffEngine';

export interface ExportMetadata {
  timestamp: string;
  fileAName: string;
  fileBName: string;
  summary: DiffResult['summary'];
}

type ExportCell = string | number;

const buildReportHeaderRows = (metadata: ExportMetadata): string[][] => [
  ['CSV Comparison Report'],
  ['Generated:', metadata.timestamp],
  ['File A:', metadata.fileAName],
  ['File B:', metadata.fileBName],
];

const buildSummaryRows = (summary: ExportMetadata['summary']): ExportCell[][] => [
  ['Summary'],
  ['Total Rows:', summary.totalRows],
  ['Added:', summary.added],
  ['Removed:', summary.removed],
  ['Modified:', summary.modified],
  ['Unchanged:', summary.unchanged],
];

const buildComparisonRows = (diffResult: DiffResult): string[][] => [
  ['Status', ...diffResult.headers],
  ...diffResult.rows.map((row) => [
    row.type.toUpperCase(),
    ...diffResult.headers.map((header) => row.rowData[header] ?? ''),
  ]),
];

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToCSV = (diffResult: DiffResult, metadata: ExportMetadata) => {
  const rows = [
    ...buildReportHeaderRows(metadata),
    [],
    ...buildSummaryRows(metadata.summary).map((row) => row.map((cell) => cell.toString())),
    [],
    ...buildComparisonRows(diffResult),
  ];

  const csvContent = rows.map((row) =>
    row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `comparison_${Date.now()}.csv`);
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
  downloadBlob(blob, `comparison_${Date.now()}.json`);
};

export const exportToXLSX = async (
  diffResult: DiffResult,
  metadata: ExportMetadata
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRows([
    ...buildReportHeaderRows(metadata),
    [],
    ...buildSummaryRows(metadata.summary),
  ]);

  const dataSheet = workbook.addWorksheet('Comparison');
  const [headerRow, ...bodyRows] = buildComparisonRows(diffResult);
  dataSheet.addRow(headerRow);
  for (const row of bodyRows) {
    dataSheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `comparison_${Date.now()}.xlsx`);
};
