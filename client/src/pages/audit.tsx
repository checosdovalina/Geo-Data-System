import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ClipboardList, Download, Filter, Eye, Edit2, Plus, FileText, Building2, Users } from "lucide-react";
import type { AuditLog } from "@shared/schema";

const actionLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  create: { label: "Crear", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: Plus },
  update: { label: "Actualizar", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Edit2 },
  view: { label: "Consultar", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Eye },
  download: { label: "Descargar", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", icon: Download },
  version: { label: "Nueva Versión", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", icon: FileText },
};

const entityLabels: Record<string, { label: string; icon: React.ElementType }> = {
  center: { label: "Centro", icon: Building2 },
  document: { label: "Documento", icon: FileText },
  user: { label: "Usuario", icon: Users },
  incident: { label: "Incidente", icon: ClipboardList },
};

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({ 
    queryKey: ['/api/audit-logs'] 
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const handleExport = () => {
    const csv = [
      ['Fecha', 'Usuario', 'Acción', 'Tipo', 'Entidad', 'Detalles', 'IP'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleString('es-MX'),
        log.userName || '',
        log.action,
        log.entityType,
        log.entityName || '',
        log.details || '',
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-audit">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Auditoría</h1>
          <p className="text-muted-foreground">Registro completo de accesos, cambios y consultas</p>
        </div>
        <Button variant="outline" onClick={handleExport} data-testid="button-export-logs">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </div>
              <ClipboardList className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{auditLogs.filter(l => l.action === 'create').length}</p>
                <p className="text-xs text-muted-foreground">Creaciones</p>
              </div>
              <Plus className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{auditLogs.filter(l => l.action === 'view').length}</p>
                <p className="text-xs text-muted-foreground">Consultas</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{auditLogs.filter(l => l.action === 'update').length}</p>
                <p className="text-xs text-muted-foreground">Actualizaciones</p>
              </div>
              <Edit2 className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Registros de Auditoría
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40" data-testid="select-action-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  {Object.entries(actionLabels).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-40" data-testid="select-entity-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(entityLabels).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-logs"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Entidad</TableHead>
                      <TableHead>Detalles</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const actionInfo = actionLabels[log.action] || { label: log.action, color: "bg-gray-100 text-gray-700", icon: ClipboardList };
                      const entityInfo = entityLabels[log.entityType] || { label: log.entityType, icon: FileText };
                      const ActionIcon = actionInfo.icon;
                      const EntityIcon = entityInfo.icon;

                      return (
                        <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('es-MX', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="font-medium">{log.userName || 'Sistema'}</TableCell>
                          <TableCell>
                            <Badge className={actionInfo.color}>
                              <ActionIcon className="h-3 w-3 mr-1" />
                              {actionInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <EntityIcon className="h-3 w-3" />
                              {entityInfo.label}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-40 truncate">{log.entityName || '-'}</TableCell>
                          <TableCell className="max-w-48 truncate text-muted-foreground text-sm">
                            {log.details || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {log.ipAddress || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No se encontraron registros</p>
              <p className="text-sm mt-1">Ajusta los filtros para ver más resultados</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Información de Auditoría</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Los registros de auditoría son inmutables y no pueden ser eliminados.</p>
          <p>Cada acción en el sistema (crear, actualizar, consultar, descargar) queda registrada con:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Usuario que realizó la acción</li>
            <li>Fecha y hora exacta</li>
            <li>Tipo de acción y entidad afectada</li>
            <li>Dirección IP de origen</li>
            <li>Detalles adicionales del cambio</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
