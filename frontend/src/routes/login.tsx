import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useLogin } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type LoginFormData, loginSchema } from "../schemas/auth";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const login = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate({ email: data.email, password: data.password });
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Connexion
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Saisissez votre email..." {...field} />
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
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Saisissez votre mot de passe..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {login.isError && (
              <p className="text-center text-sm text-destructive">
                {login.error instanceof Error
                  ? login.error.message
                  : "Une erreur est survenue"}
              </p>
            )}

            <Link to="/register" className="block text-center text-sm text-link-create-account hover:opacity-80">
              Créer un compte
            </Link>

            <Button
              type="submit"
              disabled={login.isPending}
              variant="outline"
              className="w-full border-btn-login-border bg-btn-login-bg text-btn-login-text hover:bg-btn-login-bg hover:opacity-80"
            >
              {login.isPending ? "Connexion..." : "Connexion"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
