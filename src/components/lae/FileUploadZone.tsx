import { useState, useRef, useCallback } from "react";
import { Upload, FolderOpen, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  uploadingFileName: string | null;
}

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadZone({
  onUpload,
  isUploading,
  uploadProgress,
  uploadingFileName,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "Please upload only Excel or CSV files";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB";
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const error = validateFile(file);
        if (error) {
          console.error(error);
          continue;
        }
        await onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          File Upload
        </CardTitle>
        <CardDescription>
          Upload Excel (.xlsx, .xls) or CSV files for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Drag & drop files here
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <Button type="button" variant="default" size="sm" disabled={isUploading}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && uploadingFileName && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate">{uploadingFileName}</span>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <span className="text-xs text-muted-foreground mt-1 block">
              {uploadProgress}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
