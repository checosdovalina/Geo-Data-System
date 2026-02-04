import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bell, CheckCheck, FileText, AlertTriangle, Clock, Trash2 } from "lucide-react";
import type { Notification } from "@shared/schema";

const notificationTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  new_version: { label: "Nueva Versión", icon: FileText, color: "text-blue-500" },
  incident_created: { label: "Incidente Creado", icon: AlertTriangle, color: "text-yellow-500" },
  incident_resolved: { label: "Incidente Resuelto", icon: CheckCheck, color: "text-green-500" },
};

export default function NotificationsPage() {
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({ 
    queryKey: ['/api/notifications'] 
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/notifications/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({ title: "Todas las notificaciones marcadas como leídas" });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays} días`;
    return new Date(date).toLocaleDateString('es-MX');
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-notifications">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
              : 'Todas las notificaciones están al día'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Todas las Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {notifications.map((notification) => {
                      const typeInfo = notificationTypeLabels[notification.type] || 
                        { label: notification.type, icon: Bell, color: "text-muted-foreground" };
                      const TypeIcon = typeInfo.icon;

                      return (
                        <div 
                          key={notification.id} 
                          className={`p-4 rounded-md border hover-elevate cursor-pointer transition-colors ${
                            !notification.read ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                          onClick={() => !notification.read && markAsReadMutation.mutate(notification.id)}
                          data-testid={`notification-${notification.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center ${typeInfo.color}`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{notification.title}</h3>
                                {!notification.read && (
                                  <Badge variant="default" className="text-xs">Nueva</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(notification.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No hay notificaciones</p>
                  <p className="text-sm mt-1">Recibirás notificaciones cuando ocurran eventos importantes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <Badge variant="outline">{notifications.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sin leer</span>
                <Badge variant="default">{unreadCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Leídas</span>
                <Badge variant="secondary">{notifications.length - unreadCount}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tipos de Notificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(notificationTypeLabels).map(([type, { label, icon: Icon, color }]) => {
                const count = notifications.filter(n => n.type === type).length;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{label}</p>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Las notificaciones te mantienen informado sobre:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Nuevas versiones de documentos</li>
                <li>Incidentes creados que requieren tu atención</li>
                <li>Resolución de incidentes que creaste</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
