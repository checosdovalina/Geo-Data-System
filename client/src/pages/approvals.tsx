import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle, Clock, FolderOpen, AlertTriangle } from "lucide-react";
import type { DocumentVersion, Document, Department } from "@shared/schema";

function RejectDialog({
  version,
  open,
  onOpenChange,
  onReject
}: {
  version: DocumentVersion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const handleReject = () => {
    if (reason.length >= 5) {
      onReject(reason);
      setReason("");
    }
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Rechazar Versión
          </DialogTitle>
          <DialogDescription>
            Indica el motivo del rechazo para que el usuario pueda corregir y volver a enviar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-muted">
            <p className="text-sm">
              <span className="text-muted-foreground">Versión:</span>{" "}
              <Badge variant="outline">v{version.version}</Badge>
            </p>
            <p className="text-sm mt-1 text-muted-foreground">{version.changeReason}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo del rechazo *</label>
            <Textarea
              placeholder="Describe por qué se rechaza esta versión..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24"
              data-testid="textarea-rejection-reason"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 5 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={reason.length < 5}
              data-testid="button-confirm-reject"
            >
              Rechazar Versión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VersionCard({
  version,
  document,
  department,
  status,
  onApprove,
  onReject,
  isApproving,
}: {
  version: DocumentVersion;
  document?: Document;
  department?: Department;
  status: 'pending' | 'approved' | 'rejected';
  onApprove?: () => void;
  onReject?: () => void;
  isApproving?: boolean;
}) {
  const statusConfig = {
    pending: { icon: Clock, color: "yellow", label: "Pendiente" },
    approved: { icon: CheckCircle2, color: "green", label: "Aprobada" },
    rejected: { icon: XCircle, color: "red", label: "Rechazada" },
  };

  const { icon: Icon, color, label } = statusConfig[status];

  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-md bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-medium truncate">{document?.name || "Documento"}</h4>
                <Badge variant="outline">v{version.version}</Badge>
                {status !== 'pending' && (
                  <Badge 
                    variant={status === 'approved' ? 'default' : 'destructive'}
                    className={status === 'approved' ? 'bg-green-600' : ''}
                  >
                    {label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{version.changeReason}</p>
              {status === 'rejected' && version.rejectionReason && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-2 mb-2">
                  <span className="font-medium">Motivo: </span>{version.rejectionReason}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                {department && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {department.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(version.uploadedAt).toLocaleDateString('es-MX')}
                </span>
                {status === 'approved' && version.approvedAt && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Aprobada: {new Date(version.approvedAt).toLocaleDateString('es-MX')}
                  </span>
                )}
              </div>
            </div>
          </div>
          {status === 'pending' && onApprove && onReject && (
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                variant="outline"
                size="sm"
                onClick={onReject}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                data-testid={`button-reject-${version.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rechazar
              </Button>
              <Button 
                size="sm"
                onClick={onApprove}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
                data-testid={`button-approve-${version.id}`}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {isApproving ? 'Aprobando...' : 'Aprobar'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [rejectingVersion, setRejectingVersion] = useState<DocumentVersion | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: pendingVersions = [], isLoading: pendingLoading } = useQuery<DocumentVersion[]>({
    queryKey: ['/api/pending-approvals'],
  });

  const { data: approvedVersions = [], isLoading: approvedLoading } = useQuery<DocumentVersion[]>({
    queryKey: ['/api/approved-versions'],
  });

  const { data: rejectedVersions = [], isLoading: rejectedLoading } = useQuery<DocumentVersion[]>({
    queryKey: ['/api/rejected-versions'],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const getDocument = (documentId: string) => documents.find(d => d.id === documentId);
  const getDepartment = (departmentId: string) => departments.find(d => d.id === departmentId);

  const filterByDepartment = (versions: DocumentVersion[]) => {
    if (selectedDepartment === "all") return versions;
    return versions.filter(v => {
      const doc = getDocument(v.documentId);
      return doc?.departmentId === selectedDepartment;
    });
  };

  const approveMutation = useMutation({
    mutationFn: async (versionId: string) => {
      setApprovingId(versionId);
      return apiRequest("POST", `/api/versions/${versionId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/approved-versions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Versión aprobada exitosamente" });
      setApprovingId(null);
    },
    onError: () => {
      toast({ title: "Error al aprobar la versión", variant: "destructive" });
      setApprovingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ versionId, reason }: { versionId: string; reason: string }) => {
      return apiRequest("POST", `/api/versions/${versionId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rejected-versions'] });
      toast({ title: "Versión rechazada" });
      setRejectingVersion(null);
    },
    onError: () => {
      toast({ title: "Error al rechazar la versión", variant: "destructive" });
    },
  });

  const handleReject = (reason: string) => {
    if (rejectingVersion) {
      rejectMutation.mutate({ versionId: rejectingVersion.id, reason });
    }
  };

  const renderVersionList = (
    versions: DocumentVersion[], 
    status: 'pending' | 'approved' | 'rejected', 
    isLoading: boolean,
    emptyIcon: React.ReactNode,
    emptyTitle: string,
    emptyDesc: string
  ) => {
    const filteredVersions = filterByDepartment(versions);

    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      );
    }

    if (filteredVersions.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            {emptyIcon}
            <p className="font-medium text-muted-foreground">{emptyTitle}</p>
            <p className="text-sm text-muted-foreground mt-1">{emptyDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {filteredVersions.map(version => {
          const doc = getDocument(version.documentId);
          const dept = doc ? getDepartment(doc.departmentId) : undefined;
          return (
            <VersionCard
              key={version.id}
              version={version}
              document={doc}
              department={dept}
              status={status}
              onApprove={status === 'pending' ? () => approveMutation.mutate(version.id) : undefined}
              onReject={status === 'pending' ? () => setRejectingVersion(version) : undefined}
              isApproving={approvingId === version.id}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-approvals">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Aprobaciones</h1>
          <p className="text-muted-foreground">Revisa y gestiona las versiones de documentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            {pendingVersions.length} pendientes
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {approvedVersions.length} aprobadas
          </Badge>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <XCircle className="h-3 w-3 mr-1" />
            {rejectedVersions.length} rechazadas
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-64" data-testid="select-filter-department">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="pending" className="flex items-center gap-2" data-testid="tab-pending">
            <Clock className="h-4 w-4" />
            Pendientes
            {pendingVersions.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingVersions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2" data-testid="tab-approved">
            <CheckCircle2 className="h-4 w-4" />
            Aprobadas
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2" data-testid="tab-rejected">
            <XCircle className="h-4 w-4" />
            Rechazadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {renderVersionList(
            pendingVersions,
            'pending',
            pendingLoading,
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-500 opacity-50" />,
            "No hay versiones pendientes de aprobación",
            "Todas las versiones han sido revisadas"
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {renderVersionList(
            approvedVersions,
            'approved',
            approvedLoading,
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />,
            "No hay versiones aprobadas",
            "Las versiones aprobadas aparecerán aquí"
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {renderVersionList(
            rejectedVersions,
            'rejected',
            rejectedLoading,
            <XCircle className="h-12 w-12 mx-auto mb-3 text-red-500 opacity-50" />,
            "No hay versiones rechazadas",
            "Las versiones rechazadas aparecerán aquí"
          )}
        </TabsContent>
      </Tabs>

      <RejectDialog
        version={rejectingVersion}
        open={!!rejectingVersion}
        onOpenChange={(open) => !open && setRejectingVersion(null)}
        onReject={handleReject}
      />
    </div>
  );
}
