import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, Building2, MapPin, Edit, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Center, InsertCenter } from "@shared/schema";

const centerFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.enum(["centro", "edificio", "planta", "sucursal"]),
  status: z.enum(["active", "inactive"]),
  state: z.string().min(2, "El estado es requerido"),
  city: z.string().min(2, "La ciudad es requerida"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type CenterFormValues = z.infer<typeof centerFormSchema>;

const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

function CenterFormDialog({ 
  open, 
  onOpenChange,
  center 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  center?: Center;
}) {
  const { toast } = useToast();
  const isEditing = !!center;

  const form = useForm<CenterFormValues>({
    resolver: zodResolver(centerFormSchema),
    defaultValues: center ? {
      name: center.name,
      type: center.type,
      status: center.status,
      state: center.state,
      city: center.city,
      address: center.address,
      latitude: center.latitude || "",
      longitude: center.longitude || "",
    } : {
      name: "",
      type: "centro",
      status: "active",
      state: "",
      city: "",
      address: "",
      latitude: "",
      longitude: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CenterFormValues) => {
      return apiRequest("POST", "/api/centers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/centers'] });
      toast({ title: "Centro creado exitosamente" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al crear el centro", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CenterFormValues) => {
      return apiRequest("PATCH", `/api/centers/${center?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/centers'] });
      toast({ title: "Centro actualizado exitosamente" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error al actualizar el centro", variant: "destructive" });
    },
  });

  const onSubmit = (data: CenterFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Centro' : 'Nuevo Centro'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre del Centro</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Centro Comercial Norte" {...field} data-testid="input-center-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-center-type">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="centro">Centro</SelectItem>
                        <SelectItem value="edificio">Edificio</SelectItem>
                        <SelectItem value="planta">Planta</SelectItem>
                        <SelectItem value="sucursal">Sucursal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estatus</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-center-status">
                          <SelectValue placeholder="Seleccionar estatus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-center-state">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mexicanStates.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Monterrey" {...field} data-testid="input-center-city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Av. Principal #123, Col. Centro" {...field} data-testid="input-center-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 25.6866" {...field} data-testid="input-center-latitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: -100.3161" {...field} data-testid="input-center-longitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-center"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 
                 isEditing ? 'Actualizar' : 'Crear Centro'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CentersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | undefined>();

  const { data: centers = [], isLoading } = useQuery<Center[]>({ 
    queryKey: ['/api/centers'] 
  });

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (center: Center) => {
    setEditingCenter(center);
    setDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCenter(undefined);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'centro': return 'Centro';
      case 'edificio': return 'Edificio';
      case 'planta': return 'Planta';
      case 'sucursal': return 'Sucursal';
      default: return type;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-centers">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Centros</h1>
          <p className="text-muted-foreground">Gestiona los centros y edificios del sistema</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-new-center">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Centro
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {filteredCenters.length} centros
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar centros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-centers"
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
          ) : filteredCenters.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCenters.map((center) => (
                    <TableRow key={center.id} data-testid={`row-center-${center.id}`}>
                      <TableCell className="font-medium">{center.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(center.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {center.city}, {center.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={center.status === 'active' ? 'default' : 'secondary'}>
                          {center.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/centers/${center.id}`}>
                            <Button variant="ghost" size="icon" data-testid={`button-view-center-${center.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(center)}
                            data-testid={`button-edit-center-${center.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No se encontraron centros</p>
              <p className="text-sm mt-1">Crea tu primer centro para comenzar</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Centro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CenterFormDialog 
        open={dialogOpen} 
        onOpenChange={handleCloseDialog}
        center={editingCenter}
      />
    </div>
  );
}
