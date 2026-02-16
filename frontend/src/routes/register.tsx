import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useRegister } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterFormData, registerSchema } from "../schemas/auth";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (localStorage.getItem("token")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterComponent,
});

function RegisterComponent() {
  const register = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    register.reset();
    register.mutate({ email: data.email, password: data.password });
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Créer un compte
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => register.isError && register.reset()} className="space-y-4">
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification du mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Saisissez le à nouveau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {register.isError && (
              <p className="text-center text-sm text-destructive">
                {register.error instanceof Error
                  ? register.error.message
                  : "Une erreur est survenue"}
              </p>
            )}

            <Link to="/login" className="block text-center text-sm text-link-create-account hover:opacity-80">
              J'ai déjà un compte
            </Link>

            <Button
              type="submit"
              disabled={register.isPending}
              variant="outline"
              className="w-full border-btn-login-border bg-btn-login-bg text-btn-login-text hover:bg-btn-login-bg hover:opacity-80"
            >
              {register.isPending ? "Création..." : "Créer mon compte"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
