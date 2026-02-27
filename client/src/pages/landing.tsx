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
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Gestión de Centros",
    description: "Administra hasta 190+ centros y edificios con información detallada de ubicación, tipo y estado operativo.",
    color: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: FileText,
    title: "Control Documental",
    description: "Versionado completo de documentos sin eliminación física. Cada cambio queda registrado con trazabilidad total.",
    color: "from-teal-500 to-teal-600",
    lightBg: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    icon: Map,
    title: "Visualización Geográfica",
    description: "Mapa interactivo de México para localizar centros, analizar distribución y tomar decisiones estratégicas.",
    color: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Shield,
    title: "Roles y Permisos",
    description: "5 niveles de acceso configurables: Super Admin, Gerente, Auxiliar, Viewer y Auditor para máxima seguridad.",
    color: "from-purple-500 to-purple-600",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: CheckCircle2,
    title: "Flujo de Aprobación",
    description: "Workflow de aprobación documental con estados pendiente, aprobado y rechazado. Control total del ciclo de vida.",
    color: "from-amber-500 to-amber-600",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: ClipboardList,
    title: "Auditoría Completa",
    description: "Registro inmutable de todas las acciones: quién hizo qué, cuándo y desde dónde. Exportable a CSV.",
    color: "from-rose-500 to-rose-600",
    lightBg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: AlertTriangle,
    title: "Gestión de Incidentes",
    description: "Workflow para reportar y resolver incidencias: documentos faltantes, cambios sensibles y solicitudes.",
    color: "from-orange-500 to-orange-600",
    lightBg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: Cloud,
    title: "Almacenamiento Seguro",
    description: "Sube archivos desde tu computadora con almacenamiento en la nube. Opción de integración con Google Drive.",
    color: "from-cyan-500 to-cyan-600",
    lightBg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    icon: Layers,
    title: "7 Departamentos",
    description: "Organización por departamentos especializados para clasificar y gestionar documentación de forma estructurada.",
    color: "from-indigo-500 to-indigo-600",
    lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
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

const stats = [
  { value: "190+", label: "Centros", icon: Building2 },
  { value: "7", label: "Departamentos", icon: Layers },
  { value: "5", label: "Roles de Acceso", icon: Shield },
  { value: "100%", label: "Trazabilidad", icon: CheckCircle2 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="h-5 w-5 text-white" />
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
            <Link href="/login">
              <Button className="gradient-primary border-0 shadow-md hover-elevate" data-testid="button-get-started-header">
                Comenzar
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-animated hero-pattern" />
        <div className="absolute inset-0 hero-dots opacity-30" />
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-teal-400/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <Badge variant="secondary" className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur-sm px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Plataforma SaaS para Gestión Inmobiliaria
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Gestión Documental y Gobernanza de{" "}
              <span className="relative">
                <span className="relative z-10">Edificios y Centros</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-teal-400/30 rounded-sm -z-0" />
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: "0.3s" }}>
              Centraliza, versiona y controla toda la documentación de tus centros y edificios 
              en México. Con mapa interactivo, flujos de aprobación, auditoría completa y 
              almacenamiento seguro en la nube.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl h-12 px-8 text-base font-semibold" data-testid="button-get-started">
                  <Zap className="h-4 w-4 mr-2" />
                  Comenzar Ahora
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm h-12 px-8 text-base" data-testid="button-see-features">
                  Ver Funcionalidades
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-20 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-effect rounded-xl p-5 text-center bg-white/10 border-white/15 group hover:bg-white/20 transition-all duration-300"
                  data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <stat.icon className="h-5 w-5 text-teal-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-3xl font-bold text-white mb-0.5" data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 gradient-border">
              <Sparkles className="h-3 w-3 mr-1.5" />
              Funcionalidades
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que Necesitas para tu Operación</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Una plataforma integral que cubre desde la gestión documental hasta la 
              visualización geográfica de tus activos inmobiliarios.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover-elevate transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 0.08}s` }}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-base mb-2" data-testid={`text-feature-title-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Adaptable</Badge>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Se Ajusta a las Necesidades de tu Empresa</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              GeoDoc Center es una plataforma flexible que se configura según los requerimientos 
              específicos de cada organización.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card
                key={benefit.title}
                className="group hover-elevate transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                data-testid={`card-benefit-${benefit.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-0">
              <div className="gradient-primary p-8 md:p-10 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 hero-pattern" />
                <div className="relative">
                  <h4 className="text-xl md:text-2xl font-bold mb-3">Personalización Total</h4>
                  <p className="text-white/80 mb-6 max-w-xl mx-auto leading-relaxed">
                    Cada empresa tiene procesos únicos. GeoDoc Center permite configurar 
                    departamentos, tipos de documentos, roles de usuario y flujos de aprobación 
                    para que la plataforma trabaje exactamente como tu organización lo necesita.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Departamentos personalizados", "Roles configurables", "Flujos a medida", "Reportes adaptables", "Integraciones flexibles"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/15 text-white border-white/20 backdrop-blur-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Alcance de la Plataforma</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              GeoDoc Center abarca todos los aspectos de la gestión documental y gobernanza 
              de inmuebles para empresas con operaciones distribuidas en México.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: FileText, title: "Documentos", desc: "Escrituras, prediales, contratos, licencias, dictámenes, permisos, planos, certificados y más. Todos versionados y auditados.", color: "from-blue-500 to-cyan-500" },
              { icon: Building2, title: "Inmuebles", desc: "Oficinas, bodegas, centros comerciales, sucursales y cualquier tipo de inmueble con ubicación geográfica y estado operativo.", color: "from-teal-500 to-emerald-500" },
              { icon: Users, title: "Equipos", desc: "Colaboración entre departamentos con roles definidos, flujos de aprobación y notificaciones para mantener a todos informados.", color: "from-purple-500 to-indigo-500" },
            ].map((item, index) => (
              <div key={item.title} className="text-center group animate-slide-up" style={{ animationDelay: `${(index + 1) * 0.15}s` }}>
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-3">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="gradient-hero-animated rounded-3xl py-16 md:py-20 px-8 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 hero-pattern" />
            <div className="absolute inset-0 hero-dots opacity-20" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Comienza a Gestionar tus Documentos Hoy</h3>
              <p className="text-white/75 mb-8 text-lg max-w-lg mx-auto leading-relaxed">
                Únete a las empresas que ya confían en GeoDoc Center para la gestión 
                documental y gobernanza de sus inmuebles en todo México.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl h-12 px-8 text-base font-semibold" data-testid="button-cta-login">
                  Acceder a la Plataforma
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10 relative">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold">GeoDoc Center</span>
                <p className="text-xs text-muted-foreground">Gestión Documental Inteligente</p>
              </div>
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
