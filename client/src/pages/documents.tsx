import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, FileText, Clock, Download, History, Eye, Upload } from "lucide-react";
import type { Document, DocumentVersion, Center, Department } from "@shared/schema";

const documentFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.string().min(1, "Selecciona un tipo de documento"),
  centerId: z.string().min(1, "Selecciona un centro"),
  departmentId: z.string().min(1, "Selecciona un departamento"),
});

const versionFormSchema = z.object({
  changeReason: z.string().min(10, "Describe el motivo del cambio (mínimo 10 caracteres)"),
  fileName: z.string().min(1, "Nombre del archivo requerido"),
  fileSize: z.number().min(1),
  mimeType: z.string().min(1),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const documentTypes = [
  { value: "escritura", label: "Escritura" },
  { value: "predial", label: "Predial" },
  { value: "contrato", label: "Contrato" },
  { value: "licencia", label: "Licencia" },
  { value: "dictamen", label: "Dictamen" },
  { value: "reporte", label: "Reporte Técnico" },
];

function DocumentFormDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });
  const { data: departments = [] } = useQuery<Department[]>({ queryKey: ['/api/departments'] });

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: "",
      centerId: "",
      departmentId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      return apiRequest("POST", "/api/documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Documento creado exitosamente" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al crear el documento", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Documento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Escritura Centro Norte 2024" {...field} data-testid="input-document-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-document-type">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="centerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-document-center">
                        <SelectValue placeholder="Seleccionar centro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-document-department">
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-document">
                {createMutation.isPending ? 'Creando...' : 'Crear Documento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function VersionHistoryDialog({
  document,
  open,
  onOpenChange
}: {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: versions = [] } = useQuery<DocumentVersion[]>({
    queryKey: ['/api/documents', document?.id, 'versions'],
    enabled: !!document?.id,
  });

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Versiones - {document.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          {versions.length > 0 ? (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="p-4 rounded-md border hover-elevate">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">v{version.version}</Badge>
                        <span className="text-sm font-medium">{version.fileName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{version.changeReason}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(version.uploadedAt).toLocaleString('es-MX')}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" data-testid={`button-download-version-${version.id}`}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay versiones registradas</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function NewVersionDialog({
  document,
  open,
  onOpenChange
}: {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [changeReason, setChangeReason] = useState("");

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/documents/${document?.id}/versions`, {
        documentId: document?.id,
        version: (document?.currentVersion || 0) + 1,
        fileName: `documento_v${(document?.currentVersion || 0) + 1}.pdf`,
        fileSize: 1024000,
        mimeType: "application/pdf",
        changeReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents', document?.id, 'versions'] });
      toast({ title: "Nueva versión creada exitosamente" });
      onOpenChange(false);
      setChangeReason("");
    },
    onError: () => {
      toast({ title: "Error al crear la versión", variant: "destructive" });
    },
  });

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Nueva Versión - {document.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-muted">
            <p className="text-sm">
              <span className="text-muted-foreground">Versión actual:</span>{" "}
              <Badge variant="outline">v{document.currentVersion}</Badge>
            </p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Nueva versión:</span>{" "}
              <Badge>v{document.currentVersion + 1}</Badge>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo del cambio *</label>
            <Textarea
              placeholder="Describe los cambios realizados en esta versión..."
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              className="min-h-24"
              data-testid="textarea-change-reason"
            />
            <p className="text-xs text-muted-foreground">
              El motivo del cambio es obligatorio para mantener la trazabilidad del documento.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => createVersionMutation.mutate()}
              disabled={changeReason.length < 10 || createVersionMutation.isPending}
              data-testid="button-create-version"
            >
              {createVersionMutation.isPending ? 'Creando...' : 'Crear Versión'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [historyDocument, setHistoryDocument] = useState<Document | null>(null);
  const [versionDocument, setVersionDocument] = useState<Document | null>(null);

  const { data: documents = [], isLoading } = useQuery<Document[]>({ 
    queryKey: ['/api/documents'] 
  });

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-documents">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gestión documental con control de versiones</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-new-document">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {filteredDocuments.length} documentos
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-documents"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Versión</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(doc.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">v{doc.currentVersion}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setHistoryDocument(doc)}
                            data-testid={`button-history-${doc.id}`}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setVersionDocument(doc)}
                            data-testid={`button-new-version-${doc.id}`}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-download-${doc.id}`}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No se encontraron documentos</p>
              <p className="text-sm mt-1">Sube tu primer documento para comenzar</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Documento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <VersionHistoryDialog 
        document={historyDocument} 
        open={!!historyDocument} 
        onOpenChange={(open) => !open && setHistoryDocument(null)}
      />
      <NewVersionDialog 
        document={versionDocument} 
        open={!!versionDocument} 
        onOpenChange={(open) => !open && setVersionDocument(null)}
      />
    </div>
  );
}
