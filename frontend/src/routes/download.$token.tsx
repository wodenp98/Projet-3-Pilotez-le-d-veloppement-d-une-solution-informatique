import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Download,
  Info,
  OctagonAlert,
} from "lucide-react";
import { useState } from "react";
import { useDownloadFile, useFileInfo } from "../api/files";
import { DownloadLayout } from "../components/layouts/download-layout";
import { FileIcon } from "../components/file-icon";
import {
  formatExpirationDays,
  formatFileSize,
  getExpirationDays,
} from "../lib/formatters";

export const Route = createFileRoute("/download/$token")({
  component: DownloadPage,
});

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

  const expirationDays = getExpirationDays(fileInfo.expiredAt);
  const isExpired = expirationDays <= 0;
  const isExpiringSoon = expirationDays === 1;

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
          <FileIcon
            type={fileInfo.type}
            className="h-10 w-10 shrink-0 text-gray-900"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {fileInfo.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(fileInfo.size)}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
            isExpired
              ? "border-[#E5B5B5] bg-[#FFEDED]"
              : isExpiringSoon
                ? "border-[#E6CBB5] bg-[#FFF5ED]"
                : "border-[#B1C9F5] bg-[#E2ECFF]"
          }`}
        >
          {isExpired ? (
            <OctagonAlert className="h-4 w-4 shrink-0 text-[#9C3333]" />
          ) : isExpiringSoon ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#AA642B]" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-[#2A3F72]" />
          )}
          <p
            className={`text-sm ${
              isExpired
                ? "text-[#9C3333]"
                : isExpiringSoon
                  ? "text-[#AA642B]"
                  : "text-[#2A3F72]"
            }`}
          >
            {formatExpirationDays(expirationDays)}
          </p>
        </div>

        {fileInfo.passwordProtected && !fileInfo.expired && (
          <div className="space-y-1">
            <Label htmlFor="download-password">Mot de passe</Label>
            <Input
              id="download-password"
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
