import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Plus, Shield, Eye, Edit2 } from "lucide-react";
import type { User, Department } from "@shared/schema";

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  admin: { label: "Admin / Gerente", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  auxiliar: { label: "Auxiliar", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  viewer: { label: "Vista", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  auditor: { label: "Auditor", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
};

const roleDescriptions: Record<string, string> = {
  super_admin: "Configuración global del sistema",
  admin: "CRUD + aprobaciones por departamento",
  auxiliar: "CRUD sin eliminar",
  viewer: "Ver / descargar únicamente",
  auditor: "Solo lectura + logs de auditoría",
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'] 
  });

  const { data: departments = [] } = useQuery<Department[]>({ 
    queryKey: ['/api/departments'] 
  });

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return "Sin asignar";
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || "Sin asignar";
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-users">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios y sus roles en el sistema</p>
        </div>
        <Button data-testid="button-new-user">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5 mb-6">
        {Object.entries(roleLabels).map(([role, { label, color }]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <Card key={role} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                  <Badge className={color}>{label.split(' ')[0]}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {filteredUsers.length} usuarios
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-users"
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
          ) : filteredUsers.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleInfo = roleLabels[user.role] || roleLabels.viewer;
                    return (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getDepartmentName(user.departmentId)}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-muted-foreground max-w-48">
                            {roleDescriptions[user.role] || "Permisos básicos"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" data-testid={`button-view-user-${user.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-edit-user-${user.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No se encontraron usuarios</p>
              <p className="text-sm mt-1">Crea usuarios para gestionar el sistema</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Matriz de Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Ver</TableHead>
                  <TableHead className="text-center">Crear</TableHead>
                  <TableHead className="text-center">Editar</TableHead>
                  <TableHead className="text-center">Aprobar</TableHead>
                  <TableHead className="text-center">Auditar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Super Admin</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Admin / Gerente</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Auxiliar</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Vista</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Auditor</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-muted-foreground">-</TableCell>
                  <TableCell className="text-center text-green-600">✓</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
