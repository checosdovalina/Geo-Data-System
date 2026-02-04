import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Users, Plus, Shield, Edit2, UserCheck, UserX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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

interface UserFormData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: "super_admin" | "admin" | "auxiliar" | "viewer" | "auditor";
  departmentId: string | null;
}

const initialFormData: UserFormData = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  role: "viewer",
  departmentId: null,
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'] 
  });

  const { data: departments = [] } = useQuery<Department[]>({ 
    queryKey: ['/api/departments'] 
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData & { isActive: boolean }> }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData(initialFormData);
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, { isActive });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: variables.isActive ? "Usuario activado" : "Usuario desactivado",
        description: `El usuario ha sido ${variables.isActive ? "activado" : "desactivado"} exitosamente`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      });
    },
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

  const handleCreateUser = () => {
    setFormData(initialFormData);
    setIsCreateDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      fullName: user.fullName,
      email: user.email,
      role: user.role as UserFormData["role"],
      departmentId: user.departmentId,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.fullName || !formData.email) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const updateData: Partial<UserFormData> = {
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      departmentId: formData.departmentId,
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    updateMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleToggleStatus = (user: User) => {
    toggleStatusMutation.mutate({ id: user.id, isActive: !user.isActive });
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-users">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios y sus roles en el sistema</p>
        </div>
        <Button onClick={handleCreateUser} data-testid="button-new-user">
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
                <div className="flex items-center justify-between gap-2">
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
                    <TableHead>Estado</TableHead>
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
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleStatus(user)}
                              disabled={toggleStatusMutation.isPending}
                              data-testid={`switch-status-${user.id}`}
                            />
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
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
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Admin / Gerente</TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Auxiliar</TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Vista</TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Auditor</TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserX className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><UserCheck className="h-4 w-4 mx-auto text-green-600" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez García"
                data-testid="input-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan.perez@empresa.com"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="juan.perez"
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
                data-testid="input-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserFormData["role"]) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin / Gerente</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                  <SelectItem value="viewer">Vista</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={formData.departmentId || "none"}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value === "none" ? null : value })}
              >
                <SelectTrigger data-testid="select-department">
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Nombre completo *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                data-testid="input-edit-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo electrónico *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-edit-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Usuario *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                data-testid="input-edit-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva contraseña (dejar vacío para mantener)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
                data-testid="input-edit-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserFormData["role"]) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger data-testid="select-edit-role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin / Gerente</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                  <SelectItem value="viewer">Vista</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Departamento</Label>
              <Select
                value={formData.departmentId || "none"}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value === "none" ? null : value })}
              >
                <SelectTrigger data-testid="select-edit-department">
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
