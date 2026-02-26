import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteFile } from "../api/files";
import { formatDate, formatFileSize } from "../lib/formatters";
import { type UserFile } from "../lib/user-file";
import { FileIcon } from "./file-icon";

export function FileRow({ file }: { file: UserFile }) {
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
        className={`flex items-center justify-between rounded-lg border border-[#D7630B33] bg-[#FFC1910D] px-5 py-2 ${
          isExpired ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <FileIcon type={file.type} className="h-8 w-8 text-black" />
          <div>
            <p className="text-sm font-medium text-black">{file.name}</p>
            <p className="text-xs text-black">
              {formatFileSize(file.size)} · Envoyé le{" "}
              {formatDate(file.createdAt)}
            </p>
            <p
              className={`text-xs ${isExpired ? "text-gradient-end font-medium" : "text-black"}`}
            >
              {file.expiresLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isExpired ? (
            <span className="text-xs text-gray-500">
              Ce fichier a expiré, il n'est plus stocké chez nous
            </span>
          ) : (
            <>
              {file.hasPassword && <Lock className="h-4 w-4 text-black" />}
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-1 cursor-pointer rounded-lg border border-[#FFA569] bg-transparent px-3 py-1.5 text-xs font-medium text-link-create-account hover:opacity-80"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
              <Link
                to="/download/$token"
                params={{ token: file.token }}
                className="flex items-center gap-1 no-underline rounded-lg border border-[#FFA569] bg-transparent px-3 py-1.5 text-xs font-medium text-link-create-account hover:opacity-80"
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
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
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
