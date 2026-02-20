import { Link, Outlet } from "@tanstack/react-router";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(172.84deg,var(--color-gradient-start)_2.29%,var(--color-gradient-end)_97.71%)]">
      <header className="flex items-center justify-between px-4 sm:px-8 md:px-20 py-4">
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold text-black no-underline"
        >
          DataShare
        </Link>
        <Link
          to="/login"
          className="rounded-md bg-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white no-underline hover:bg-gray-800"
        >
          Se connecter
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <Outlet />
      </main>

      <footer className="py-6 text-start ml-4 sm:ml-8 md:ml-20 text-sm text-white">
        Copyright DataShare© 2025
      </footer>
    </div>
  );
}
