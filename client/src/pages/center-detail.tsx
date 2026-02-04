import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Building2, MapPin, FileText, Plus, History, Upload, Download, Clock, FolderOpen } from "lucide-react";
import type { Center, Document, DocumentVersion, Department } from "@shared/schema";

const documentFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.string().min(1, "Selecciona un tipo de documento"),
  departmentId: z.string().min(1, "Selecciona un departamento"),
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
  onOpenChange,
  centerId
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  centerId: string;
}) {
  const { toast } = useToast();
  const { data: departments = [] } = useQuery<Department[]>({ queryKey: ['/api/departments'] });

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: "",
      departmentId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      return apiRequest("POST", "/api/documents", { ...data, centerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/centers', centerId, 'documents'] });
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
          <DialogTitle>Nuevo Documento para este Centro</DialogTitle>
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
                    <Input placeholder="Ej: Escritura Pública 2024" {...field} data-testid="input-center-document-name" />
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
                      <SelectTrigger data-testid="select-center-document-type">
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
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento Responsable</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-center-document-department">
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
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-center-document">
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
              data-testid="textarea-version-change-reason"
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
              data-testid="button-create-new-version"
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
  department,
  onViewHistory,
  onNewVersion
}: { 
  document: Document;
  department?: Department;
  onViewHistory: () => void;
  onNewVersion: () => void;
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
              {department && (
                <p className="text-xs text-muted-foreground mt-2">{department.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onViewHistory}
              title="Ver historial"
              data-testid={`button-doc-history-${document.id}`}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onNewVersion}
              title="Nueva versión"
              data-testid={`button-doc-new-version-${document.id}`}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              title="Descargar"
              data-testid={`button-doc-download-${document.id}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CenterDetailPage() {
  const params = useParams();
  const centerId = params.id as string;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [historyDocument, setHistoryDocument] = useState<Document | null>(null);
  const [versionDocument, setVersionDocument] = useState<Document | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: center, isLoading: centerLoading } = useQuery<Center>({
    queryKey: ['/api/centers', centerId],
  });

  const { data: allDocuments = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const centerDocuments = allDocuments.filter(doc => doc.centerId === centerId);
  
  const filteredDocuments = selectedDepartment === "all" 
    ? centerDocuments 
    : centerDocuments.filter(doc => doc.departmentId === selectedDepartment);

  const getDepartment = (departmentId: string) => {
    return departments.find(d => d.id === departmentId);
  };

  const documentsByDepartment = departments.map(dept => ({
    department: dept,
    documents: centerDocuments.filter(doc => doc.departmentId === dept.id)
  })).filter(group => group.documents.length > 0);

  if (centerLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Centro no encontrado</p>
          <Link href="/centers">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Centros
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-center-detail">
      <div className="mb-6">
        <Link href="/centers">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-to-centers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Centros
          </Button>
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{center.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{center.city}, {center.state}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant={center.status === 'active' ? 'default' : 'secondary'} className="text-sm">
            {center.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <p className="font-medium capitalize">{center.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dirección</p>
              <p className="font-medium">{center.address}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Documentos</p>
              <p className="font-medium">{centerDocuments.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Departamentos con Docs</p>
              <p className="font-medium">{documentsByDepartment.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="by-department" className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="by-department" data-testid="tab-by-department">Por Departamento</TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all-docs">Todos los Documentos</TabsTrigger>
          </TabsList>
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-add-document">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Documento
          </Button>
        </div>

        <TabsContent value="by-department" className="space-y-6">
          {documentsByDepartment.length > 0 ? (
            documentsByDepartment.map(({ department, documents }) => (
              <Card key={department.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {department.name}
                    <Badge variant="secondary" className="ml-2">{documents.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {documents.map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        department={department}
                        onViewHistory={() => setHistoryDocument(doc)}
                        onNewVersion={() => setVersionDocument(doc)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-muted-foreground">No hay documentos para este centro</p>
                <p className="text-sm text-muted-foreground mt-1">Agrega el primer documento para comenzar</p>
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Documento
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
                  Todos los Documentos
                  <Badge variant="secondary">{filteredDocuments.length}</Badge>
                </CardTitle>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48" data-testid="select-filter-department">
                    <SelectValue placeholder="Filtrar por departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredDocuments.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      department={getDepartment(doc.departmentId)}
                      onViewHistory={() => setHistoryDocument(doc)}
                      onNewVersion={() => setVersionDocument(doc)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay documentos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DocumentFormDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        centerId={centerId}
      />
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
