import { Outlet, createRootRoute, useMatchRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "../components/layouts/authenticated-layout";
import { PublicLayout } from "../components/layouts/public-layout";
import { useAuth } from "../hooks/useAuth";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isAuthenticated } = useAuth();
  const matchRoute = useMatchRoute();
  const isDownloadRoute = matchRoute({ to: "/download/$token", fuzzy: true });

  if (isDownloadRoute) {
    return (
      <>
        <Outlet />
      </>
    );
  }

  return <>{isAuthenticated ? <AuthenticatedLayout /> : <PublicLayout />}</>;
}
