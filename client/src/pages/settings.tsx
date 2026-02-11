import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Settings, HardDrive, Cloud, Save, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import type { SystemSetting } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings = [], isLoading } = useQuery<SystemSetting[]>({ queryKey: ['/api/settings'] });

  const getSetting = (key: string): string => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || "";
  };

  const [storageMode, setStorageMode] = useState("local");
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState("");
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(false);

  useEffect(() => {
    if (settings.length > 0) {
      setStorageMode(getSetting("storage_mode") || "local");
      setGoogleDriveFolderId(getSetting("google_drive_folder_id") || "");
      setGoogleDriveEnabled(getSetting("google_drive_enabled") === "true");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      return apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  const handleSaveStorageSettings = async () => {
    try {
      await saveMutation.mutateAsync({ key: "storage_mode", value: storageMode });
      await saveMutation.mutateAsync({ key: "google_drive_enabled", value: googleDriveEnabled.toString() });
      if (googleDriveFolderId) {
        await saveMutation.mutateAsync({ key: "google_drive_folder_id", value: googleDriveFolderId });
      }
      toast({ title: "Configuración de almacenamiento guardada" });
    } catch {
      toast({ title: "Error al guardar configuración", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="page-settings">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground mt-1">Administra las configuraciones generales del sistema</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Almacenamiento de Documentos
            </CardTitle>
            <CardDescription>
              Configura dónde se almacenarán los documentos subidos al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div 
                className={`p-4 rounded-md border-2 cursor-pointer transition-colors ${storageMode === 'local' ? 'border-primary bg-primary/5' : 'border-transparent hover-elevate'}`}
                onClick={() => setStorageMode('local')}
                data-testid="option-storage-local"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Almacenamiento Local (App Storage)</p>
                      <p className="text-sm text-muted-foreground">Los archivos se guardan en el almacenamiento integrado de la aplicación</p>
                    </div>
                  </div>
                  {storageMode === 'local' && <Badge>Activo</Badge>}
                </div>
              </div>

              <div 
                className={`p-4 rounded-md border-2 cursor-pointer transition-colors ${storageMode === 'google_drive' ? 'border-primary bg-primary/5' : 'border-transparent hover-elevate'}`}
                onClick={() => setStorageMode('google_drive')}
                data-testid="option-storage-google-drive"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Google Drive</p>
                      <p className="text-sm text-muted-foreground">Los archivos se sincronizan con tu cuenta de Google Drive</p>
                    </div>
                  </div>
                  {storageMode === 'google_drive' && <Badge>Activo</Badge>}
                </div>
              </div>
            </div>

            {storageMode === 'google_drive' && (
              <div className="space-y-4 p-4 rounded-md bg-muted">
                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-300">Configuración de Google Drive</p>
                    <p className="text-muted-foreground mt-1">
                      Para conectar Google Drive, necesitas configurar la conexión desde el panel de integraciones. 
                      Una vez conectado, los documentos se sincronizarán automáticamente con la carpeta especificada.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-sm font-medium">Habilitar Google Drive</label>
                    <p className="text-xs text-muted-foreground">Activar la sincronización con Google Drive</p>
                  </div>
                  <Switch 
                    checked={googleDriveEnabled}
                    onCheckedChange={setGoogleDriveEnabled}
                    data-testid="switch-google-drive-enabled"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ID de Carpeta en Google Drive</label>
                  <Input
                    placeholder="Ej: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    value={googleDriveFolderId}
                    onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                    data-testid="input-google-drive-folder-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes encontrar el ID de la carpeta en la URL de Google Drive
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSaveStorageSettings}
                disabled={saveMutation.isPending}
                data-testid="button-save-storage-settings"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Versión</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Idioma</p>
                <p className="font-medium">Español (es-MX)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Formato de Fecha</p>
                <p className="font-medium">DD/MM/AAAA</p>
              </div>
              <div>
                <p className="text-muted-foreground">Zona Horaria</p>
                <p className="font-medium">America/Mexico_City</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
