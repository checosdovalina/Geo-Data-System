import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, FolderOpen, FileText, Users, Scale, Calculator, Wrench, Shield, Settings, Pencil } from "lucide-react";
import type { Department } from "@shared/schema";

const departmentFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const iconMap: Record<string, React.ElementType> = {
  scale: Scale,
  calculator: Calculator,
  wrench: Wrench,
  shield: Shield,
  settings: Settings,
  users: Users,
  file: FileText,
  folder: FolderOpen,
};

const iconOptions = [
  { value: "scale", label: "Jurídico", Icon: Scale },
  { value: "calculator", label: "Fiscal", Icon: Calculator },
  { value: "wrench", label: "Mantenimiento", Icon: Wrench },
  { value: "shield", label: "Seguridad", Icon: Shield },
  { value: "settings", label: "Operaciones", Icon: Settings },
  { value: "users", label: "Administración", Icon: Users },
  { value: "file", label: "Documentos", Icon: FileText },
];

function DepartmentFormDialog({ 
  open, 
  onOpenChange,
  department,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}) {
  const { toast } = useToast();
  const isEditing = !!department;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
      icon: department?.icon || "folder",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DepartmentFormValues) => {
      return apiRequest("POST", "/api/departments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Departamento creado exitosamente" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al crear el departamento", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DepartmentFormValues) => {
      return apiRequest("PATCH", `/api/departments/${department!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Departamento actualizado exitosamente" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error al actualizar el departamento", variant: "destructive" });
    },
  });

  const onSubmit = (data: DepartmentFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Departamento' : 'Nuevo Departamento'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Jurídico" {...field} data-testid="input-department-name" />
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
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe las responsabilidades del departamento..." 
                      {...field} 
                      data-testid="textarea-department-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={field.value === option.value ? "default" : "outline"}
                        className="h-16 flex flex-col items-center justify-center gap-1"
                        onClick={() => field.onChange(option.value)}
                        data-testid={`icon-option-${option.value}`}
                      >
                        <option.Icon className="h-5 w-5" />
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-department">
                {isPending
                  ? (isEditing ? 'Guardando...' : 'Creando...')
                  : (isEditing ? 'Guardar Cambios' : 'Crear Departamento')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function DepartmentsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const { data: departments = [], isLoading } = useQuery<Department[]>({ 
    queryKey: ['/api/departments'] 
  });

  const getIcon = (iconName: string | null) => {
    const Icon = iconMap[iconName || 'folder'] || FolderOpen;
    return Icon;
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-departments">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Departamentos</h1>
          <p className="text-muted-foreground">Organiza la información por área funcional</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-new-department">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Departamento
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : departments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const Icon = getIcon(dept.icon);
            return (
              <Card key={dept.id} className="hover-elevate group relative" data-testid={`card-department-${dept.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => setEditingDepartment(dept)}
                  data-testid={`button-edit-department-${dept.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {dept.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Documentos
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium">No hay departamentos registrados</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primer departamento para organizar la información</p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Departamento
            </Button>
          </CardContent>
        </Card>
      )}

      <DepartmentFormDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />

      {editingDepartment && (
        <DepartmentFormDialog
          key={editingDepartment.id}
          open={!!editingDepartment}
          onOpenChange={(open) => { if (!open) setEditingDepartment(null); }}
          department={editingDepartment}
        />
      )}
    </div>
  );
}
