import { Link, useLocation } from "wouter";
import {
  Building2,
  Map,
  FileText,
  Users,
  ClipboardList,
  AlertTriangle,
  Bell,
  LayoutDashboard,
  FolderOpen,
  CheckCircle2,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mapa de México", url: "/map", icon: Map },
  { title: "Centros", url: "/centers", icon: Building2 },
  { title: "Documentos", url: "/documents", icon: FileText },
];

const managementItems = [
  { title: "Departamentos", url: "/departments", icon: FolderOpen },
  { title: "Usuarios", url: "/users", icon: Users },
];

const operationsItems = [
  { title: "Aprobaciones", url: "/approvals", icon: CheckCircle2 },
  { title: "Incidentes", url: "/incidents", icon: AlertTriangle, badge: 3 },
  { title: "Auditoría", url: "/audit", icon: ClipboardList },
  { title: "Notificaciones", url: "/notifications", icon: Bell, badge: 5 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">GeoDoc Center</h1>
            <p className="text-xs text-muted-foreground">Gestión Documental</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.replace('/', '') || 'dashboard'}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location === "/settings"}>
              <Link href="/settings" data-testid="nav-settings">
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-current-user-name">
              {user?.fullName || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-current-user-role">
              {user?.role === "super_admin" ? "Super Admin" :
               user?.role === "admin" ? "Administrador" :
               user?.role === "auxiliar" ? "Auxiliar" :
               user?.role === "viewer" ? "Lector" :
               user?.role === "auditor" ? "Auditor" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout.mutate()}
            className="shrink-0"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
