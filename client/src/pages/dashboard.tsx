import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, AlertTriangle, Users, TrendingUp, Clock, CheckCircle2, CalendarClock, Activity } from "lucide-react";
import type { Center, Document, Incident, AuditLog } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

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
  delay,
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
  delay?: number;
}) {
  return (
    <Card
      className={`hover-elevate transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${gradient || ''} ${onDoubleClick ? 'cursor-pointer' : ''} animate-scale-in group`}
      style={{ animationDelay: `${(delay || 0) * 0.1}s`, opacity: 0 }}
      onDoubleClick={onDoubleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconBg || 'bg-primary/10'} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon className={`h-6 w-6 ${iconColor || 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`h-3 w-3 ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend.positive ? '+' : ''}{trend.value}% este mes
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityItem({ log, onDoubleClick }: { log: AuditLog; onDoubleClick: () => void }) {
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'create': return { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' };
      case 'update': return { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' };
      case 'view': return { bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300', dot: 'bg-gray-400' };
      case 'download': return { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500' };
      case 'approve': return { bg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', dot: 'bg-teal-500' };
      case 'reject': return { bg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', dot: 'bg-red-500' };
      default: return { bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300', dot: 'bg-gray-400' };
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

  const style = getActionStyle(log.action);

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg hover-elevate cursor-pointer select-none transition-all duration-200"
      onDoubleClick={onDoubleClick}
      data-testid={`activity-item-${log.id}`}
    >
      <div className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium ${style.bg}`}>
        {getActionLabel(log.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{log.entityName || log.entityType}</p>
        <p className="text-xs text-muted-foreground">{log.userName}</p>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {log.createdAt ? new Date(log.createdAt).toLocaleDateString('es-MX') : ''}
      </div>
    </div>
  );
}

function ExpiringDocumentItem({ doc, onDoubleClick }: { doc: ExpiringDocument; onDoubleClick: () => void }) {
  const getUrgencyBadge = () => {
    switch (doc.urgency) {
      case 'expired': return <Badge variant="destructive" className="shadow-sm">Vencido</Badge>;
      case 'critical': return <Badge variant="destructive" className="bg-red-600 shadow-sm">Crítico</Badge>;
      case 'urgent': return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 shadow-sm">Urgente</Badge>;
      case 'warning': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 shadow-sm">Advertencia</Badge>;
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
      className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer select-none transition-all duration-200"
      onDoubleClick={onDoubleClick}
      data-testid={`expiring-doc-${doc.id}`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${doc.urgency === 'expired' || doc.urgency === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
        <CalendarClock className={`h-4 w-4 ${doc.urgency === 'expired' || doc.urgency === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
      </div>
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
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 shadow-sm">Pendiente</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm">Aprobado</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 shadow-sm">Rechazado</Badge>;
      case 'closed': return <Badge variant="secondary" className="shadow-sm">Cerrado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer select-none transition-all duration-200"
      onDoubleClick={onDoubleClick}
      data-testid={`incident-item-${incident.id}`}
    >
      <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      </div>
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
  const { user } = useAuth();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const firstName = user?.fullName?.split(' ')[0] || "Usuario";

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-dashboard">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground mb-0.5">{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {(() => {
                const dateStr = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
              })()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1 text-emerald-500" />
              Sistema activo
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
          delay={1}
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
          delay={2}
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
          delay={3}
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
          delay={4}
        />
      </div>

      {expiringDocs.length > 0 && (
        <Card className="mb-8 border-orange-200/80 dark:border-orange-800/60 border-l-4 border-l-orange-500 dark:border-l-orange-400 shadow-sm animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <CalendarClock className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-base">Documentos Próximos a Vencer</CardTitle>
            <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 font-semibold" data-testid="badge-expiring-count">
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
        <Card className="animate-slide-up shadow-sm" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
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

        <Card className="animate-slide-up shadow-sm" style={{ animationDelay: "0.5s", opacity: 0 }}>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
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
