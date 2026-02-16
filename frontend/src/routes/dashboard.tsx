import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Lock,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useDeleteFile, useUserFiles, type UploadResponse } from "../api/files";

type FileStatus = "active" | "expired";

interface UserFile {
  id: number;
  name: string;
  type: string;
  status: FileStatus;
  expiresLabel: string;
  hasPassword: boolean;
  token: string;
}

function FileIcon({ type, className }: { type: string; className?: string }) {
  if (type.startsWith("image/")) return <FileImage className={className} />;
  if (type.startsWith("video/")) return <FileVideo className={className} />;
  if (type.startsWith("audio/")) return <FileAudio className={className} />;
  if (type.startsWith("text/") || type === "application/pdf")
    return <FileText className={className} />;
  return <File className={className} />;
}

type TabFilter = "all" | "active" | "expired";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!localStorage.getItem("token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardComponent,
});

function formatExpiresLabel(expiredAt: string): string {
  const now = new Date();
  const expDate = new Date(expiredAt);
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Expiré";
  if (diffDays === 1) return "Expire demain";
  return `Expire dans ${diffDays} jours`;
}

function toUserFile(file: UploadResponse): UserFile {
  const now = new Date();
  const expDate = new Date(file.expiredAt);
  const status: FileStatus = expDate <= now ? "expired" : "active";

  return {
    id: file.id,
    name: file.name,
    type: file.type,
    status,
    expiresLabel: formatExpiresLabel(file.expiredAt),
    hasPassword: file.passwordProtected,
    token: file.token,
  };
}

function DashboardComponent() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const { data: rawFiles } = useUserFiles();

  const files: UserFile[] = (rawFiles ?? []).map(toUserFile);

  const filteredFiles = files.filter((file) => {
    if (activeTab === "all") return true;
    return file.status === activeTab;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "active", label: "Actifs" },
    { key: "expired", label: "Expiré" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mes fichiers</h1>

      <div className="mb-6 flex h-8 items-center rounded-3xl bg-[#FFC19129] border border-[#D7630B33] w-full md:w-fit">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;

          const rounding = isFirst
            ? "rounded-l-3xl"
            : isLast
              ? "rounded-r-3xl"
              : "";

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer border-none h-full px-6 md:px-8 text-xs font-medium transition-colors flex-1 md:flex-initial ${rounding} ${
                isActive
                  ? "bg-[#E77A6E] text-white"
                  : "bg-transparent text-gray-900 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun fichier à télécharger</p>
        ) : (
          filteredFiles.map((file) => <FileRow key={file.id} file={file} />)
        )}
      </div>
    </div>
  );
}

function FileRow({ file }: { file: UserFile }) {
  const isExpired = file.status === "expired";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFile = useDeleteFile();

  const handleDelete = () => {
    deleteFile.mutate(file.id, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <div
        className={`flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm ${
          isExpired ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <FileIcon type={file.type} className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p
              className={`text-xs ${isExpired ? "text-gradient-end font-medium" : "text-gray-500"}`}
            >
              {file.expiresLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isExpired ? (
            <span className="text-xs text-gray-400 italic">
              Ce fichier a expiré, il n'est plus stocké chez nous
            </span>
          ) : (
            <>
              {file.hasPassword && <Lock className="h-4 w-4 text-gray-400" />}
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-1 cursor-pointer rounded-lg border border-gradient-end bg-transparent px-3 py-1.5 text-xs font-medium text-gradient-end hover:opacity-80"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
              <Link
                to="/download/$token"
                params={{ token: file.token }}
                className="flex items-center gap-1 no-underline rounded-lg border border-gradient-end bg-transparent px-3 py-1.5 text-xs font-medium text-gradient-end hover:opacity-80"
              >
                Accéder
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le fichier</DialogTitle>
            <DialogDescription>
              Es-tu sûr de vouloir supprimer{" "}
              <span className="font-medium text-gray-900">{file.name}</span> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteFile.isPending}
            >
              {deleteFile.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
