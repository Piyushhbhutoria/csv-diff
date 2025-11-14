import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { ComparisonResults } from '@/components/ComparisonResults';
import { Button } from '@/components/ui/button';
import { parseCSV, ParsedCSV } from '@/lib/csvParser';
import { compareCSVs, DiffResult } from '@/lib/diffEngine';
import { useToast } from '@/hooks/use-toast';
import { GitCompare, RotateCcw } from 'lucide-react';

const Index = () => {
  const [fileA, setFileA] = useState<File | undefined>();
  const [fileB, setFileB] = useState<File | undefined>();
  const [parsedA, setParsedA] = useState<ParsedCSV | undefined>();
  const [parsedB, setParsedB] = useState<ParsedCSV | undefined>();
  const [diffResult, setDiffResult] = useState<DiffResult | undefined>();
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      toast({
        title: 'Missing Files',
        description: 'Please select both CSV files to compare.',
        variant: 'destructive',
      });
      return;
    }

    setIsComparing(true);

    try {
      const [dataA, dataB] = await Promise.all([
        parseCSV(fileA),
        parseCSV(fileB),
      ]);

      setParsedA(dataA);
      setParsedB(dataB);

      const result = compareCSVs(dataA, dataB);
      setDiffResult(result);

      toast({
        title: 'Comparison Complete',
        description: `Found ${result.summary.added} added, ${result.summary.removed} removed, and ${result.summary.modified} modified rows.`,
      });
    } catch (error) {
      console.error('Comparison error:', error);
      toast({
        title: 'Comparison Failed',
        description: 'An error occurred while comparing the files. Please check the file format.',
        variant: 'destructive',
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setFileA(undefined);
    setFileB(undefined);
    setParsedA(undefined);
    setParsedB(undefined);
    setDiffResult(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitCompare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CSV Comparator</h1>
                <p className="text-sm text-muted-foreground">
                  Compare and analyze differences between CSV files
                </p>
              </div>
            </div>
            {diffResult && (
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                New Comparison
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!diffResult ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* File Upload Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <FileUploader
                label="File A (Original)"
                selectedFile={fileA}
                onFileSelect={setFileA}
                onClear={() => setFileA(undefined)}
              />
              <FileUploader
                label="File B (Comparison)"
                selectedFile={fileB}
                onFileSelect={setFileB}
                onClear={() => setFileB(undefined)}
              />
            </div>

            {/* Compare Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleCompare}
                disabled={!fileA || !fileB || isComparing}
                className="gap-2 min-w-[200px]"
              >
                <GitCompare className="h-5 w-5" />
                {isComparing ? 'Comparing...' : 'Compare Files'}
              </Button>
            </div>

            {/* Info Section */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground">How it works:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">1.</span>
                  <span>Upload two CSV files to compare their contents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">2.</span>
                  <span>View color-coded differences: added (green), removed (red), modified (yellow)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">3.</span>
                  <span>Filter results and export to CSV, JSON, or Excel format</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <ComparisonResults
            diffResult={diffResult}
            fileAName={fileA?.name || 'File A'}
            fileBName={fileB?.name || 'File B'}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
