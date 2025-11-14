import Papa from 'papaparse';

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  rawData: string[][];
}

export const parseCSV = (file: File): Promise<ParsedCSV> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        
        // Also get raw data for reference
        Papa.parse(file, {
          complete: (rawResults) => {
            resolve({
              headers,
              rows,
              rawData: rawResults.data as string[][],
            });
          },
          error: reject,
        });
      },
      error: reject,
    });
  });
};
