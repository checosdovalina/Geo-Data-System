import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Building2,
  FileText,
  Shield,
  Map,
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Cloud,
  Lock,
  BarChart3,
  Layers,
  Settings,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Gestión de Centros",
    description: "Administra hasta 190+ centros y edificios con información detallada de ubicación, tipo y estado operativo.",
  },
  {
    icon: FileText,
    title: "Control Documental",
    description: "Versionado completo de documentos sin eliminación física. Cada cambio queda registrado con trazabilidad total.",
  },
  {
    icon: Map,
    title: "Visualización Geográfica",
    description: "Mapa interactivo de México para localizar centros, analizar distribución y tomar decisiones estratégicas.",
  },
  {
    icon: Shield,
    title: "Roles y Permisos",
    description: "5 niveles de acceso configurables: Super Admin, Gerente, Auxiliar, Viewer y Auditor para máxima seguridad.",
  },
  {
    icon: CheckCircle2,
    title: "Flujo de Aprobación",
    description: "Workflow de aprobación documental con estados pendiente, aprobado y rechazado. Control total del ciclo de vida.",
  },
  {
    icon: ClipboardList,
    title: "Auditoría Completa",
    description: "Registro inmutable de todas las acciones: quién hizo qué, cuándo y desde dónde. Exportable a CSV.",
  },
  {
    icon: AlertTriangle,
    title: "Gestión de Incidentes",
    description: "Workflow para reportar y resolver incidencias: documentos faltantes, cambios sensibles y solicitudes.",
  },
  {
    icon: Cloud,
    title: "Almacenamiento Seguro",
    description: "Sube archivos desde tu computadora con almacenamiento en la nube. Opción de integración con Google Drive.",
  },
  {
    icon: Layers,
    title: "7 Departamentos",
    description: "Organización por departamentos especializados para clasificar y gestionar documentación de forma estructurada.",
  },
];

const benefits = [
  {
    icon: Settings,
    title: "Personalizable",
    description: "Se adapta a las necesidades específicas de cada empresa. Configura departamentos, roles, tipos de documentos y flujos de trabajo según tu operación.",
  },
  {
    icon: Lock,
    title: "Seguridad Empresarial",
    description: "Cifrado de datos, control de acceso granular, y registro completo de auditoría para cumplir con regulaciones y políticas internas.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Análisis",
    description: "Dashboard con métricas en tiempo real, estadísticas por centro y departamento, y exportación de datos para análisis detallado.",
  },
  {
    icon: Globe,
    title: "Cobertura Nacional",
    description: "Diseñado para operaciones a lo largo de todo México, con soporte para múltiples estados y municipios.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="sticky top-0 z-50 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-md flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">GeoDoc Center</h1>
              <p className="text-xs text-muted-foreground leading-tight">Gestión Documental Inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" data-testid="button-login-header">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <Badge variant="secondary" className="mb-6">
              Plataforma SaaS para Gestión Inmobiliaria
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Gestión Documental y Gobernanza de{" "}
              <span className="text-primary">Edificios y Centros</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Centraliza, versiona y controla toda la documentación de tus centros y edificios 
              en México. Con mapa interactivo, flujos de aprobación, auditoría completa y 
              almacenamiento seguro en la nube.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/login">
                <Button size="lg" data-testid="button-get-started">
                  Comenzar Ahora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" data-testid="button-see-features">
                  Ver Funcionalidades
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-16 glass-card rounded-2xl p-8 border border-border/50 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "190+", label: "Centros" },
                { value: "7", label: "Departamentos" },
                { value: "5", label: "Roles de Acceso" },
                { value: "100%", label: "Trazabilidad" },
              ].map((stat) => (
                <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <p className="text-3xl font-bold text-primary" data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Funcionalidades</Badge>
            <h3 className="text-3xl font-bold mb-4">Todo lo que Necesitas para tu Operación</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una plataforma integral que cubre desde la gestión documental hasta la 
              visualización geográfica de tus activos inmobiliarios.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="hover-elevate transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-md gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2" data-testid={`text-feature-title-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Adaptable</Badge>
            <h3 className="text-3xl font-bold mb-4">Se Ajusta a las Necesidades de tu Empresa</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              GeoDoc Center es una plataforma flexible que se configura según los requerimientos 
              específicos de cada organización. No importa el tamaño o giro de tu empresa, 
              la plataforma se adapta a ti.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card
                key={benefit.title}
                className="hover-elevate transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                data-testid={`card-benefit-${benefit.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-md gradient-primary flex items-center justify-center shrink-0">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h4 className="text-xl font-bold mb-3">Personalización Total</h4>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Cada empresa tiene procesos únicos. GeoDoc Center permite configurar 
                departamentos, tipos de documentos, roles de usuario, flujos de aprobación 
                y reglas de negocio para que la plataforma trabaje exactamente como tu 
                organización lo necesita.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Departamentos personalizados", "Roles configurables", "Flujos a medida", "Reportes adaptables", "Integraciones flexibles"].map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h3 className="text-3xl font-bold mb-4">Alcance de la Plataforma</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              GeoDoc Center abarca todos los aspectos de la gestión documental y gobernanza 
              de inmuebles para empresas con operaciones distribuidas en México.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-14 w-14 rounded-md gradient-primary flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Documentos</h4>
              <p className="text-sm text-muted-foreground">
                Escrituras, prediales, contratos, licencias, dictámenes, permisos, planos, 
                certificados y más. Todos versionados y auditados.
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-md gradient-primary flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Inmuebles</h4>
              <p className="text-sm text-muted-foreground">
                Oficinas, bodegas, centros comerciales, sucursales y cualquier tipo de 
                inmueble con ubicación geográfica y estado operativo.
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-md gradient-primary flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Equipos</h4>
              <p className="text-sm text-muted-foreground">
                Colaboración entre departamentos con roles definidos, flujos de aprobación 
                y notificaciones para mantener a todos informados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="gradient-primary rounded-2xl py-16 px-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Comienza a Gestionar tus Documentos Hoy</h3>
            <p className="text-white/80 mb-8">
              Únete a las empresas que ya confían en GeoDoc Center para la gestión 
              documental y gobernanza de sus inmuebles en todo México.
            </p>
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm" data-testid="button-cta-login">
                Acceder a la Plataforma
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-primary rounded-md flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">GeoDoc Center</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestión Documental y Gobernanza de Edificios
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
