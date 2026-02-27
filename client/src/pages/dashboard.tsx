import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, AlertTriangle, Users, TrendingUp, Clock, CheckCircle2, CalendarClock } from "lucide-react";
import type { Center, Document, Incident, AuditLog } from "@shared/schema";

type ExpiringDocument = Document & {
  centerName: string;
  departmentName: string;
  daysLeft: number | null;
  urgency: 'expired' | 'critical' | 'urgent' | 'warning' | 'none';
};

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  gradient,
  iconColor,
  iconBg,
  onDoubleClick,
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  gradient?: string;
  iconColor?: string;
  iconBg?: string;
  onDoubleClick?: () => void;
}) {
  return (
    <Card
      className={`hover-elevate transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${gradient || ''} ${onDoubleClick ? 'cursor-pointer' : ''}`}
      onDoubleClick={onDoubleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-12 w-12 rounded-md flex items-center justify-center ${iconBg || 'bg-primary/10'}`}>
          <Icon className={`h-5 w-5 ${iconColor || 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
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

function RecentActivityItem({ log, onDoubleClick }: { log: AuditLog; onDoubleClick: () => void }) {
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
      case 'login': return 'Sesión';
      case 'approve': return 'Aprobó';
      case 'reject': return 'Rechazó';
      case 'list': return 'Listó';
      default: return action;
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-md hover-elevate cursor-pointer select-none"
      onDoubleClick={onDoubleClick}
      data-testid={`activity-item-${log.id}`}
    >
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

function ExpiringDocumentItem({ doc, onDoubleClick }: { doc: ExpiringDocument; onDoubleClick: () => void }) {
  const getUrgencyBadge = () => {
    switch (doc.urgency) {
      case 'expired': return <Badge variant="destructive">Vencido</Badge>;
      case 'critical': return <Badge variant="destructive" className="bg-red-600">Crítico</Badge>;
      case 'urgent': return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300">Urgente</Badge>;
      case 'warning': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300">Advertencia</Badge>;
      default: return null;
    }
  };

  const daysText = doc.daysLeft !== null
    ? doc.daysLeft <= 0
      ? `Venció hace ${Math.abs(doc.daysLeft)} día(s)`
      : `Vence en ${doc.daysLeft} día(s)`
    : '';

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer select-none"
      onDoubleClick={onDoubleClick}
      data-testid={`expiring-doc-${doc.id}`}
    >
      <CalendarClock className={`h-4 w-4 shrink-0 ${doc.urgency === 'expired' || doc.urgency === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">{doc.centerName} · {daysText}</p>
      </div>
      {getUrgencyBadge()}
    </div>
  );
}

function IncidentItem({ incident, onDoubleClick }: { incident: Incident; onDoubleClick: () => void }) {
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
    <div
      className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer select-none"
      onDoubleClick={onDoubleClick}
      data-testid={`incident-item-${incident.id}`}
    >
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
  const [, navigate] = useLocation();
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });
  const { data: documents = [] } = useQuery<Document[]>({ queryKey: ['/api/documents'] });
  const { data: incidents = [] } = useQuery<Incident[]>({ queryKey: ['/api/incidents'] });
  const { data: recentLogs = [] } = useQuery<AuditLog[]>({ queryKey: ['/api/audit-logs?limit=10'] });
  const { data: expiringDocs = [] } = useQuery<ExpiringDocument[]>({ queryKey: ['/api/documents/expiring'] });

  const activeCenters = centers.filter(c => c.status === 'active').length;
  const pendingIncidents = incidents.filter(i => i.status === 'pending').length;

  const getActivityRoute = (log: AuditLog) => {
    switch (log.entityType) {
      case 'center': return log.entityId ? `/centers/${log.entityId}` : '/centers';
      case 'document':
      case 'document_version': return '/documents';
      case 'user': return '/users';
      case 'incident': return '/incidents';
      default: return '/audit';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-dashboard">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Bienvenido de nuevo</p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {(() => {
            const dateStr = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
          })()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Centros Activos" 
          value={activeCenters}
          description={`de ${centers.length} centros totales`}
          icon={Building2}
          trend={{ value: 5, positive: true }}
          gradient="stat-gradient-blue"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          onDoubleClick={() => navigate('/centers')}
        />
        <StatCard 
          title="Documentos" 
          value={documents.length}
          description="documentos registrados"
          icon={FileText}
          trend={{ value: 12, positive: true }}
          gradient="stat-gradient-teal"
          iconColor="text-teal-600 dark:text-teal-400"
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          onDoubleClick={() => navigate('/documents')}
        />
        <StatCard 
          title="Incidentes Pendientes" 
          value={pendingIncidents}
          description="requieren atención"
          icon={AlertTriangle}
          gradient="stat-gradient-amber"
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          onDoubleClick={() => navigate('/incidents')}
        />
        <StatCard 
          title="Usuarios Activos" 
          value={15}
          description="en el sistema"
          icon={Users}
          gradient="stat-gradient-purple"
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          onDoubleClick={() => navigate('/users')}
        />
      </div>

      {expiringDocs.length > 0 && (
        <Card className="mb-6 border-orange-200 dark:border-orange-800 border-l-4 border-l-orange-400 dark:border-l-orange-500">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <CalendarClock className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-base">Documentos Próximos a Vencer</CardTitle>
            <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300" data-testid="badge-expiring-count">
              {expiringDocs.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            {expiringDocs.slice(0, 8).map((doc) => (
              <ExpiringDocumentItem
                key={doc.id}
                doc={doc}
                onDoubleClick={() => navigate(`/centers/${doc.centerId}`)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log) => (
                <RecentActivityItem
                  key={log.id}
                  log={log}
                  onDoubleClick={() => navigate(getActivityRoute(log))}
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Incidentes Recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {incidents.length > 0 ? (
              incidents.slice(0, 5).map((incident) => (
                <IncidentItem
                  key={incident.id}
                  incident={incident}
                  onDoubleClick={() => navigate('/incidents')}
                />
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
