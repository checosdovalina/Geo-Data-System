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
import { Building2, Loader2, ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-login">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap px-6 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-to-landing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-9 w-9 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">GeoDoc Center</h1>
            <p className="text-muted-foreground mt-1">Gestión Documental Inteligente</p>
          </div>

          <Card>
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
  );
}
