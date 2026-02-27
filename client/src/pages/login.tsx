import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2, ArrowLeft, Shield, FileText, Map } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    login.mutate(data, {
      onSuccess: () => {
        toast({ title: "Bienvenido a GeoDoc Center" });
      },
      onError: (error: any) => {
        let message = "Credenciales incorrectas. Verifica tu correo y contraseña.";
        try {
          const parsed = JSON.parse(error?.message?.replace(/^\d+:\s*/, "") || "{}");
          if (parsed.error) message = parsed.error;
        } catch {}
        toast({ title: "Error al iniciar sesión", description: message, variant: "destructive" });
      },
    });
  };

  const features = [
    { icon: Shield, text: "Seguridad y control de acceso avanzado" },
    { icon: FileText, text: "Gestión documental centralizada" },
    { icon: Map, text: "Cobertura geográfica nacional" },
  ];

  return (
    <div className="min-h-screen flex" data-testid="page-login">
      <div className="hidden lg:flex gradient-hero w-[45%] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-6 left-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white no-default-hover-elevate" data-testid="button-back-to-landing-desktop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GeoDoc Center</h1>
          <p className="text-white/80 text-lg mb-10">Gestión Documental Inteligente</p>

          <div className="space-y-5 w-full">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-white/90" />
                </div>
                <span className="text-white/80 text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-white/20 animate-float" />
        <div className="absolute top-[30%] right-[15%] w-2 h-2 rounded-full bg-white/15 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-[25%] left-[20%] w-4 h-4 rounded-full bg-white/10 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[15%] right-[10%] w-2.5 h-2.5 rounded-full bg-white/20 animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[60%] left-[8%] w-2 h-2 rounded-full bg-white/15 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[45%] right-[8%] w-3.5 h-3.5 rounded-full bg-white/10 animate-float" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="flex-1 flex flex-col gradient-mesh bg-background min-h-screen">
        <header className="flex items-center justify-between gap-4 flex-wrap px-6 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="lg:invisible" data-testid="button-back-to-landing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8 lg:hidden">
              <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-9 w-9 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold" data-testid="text-login-title-mobile">GeoDoc Center</h1>
              <p className="text-muted-foreground mt-1">Gestión Documental Inteligente</p>
            </div>

            <Card className="glass-card">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">Iniciar Sesión</CardTitle>
                <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="admin@geodoc.mx"
                              {...field}
                              data-testid="input-login-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Tu contraseña"
                              {...field}
                              data-testid="input-login-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={login.isPending} data-testid="button-login-submit">
                      {login.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {login.isPending ? "Ingresando..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Contacta al administrador del sistema si no tienes acceso.
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Sistema de Gestión Documental y Gobernanza de Edificios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
