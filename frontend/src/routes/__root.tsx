import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { UploadModal } from "../components/upload-modal";
import { useAuth } from "../hooks/useAuth";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? <AuthenticatedLayout /> : <PublicLayout />}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

function PublicLayout() {
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
    </div>
  );
}

function AuthenticatedLayout() {
  const { logout } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col bg-[linear-gradient(172.84deg,var(--color-gradient-start)_2.29%,var(--color-gradient-end)_97.71%)]">
        <div className="px-6 py-6">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-white no-underline"
          >
            DataShare
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <Link
            to="/dashboard"
            className="block rounded-lg bg-white/40 px-4 py-2 text-sm font-medium text-[#803A00] no-underline"
          >
            Mes fichiers
          </Link>
        </nav>

        <footer className="px-4 py-4 text-sm text-white">
          Copyright DataShare© 2025
        </footer>
      </aside>

      <div className="flex flex-1 flex-col bg-[#FAF5F1]">
        <header className="flex items-center justify-end gap-6 bg-[#FFEEE3] border-b border-[#D8611C4A] px-8 py-4">
          <button
            onClick={() => setUploadOpen(true)}
            className="rounded-sm bg-gray-900 px-5 py-2 text-sm font-medium text-white cursor-pointer border-none hover:bg-gray-800"
          >
            Ajouter des fichiers
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="flex items-center gap-1 bg-transparent mr-6 text-sm text-link-create-account cursor-pointer border-none hover:opacity-80"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </header>

        <main className="flex-1 px-8 py-4">
          <Outlet />
        </main>
      </div>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
