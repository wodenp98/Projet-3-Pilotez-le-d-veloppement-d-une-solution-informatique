import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useUserFiles } from "../api/files";
import { FileRow } from "../components/file-row";
import { toUserFile, type UserFile } from "../lib/user-file";

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
