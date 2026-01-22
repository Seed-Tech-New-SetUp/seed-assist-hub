import { RefreshCw, Download, Trash2, Lock, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LAEFile } from "@/lib/api/lae";
import { format } from "date-fns";

interface FilesListProps {
  files: LAEFile[];
  isLoading: boolean;
  onRefresh: () => void;
  onDelete: (fileId: number) => void;
  deletingFileId: number | null;
}

function getFileIcon(fileType: string) {
  return FileSpreadsheet;
}

function getFileTypeBadge(fileType: string) {
  const colors: Record<string, string> = {
    xlsx: "bg-green-500/10 text-green-600 dark:text-green-400",
    xls: "bg-green-500/10 text-green-600 dark:text-green-400",
    csv: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };
  return colors[fileType] || "bg-muted text-muted-foreground";
}

export function FilesList({
  files,
  isLoading,
  onRefresh,
  onDelete,
  deletingFileId,
}: FilesListProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Uploaded Files
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">No files uploaded</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first file to get started
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.file_type);
                const isAssigned = !!file.assignment_id;
                const isDeleting = deletingFileId === file.file_id;

                return (
                  <div
                    key={file.file_id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {file.original_file_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={getFileTypeBadge(file.file_type)}
                        >
                          {file.file_type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {file.file_size_in_mb} MB
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(file.uploaded_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a href={file.download_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </a>
                        </Button>

                        {isAssigned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled
                          >
                            <Lock className="h-3.5 w-3.5 mr-1" />
                            Assigned
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                )}
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.original_file_name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(file.file_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
