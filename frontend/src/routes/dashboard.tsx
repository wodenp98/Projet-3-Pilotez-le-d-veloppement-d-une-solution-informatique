import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight, FileText, Lock, Trash2 } from "lucide-react";
import { useState } from "react";

type FileStatus = "active" | "expired";

interface UserFile {
  id: number;
  name: string;
  status: FileStatus;
  expiresLabel: string;
  hasPassword: boolean;
  token: string;
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

function DashboardComponent() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const files: UserFile[] = [];

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

      <div className="mb-6 flex items-center rounded-full bg-[#FFC19129] border border-[#D7630B33] w-fit">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;

          const rounding = isFirst
            ? "rounded-l-full"
            : isLast
              ? "rounded-r-full"
              : "";

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer border-none px-8 py-2.5 text-sm font-medium transition-colors ${rounding} ${
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

  return (
    <div
      className={`flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-400" />
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
            <button className="flex items-center gap-1 cursor-pointer rounded-lg border border-gradient-end bg-transparent px-3 py-1.5 text-xs font-medium text-gradient-end hover:opacity-80">
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
            <button className="flex items-center gap-1 cursor-pointer rounded-lg border border-gradient-end bg-transparent px-3 py-1.5 text-xs font-medium text-gradient-end hover:opacity-80">
              Accéder
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
