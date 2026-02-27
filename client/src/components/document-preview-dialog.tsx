import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye, FileText, Image, File, ExternalLink, Loader2 } from "lucide-react";
import type { Document, DocumentVersion } from "@shared/schema";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return <Image className="h-5 w-5" />;
  if (mimeType?.includes("pdf")) return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

function canPreviewInBrowser(mimeType: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

export function DocumentPreviewDialog({
  document,
  open,
  onOpenChange,
}: {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [previewMode, setPreviewMode] = useState(false);

  const { data: version, isLoading } = useQuery<DocumentVersion>({
    queryKey: ['/api/documents', document?.id, 'current-version'],
    enabled: !!document?.id && open,
  });

  if (!document) return null;

  const hasFile = version?.filePath;
  const canPreview = version?.mimeType ? canPreviewInBrowser(version.mimeType) : false;

  const handleDownload = () => {
    if (version?.filePath) {
      const link = window.document.createElement("a");
      link.href = version.filePath;
      link.download = version.fileName || "documento";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (version?.filePath) {
      window.open(version.filePath, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setPreviewMode(false); onOpenChange(v); }}>
      <DialogContent className={previewMode ? "max-w-5xl h-[85vh]" : "max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {document.name}
          </DialogTitle>
          <DialogDescription>
            Previsualización y descarga del documento
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !version || !hasFile ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No hay archivo disponible</p>
            <p className="text-sm mt-1">Este documento aún no tiene un archivo subido o aprobado.</p>
          </div>
        ) : previewMode && canPreview ? (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getFileIcon(version.mimeType)}
                <span className="text-sm font-medium">{version.fileName}</span>
                <Badge variant="outline">v{version.version}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} data-testid="button-back-to-info">
                  Información
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenInNewTab} data-testid="button-open-new-tab">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir
                </Button>
                <Button size="sm" onClick={handleDownload} data-testid="button-download-preview">
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              </div>
            </div>
            <div className="flex-1 border rounded-md overflow-hidden min-h-0">
              {version.mimeType === "application/pdf" ? (
                <iframe
                  src={version.filePath!}
                  className="w-full h-full min-h-[60vh]"
                  title={version.fileName}
                />
              ) : version.mimeType?.startsWith("image/") ? (
                <ScrollArea className="h-full">
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={version.filePath!}
                      alt={version.fileName}
                      className="max-w-full rounded-md"
                    />
                  </div>
                </ScrollArea>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-md border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  {getFileIcon(version.mimeType)}
                </div>
                <div>
                  <p className="font-medium">{version.fileName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">v{version.version}</Badge>
                    {version.fileSize > 0 && <span>{formatFileSize(version.fileSize)}</span>}
                    <span>{version.mimeType}</span>
                  </div>
                </div>
              </div>
              {version.changeReason && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Motivo del cambio:</p>
                  <p className="text-sm">{version.changeReason}</p>
                </div>
              )}
              <div className="pt-3 border-t mt-3">
                <p className="text-xs text-muted-foreground">
                  Subido el {new Date(version.uploadedAt).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {canPreview && (
                <Button variant="outline" onClick={() => setPreviewMode(true)} data-testid="button-preview-document">
                  <Eye className="h-4 w-4 mr-2" />
                  Previsualizar
                </Button>
              )}
              <Button variant="outline" onClick={handleOpenInNewTab} data-testid="button-open-in-tab">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en nueva pestaña
              </Button>
              <Button onClick={handleDownload} data-testid="button-download-document">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
