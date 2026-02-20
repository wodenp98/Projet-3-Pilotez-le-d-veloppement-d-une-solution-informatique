import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function DownloadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(172.84deg,var(--color-gradient-start)_2.29%,var(--color-gradient-end)_97.71%)]">
      <header className="flex items-center justify-between px-20 py-4">
        <Link to="/" className="text-2xl font-bold text-black no-underline">
          DataShare
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          {children}
        </div>
      </main>

      <footer className="py-6 text-start ml-20 text-sm text-white">
        Copyright DataShare© 2025
      </footer>
    </div>
  );
}
