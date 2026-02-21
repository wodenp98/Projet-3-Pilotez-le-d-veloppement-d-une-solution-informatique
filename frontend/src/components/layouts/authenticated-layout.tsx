import { Link, Outlet } from "@tanstack/react-router";
import { CloudUpload, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { UploadModal } from "../upload-modal";

export function AuthenticatedLayout() {
  const { logout } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-[linear-gradient(172.84deg,var(--color-gradient-start)_2.29%,var(--color-gradient-end)_97.71%)] transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <button
            onClick={() => setSidebarOpen(false)}
            className="cursor-pointer border-none bg-transparent text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
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
            onClick={() => setSidebarOpen(false)}
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
        <header className="flex items-center justify-between gap-4 bg-[#FFEEE3] border-b border-[#D8611C4A] px-4 sm:px-8 py-4 md:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer border-none bg-transparent md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setUploadOpen(true)}
              className="rounded-sm bg-gray-900 px-5 py-2 text-sm font-medium text-white cursor-pointer border-none hover:bg-gray-800"
              aria-label="Ajouter des fichiers"
            >
              <CloudUpload className="h-5 w-5 md:hidden" aria-hidden="true" />
              <span className="hidden md:inline" aria-hidden="true">
                Ajouter des fichiers
              </span>
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="flex items-center gap-1 bg-transparent mr-6 text-sm text-link-create-account cursor-pointer border-none hover:opacity-80"
              aria-label="Déconnexion"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline" aria-hidden="true">
                Déconnexion
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-4">
          <Outlet />
        </main>
      </div>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
