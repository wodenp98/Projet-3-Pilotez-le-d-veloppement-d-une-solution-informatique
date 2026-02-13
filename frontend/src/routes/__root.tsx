import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(172.84deg,var(--color-gradient-start)_2.29%,var(--color-gradient-end)_97.71%)]">
      <header className="flex items-center justify-between px-20 py-4">
        <Link to="/" className="text-2xl font-bold text-black no-underline">
          DataShare
        </Link>
        <Link
          to="/login"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white no-underline hover:bg-gray-800"
        >
          Se connecter
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <Outlet />
      </main>

      <footer className="py-6 text-start ml-20 text-sm text-white">
        Copyright DataShare© 2025
      </footer>

      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
