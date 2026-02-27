import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import type { Incident, Notification } from "@shared/schema";

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

function getUserInitials(fullName?: string): string {
  if (!fullName) return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "U";
}

function getAvatarColor(name?: string): string {
  if (!name) return "from-blue-500 to-cyan-500";
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-teal-500 to-emerald-500",
    "from-purple-500 to-indigo-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getRoleName(role?: string): string {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "admin": return "Administrador";
    case "auxiliar": return "Auxiliar";
    case "viewer": return "Lector";
    case "auditor": return "Auditor";
    default: return "";
  }
}

function getRoleBadgeStyle(role?: string): string {
  switch (role) {
    case "super_admin": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "admin": return "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800";
    case "auxiliar": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "viewer": return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
    case "auditor": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    default: return "";
  }
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: incidents = [] } = useQuery<Incident[]>({ queryKey: ['/api/incidents'] });
  const { data: notifications = [] } = useQuery<Notification[]>({ queryKey: ['/api/notifications'] });

  const pendingIncidents = incidents.filter(i => i.status === 'pending').length;
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

  const operationsItems = [
    { title: "Aprobaciones", url: "/approvals", icon: CheckCircle2, badge: 0 },
    { title: "Incidentes", url: "/incidents", icon: AlertTriangle, badge: pendingIncidents },
    { title: "Auditoría", url: "/audit", icon: ClipboardList, badge: 0 },
    { title: "Notificaciones", url: "/notifications", icon: Bell, badge: unreadNotifications },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 gradient-primary rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">GeoDoc Center</h1>
            <p className="text-xs text-muted-foreground">Gestión Documental</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider text-[0.65rem] font-semibold text-muted-foreground/70">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url || (item.url !== '/dashboard' && location.startsWith(item.url))}>
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
          <SidebarGroupLabel className="uppercase tracking-wider text-[0.65rem] font-semibold text-muted-foreground/70">Administración</SidebarGroupLabel>
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
          <SidebarGroupLabel className="uppercase tracking-wider text-[0.65rem] font-semibold text-muted-foreground/70">Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge > 0 && (
                        <Badge className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center px-1.5 bg-primary/90 text-primary-foreground shadow-sm">
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
          <div className={`h-10 w-10 bg-gradient-to-br ${getAvatarColor(user?.fullName)} rounded-full flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-semibold text-sm">{getUserInitials(user?.fullName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate" data-testid="text-current-user-name">
              {user?.fullName || "Usuario"}
            </p>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${getRoleBadgeStyle(user?.role)}`} data-testid="text-current-user-role">
              {getRoleName(user?.role)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout.mutate()}
            className="shrink-0 hover:text-destructive hover:bg-destructive/10 transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
