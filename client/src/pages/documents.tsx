import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, FileText, Clock, Download, History, Upload, Building2, FolderOpen, ArrowRight, Eye, CalendarClock } from "lucide-react";
import type { Document, DocumentVersion, Center, Department } from "@shared/schema";
import { DocumentPreviewDialog } from "@/components/document-preview-dialog";

const documentFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.string().min(1, "Selecciona un tipo de documento"),
  centerId: z.string().min(1, "Selecciona un centro"),
  departmentId: z.string().min(1, "Selecciona un departamento"),
  expirationDate: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const documentTypes = [
  { value: "escritura", label: "Escritura" },
  { value: "predial", label: "Predial" },
  { value: "contrato", label: "Contrato" },
  { value: "licencia", label: "Licencia" },
  { value: "dictamen", label: "Dictamen" },
  { value: "reporte", label: "Reporte Técnico" },
  { value: "permiso", label: "Permiso" },
  { value: "plano", label: "Plano" },
  { value: "certificado", label: "Certificado" },
  { value: "otro", label: "Otro" },
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
      expirationDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      const payload: any = { ...data };
      if (payload.expirationDate) {
        payload.expirationDate = new Date(payload.expirationDate).toISOString();
      } else {
        delete payload.expirationDate;
      }
      return apiRequest("POST", "/api/documents", payload);
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
                  <FormLabel>Departamento Responsable</FormLabel>
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

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" data-testid="input-expiration-date" {...field} />
                  </FormControl>
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

function DocumentCard({ 
  document, 
  center,
  department,
  onViewHistory,
  onNewVersion,
  onPreview,
  showCenter = false
}: { 
  document: Document;
  center?: Center;
  department?: Department;
  onViewHistory: () => void;
  onNewVersion: () => void;
  onPreview: () => void;
  showCenter?: boolean;
}) {
  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{document.name}</h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{getTypeLabel(document.type)}</Badge>
                <Badge variant="secondary" className="text-xs">v{document.currentVersion}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                {showCenter && center && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {center.name}
                  </span>
                )}
                {department && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {department.name}
                  </span>
                )}
                {document.expirationDate && (() => {
                  const expDate = new Date(document.expirationDate);
                  const now = new Date();
                  const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysLeft <= 0;
                  const isCritical = daysLeft <= 7;
                  const isUrgent = daysLeft <= 15;
                  return (
                    <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500 font-medium' : isCritical ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      <CalendarClock className="h-3 w-3" />
                      {isExpired
                        ? `Vencido`
                        : `Vence: ${expDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onPreview}
              title="Ver / Descargar"
              data-testid={`button-preview-${document.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onViewHistory}
              title="Ver historial"
              data-testid={`button-history-${document.id}`}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onNewVersion}
              title="Nueva versión"
              data-testid={`button-new-version-${document.id}`}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CenterDocumentsCard({
  center,
  documents,
  departments,
  onViewHistory,
  onNewVersion,
  onPreview
}: {
  center: Center;
  documents: Document[];
  departments: Department[];
  onViewHistory: (doc: Document) => void;
  onNewVersion: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}) {
  const getDepartment = (departmentId: string) => {
    return departments.find(d => d.id === departmentId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {center.name}
            <Badge variant="secondary" className="ml-2">{documents.length} docs</Badge>
          </CardTitle>
          <Link href={`/centers/${center.id}`}>
            <Button variant="ghost" size="sm" data-testid={`button-view-center-docs-${center.id}`}>
              Ver todo
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{center.city}, {center.state}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {documents.slice(0, 4).map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              department={getDepartment(doc.departmentId)}
              onViewHistory={() => onViewHistory(doc)}
              onNewVersion={() => onNewVersion(doc)}
              onPreview={() => onPreview(doc)}
            />
          ))}
        </div>
        {documents.length > 4 && (
          <div className="mt-3 text-center">
            <Link href={`/centers/${center.id}`}>
              <Button variant="outline" size="sm">
                Ver {documents.length - 4} documentos más
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [historyDocument, setHistoryDocument] = useState<Document | null>(null);
  const [versionDocument, setVersionDocument] = useState<Document | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string>("all");

  const { data: documents = [], isLoading } = useQuery<Document[]>({ 
    queryKey: ['/api/documents'] 
  });

  const { data: centers = [] } = useQuery<Center[]>({ 
    queryKey: ['/api/centers'] 
  });

  const { data: departments = [] } = useQuery<Department[]>({ 
    queryKey: ['/api/departments'] 
  });

  const getCenter = (centerId: string) => centers.find(c => c.id === centerId);
  const getDepartment = (departmentId: string) => departments.find(d => d.id === departmentId);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCenter = selectedCenter === "all" || doc.centerId === selectedCenter;
    return matchesSearch && matchesCenter;
  });

  const documentsByCenter = centers
    .map(center => ({
      center,
      documents: documents.filter(doc => doc.centerId === center.id)
    }))
    .filter(group => group.documents.length > 0);

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-documents">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gestión documental organizada por centro</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-new-document">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      <Tabs defaultValue="by-center" className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="by-center" data-testid="tab-by-center">Por Centro</TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all-documents">Todos</TabsTrigger>
          </TabsList>
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

        <TabsContent value="by-center" className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : documentsByCenter.length > 0 ? (
            documentsByCenter.map(({ center, documents: centerDocs }) => (
              <CenterDocumentsCard
                key={center.id}
                center={center}
                documents={centerDocs}
                departments={departments}
                onViewHistory={setHistoryDocument}
                onNewVersion={setVersionDocument}
                onPreview={setPreviewDocument}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-muted-foreground">No hay documentos registrados</p>
                <p className="text-sm text-muted-foreground mt-1">Crea tu primer documento para comenzar</p>
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Documento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {filteredDocuments.length} documentos
                </CardTitle>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger className="w-56" data-testid="select-filter-center">
                    <SelectValue placeholder="Filtrar por centro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los centros</SelectItem>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      center={getCenter(doc.centerId)}
                      department={getDepartment(doc.departmentId)}
                      onViewHistory={() => setHistoryDocument(doc)}
                      onNewVersion={() => setVersionDocument(doc)}
                      onPreview={() => setPreviewDocument(doc)}
                      showCenter
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No se encontraron documentos</p>
                  <p className="text-sm mt-1">Ajusta los filtros o crea un nuevo documento</p>
                  <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
      <DocumentPreviewDialog
        document={previewDocument}
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
      />
    </div>
  );
}
