import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, File, FileAudio, FileImage, FileText, FileVideo, Info } from "lucide-react";
import { useState } from "react";
import { useDownloadFile, useFileInfo } from "../api/files";

export const Route = createFileRoute("/download/$token")({
  component: DownloadPage,
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function FileIcon({ type, className }: { type: string; className?: string }) {
  if (type.startsWith("image/")) return <FileImage className={className} />;
  if (type.startsWith("video/")) return <FileVideo className={className} />;
  if (type.startsWith("audio/")) return <FileAudio className={className} />;
  if (type.startsWith("text/") || type === "application/pdf") return <FileText className={className} />;
  return <File className={className} />;
}

function formatExpirationDays(expiredAt: string): string {
  const now = new Date();
  const expDate = new Date(expiredAt);
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Ce fichier a expiré.";
  if (diffDays === 1) return "Ce fichier expirera demain.";
  return `Ce fichier expirera dans ${diffDays} jours.`;
}

function DownloadPage() {
  const { token } = Route.useParams();
  const { data: fileInfo, isLoading, isError } = useFileInfo(token);
  const download = useDownloadFile();
  const [password, setPassword] = useState("");

  if (isLoading) {
    return (
      <DownloadLayout>
        <p className="text-center text-sm text-gray-500">Chargement...</p>
      </DownloadLayout>
    );
  }

  if (isError || !fileInfo) {
    return (
      <DownloadLayout>
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-900">
            Ce lien n'existe pas ou a expiré.
          </p>
          <Link
            to="/"
            className="text-sm text-link-create-account hover:underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </DownloadLayout>
    );
  }

  const canDownload =
    !fileInfo.expired &&
    (!fileInfo.passwordProtected || password.length > 0) &&
    !download.isPending;

  const handleDownload = () => {
    download.mutate({
      token,
      password: fileInfo.passwordProtected ? password : undefined,
      fileName: fileInfo.name,
    });
  };

  return (
    <DownloadLayout>
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Télécharger un fichier
        </h2>

        <div className="flex items-center gap-3">
          <FileIcon type={fileInfo.type} className="h-10 w-10 shrink-0 text-gray-900" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {fileInfo.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(fileInfo.size)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3">
          <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-700">
            {formatExpirationDays(fileInfo.expiredAt)}
          </p>
        </div>

        {fileInfo.passwordProtected && !fileInfo.expired && (
          <div className="space-y-1">
            <Label>Mot de passe</Label>
            <Input
              type="password"
              placeholder="Saisissez le mot de passe..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {download.isError && (
          <p className="text-center text-xs text-destructive">
            {download.error instanceof Error
              ? download.error.message
              : "Une erreur est survenue"}
          </p>
        )}

        {!fileInfo.expired && (
          <div className="flex justify-center">
            <Button
              onClick={handleDownload}
              disabled={!canDownload}
              variant="outline"
              className={
                canDownload
                  ? "border-btn-login-border bg-btn-login-bg text-btn-login-text hover:bg-btn-login-bg hover:opacity-80"
                  : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            >
              <Download className="h-4 w-4" />
              {download.isPending ? "Téléchargement..." : "Télécharger"}
            </Button>
          </div>
        )}
      </div>
    </DownloadLayout>
  );
}

function DownloadLayout({ children }: { children: React.ReactNode }) {
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
