import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, AlertTriangle, Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import type { Center, Document, Incident, AuditLog } from "@shared/schema";

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`h-3 w-3 ${trend.positive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.positive ? '+' : ''}{trend.value}% este mes
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityItem({ log }: { log: AuditLog }) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'update': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'view': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'download': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Creó';
      case 'update': return 'Actualizó';
      case 'view': return 'Consultó';
      case 'download': return 'Descargó';
      case 'version': return 'Nueva versión';
      default: return action;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover-elevate">
      <div className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
        {getActionLabel(log.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{log.entityName || log.entityType}</p>
        <p className="text-xs text-muted-foreground">{log.userName}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        {log.createdAt ? new Date(log.createdAt).toLocaleDateString('es-MX') : ''}
      </div>
    </div>
  );
}

function IncidentItem({ incident }: { incident: Incident }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300">Pendiente</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300">Aprobado</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300">Rechazado</Badge>;
      case 'closed': return <Badge variant="secondary">Cerrado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-md hover-elevate">
      <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{incident.title}</p>
        <p className="text-xs text-muted-foreground">{incident.createdByName}</p>
      </div>
      {getStatusBadge(incident.status)}
    </div>
  );
}

export default function Dashboard() {
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });
  const { data: documents = [] } = useQuery<Document[]>({ queryKey: ['/api/documents'] });
  const { data: incidents = [] } = useQuery<Incident[]>({ queryKey: ['/api/incidents'] });
  const { data: recentLogs = [] } = useQuery<AuditLog[]>({ queryKey: ['/api/audit-logs?limit=10'] });

  const activeCenters = centers.filter(c => c.status === 'active').length;
  const pendingIncidents = incidents.filter(i => i.status === 'pending').length;

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema de gestión documental</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Centros Activos" 
          value={activeCenters}
          description={`de ${centers.length} centros totales`}
          icon={Building2}
          trend={{ value: 5, positive: true }}
        />
        <StatCard 
          title="Documentos" 
          value={documents.length}
          description="documentos registrados"
          icon={FileText}
          trend={{ value: 12, positive: true }}
        />
        <StatCard 
          title="Incidentes Pendientes" 
          value={pendingIncidents}
          description="requieren atención"
          icon={AlertTriangle}
        />
        <StatCard 
          title="Usuarios Activos" 
          value={15}
          description="en el sistema"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log) => (
                <RecentActivityItem key={log.id} log={log} />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Incidentes Recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {incidents.length > 0 ? (
              incidents.slice(0, 5).map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay incidentes pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
