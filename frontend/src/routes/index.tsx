import { createFileRoute, redirect } from "@tanstack/react-router";
import { CloudUpload } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (localStorage.getItem("token")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <h1 className="text-3xl font-thin">Tu veux partager un fichier ?</h1>

      <div className="relative flex items-center justify-center">
        <div className="absolute h-26 w-26 rounded-full bg-black/20" />
        <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-black">
          <CloudUpload className="h-10 w-10 text-white" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
