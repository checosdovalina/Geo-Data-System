import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MexicoMap from "@/pages/mexico-map";
import CentersPage from "@/pages/centers";
import CenterDetailPage from "@/pages/center-detail";
import DocumentsPage from "@/pages/documents";
import ApprovalsPage from "@/pages/approvals";
import DepartmentsPage from "@/pages/departments";
import UsersPage from "@/pages/users";
import IncidentsPage from "@/pages/incidents";
import AuditPage from "@/pages/audit";
import NotificationsPage from "@/pages/notifications";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/map" component={MexicoMap} />
      <Route path="/centers" component={CentersPage} />
      <Route path="/centers/:id" component={CenterDetailPage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/approvals" component={ApprovalsPage} />
      <Route path="/departments" component={DepartmentsPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/incidents" component={IncidentsPage} />
      <Route path="/audit" component={AuditPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-3 border-b shrink-0 sticky top-0 bg-background z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">
            <AppRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function RootRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route>
        <AppLayout />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="geodoc-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RootRouter />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
