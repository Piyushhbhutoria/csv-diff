import { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  label: string;
  selectedFile?: File;
  onClear: () => void;
}

export const FileUploader = ({ onFileSelect, label, selectedFile, onClear }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find(f => f.name.endsWith('.csv'));
      
      if (csvFile) {
        onFileSelect(csvFile);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-card">
          <File className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <button
            onClick={onClear}
            className="p-1 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
          )}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={cn(
              'p-3 rounded-full transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-secondary'
            )}>
              <Upload className={cn(
                'h-6 w-6',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop CSV file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports files up to 100MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
