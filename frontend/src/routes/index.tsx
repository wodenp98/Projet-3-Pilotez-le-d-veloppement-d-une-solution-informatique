import { createFileRoute, redirect } from "@tanstack/react-router";
import { CloudUpload } from "lucide-react";
import { useState } from "react";
import { UploadModal } from "../components/upload-modal";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (localStorage.getItem("token")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HomeComponent,
});

function HomeComponent() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 sm:gap-10 text-center px-4">
      <h1 className="text-2xl sm:text-3xl font-thin">
        Tu veux partager un fichier ?
      </h1>

      <button
        onClick={() => setUploadOpen(true)}
        className="relative flex cursor-pointer items-center justify-center border-none bg-transparent"
      >
        <div className="absolute h-20 w-20 sm:h-26 sm:w-26 rounded-full bg-black/20" />
        <div className="relative flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-black">
          <CloudUpload className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={1.5} />
        </div>
      </button>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
