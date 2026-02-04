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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, AlertTriangle, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import type { Incident, Center } from "@shared/schema";

const incidentFormSchema = z.object({
  type: z.enum(["approval_request", "document_observed", "missing_info", "sensitive_change"]),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  centerId: z.string().optional(),
  documentId: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

const incidentTypeLabels: Record<string, { label: string; color: string }> = {
  approval_request: { label: "Solicitud de Aprobación", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  document_observed: { label: "Documento Observado", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  missing_info: { label: "Falta de Información", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  sensitive_change: { label: "Cambio Sensible", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

const statusLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  approved: { label: "Aprobado", icon: CheckCircle2, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  rejected: { label: "Rechazado", icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  closed: { label: "Cerrado", icon: CheckCircle2, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

function IncidentFormDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      type: "approval_request",
      title: "",
      description: "",
      centerId: "",
      documentId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: IncidentFormValues) => {
      return apiRequest("POST", "/api/incidents", {
        ...data,
        createdByName: "Admin Usuario",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      toast({ title: "Incidente creado exitosamente" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al crear el incidente", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Incidente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Incidente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-incident-type">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(incidentTypeLabels).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Revisión de contrato vencido" {...field} data-testid="input-incident-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el incidente en detalle..." 
                      className="min-h-24"
                      {...field} 
                      data-testid="textarea-incident-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="centerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro Relacionado (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-incident-center">
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-incident">
                {createMutation.isPending ? 'Creando...' : 'Crear Incidente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function IncidentDetailDialog({
  incident,
  open,
  onOpenChange
}: {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [resolution, setResolution] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/incidents/${incident?.id}`, {
        status,
        resolutionComment: resolution,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      toast({ title: "Incidente actualizado" });
      onOpenChange(false);
      setResolution("");
    },
    onError: () => {
      toast({ title: "Error al actualizar el incidente", variant: "destructive" });
    },
  });

  if (!incident) return null;

  const typeInfo = incidentTypeLabels[incident.type] || incidentTypeLabels.approval_request;
  const statusInfo = statusLabels[incident.status] || statusLabels.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detalle del Incidente
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-lg">{incident.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">{incident.createdByName || "Sistema"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {new Date(incident.createdAt).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>

          {incident.status === 'pending' && (
            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Comentario de Resolución</label>
                <Textarea
                  placeholder="Agrega un comentario para la resolución..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  data-testid="textarea-resolution"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => updateMutation.mutate("rejected")}
                  disabled={updateMutation.isPending}
                  data-testid="button-reject-incident"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button 
                  onClick={() => updateMutation.mutate("approved")}
                  disabled={updateMutation.isPending}
                  data-testid="button-approve-incident"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
              </div>
            </div>
          )}

          {incident.resolutionComment && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Comentario de Resolución</p>
              <p className="text-sm mt-1">{incident.resolutionComment}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: incidents = [], isLoading } = useQuery<Incident[]>({ 
    queryKey: ['/api/incidents'] 
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || incident.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const pendingCount = incidents.filter(i => i.status === 'pending').length;
  const approvedCount = incidents.filter(i => i.status === 'approved').length;
  const rejectedCount = incidents.filter(i => i.status === 'rejected').length;

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-incidents">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Incidentes y Aprobaciones</h1>
          <p className="text-muted-foreground">Gestiona solicitudes, observaciones y cambios sensibles</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-new-incident">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Incidente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Aprobados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rechazados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all">Todos ({incidents.length})</TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">Pendientes ({pendingCount})</TabsTrigger>
                <TabsTrigger value="approved" data-testid="tab-approved">Aprobados</TabsTrigger>
                <TabsTrigger value="rejected" data-testid="tab-rejected">Rechazados</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar incidentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-incidents"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredIncidents.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredIncidents.map((incident) => {
                  const typeInfo = incidentTypeLabels[incident.type] || incidentTypeLabels.approval_request;
                  const statusInfo = statusLabels[incident.status] || statusLabels.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div 
                      key={incident.id} 
                      className="p-4 rounded-md border hover-elevate cursor-pointer"
                      onClick={() => setSelectedIncident(incident)}
                      data-testid={`incident-card-${incident.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeInfo.color} variant="outline">{typeInfo.label}</Badge>
                            <Badge className={statusInfo.color} variant="outline">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{incident.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {incident.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {new Date(incident.createdAt).toLocaleDateString('es-MX')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {incident.createdByName}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No se encontraron incidentes</p>
              <p className="text-sm mt-1">
                {activeTab !== 'all' ? 'Cambia el filtro o ' : ''}crea un nuevo incidente
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Incidente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <IncidentFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <IncidentDetailDialog 
        incident={selectedIncident} 
        open={!!selectedIncident} 
        onOpenChange={(open) => !open && setSelectedIncident(null)}
      />
    </div>
  );
}
