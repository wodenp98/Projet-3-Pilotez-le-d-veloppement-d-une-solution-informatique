import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

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
        <p className="text-sm text-gray-600">Aucun fichier à télécharger</p>
      </div>
    </div>
  );
}
