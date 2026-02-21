import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { type UploadResponse, useUploadFile } from "../../api/files";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { getShareLink } from "../../lib/formatters";
import {
  FORBIDDEN_EXTENSIONS,
  MAX_FILE_SIZE,
  UploadForm,
} from "./upload-form";
import { SuccessView } from "./success-view";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [expirationDays, setExpirationDays] = useState(7);
  const [tags, setTags] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFile();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const ext = selected.name.includes(".")
      ? selected.name
          .substring(selected.name.lastIndexOf(".") + 1)
          .toLowerCase()
      : "";
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      setFileError(`Les fichiers .${ext} ne sont pas autorisés`);
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("Le fichier dépasse la taille maximale de 1 Go");
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(selected);
  };

  const handleSubmit = () => {
    if (!file) return;
    if (password && password.length < 6) {
      setPasswordError(
        "Le mot de passe doit contenir au moins 6 caractères",
      );
      return;
    }
    setPasswordError(null);
    upload.mutate(
      {
        file,
        password: password || undefined,
        expirationDays,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: (data) => {
          setUploadResult(data);
          queryClient.invalidateQueries({ queryKey: ["user-files"] });
        },
      },
    );
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFile(null);
      setFileError(null);
      setPassword("");
      setPasswordError(null);
      setExpirationDays(7);
      setTags([]);
      setUploadResult(null);
      upload.reset();
    }
    onOpenChange(isOpen);
  };

  const handleCopyLink = () => {
    if (!uploadResult) return;
    navigator.clipboard.writeText(getShareLink(uploadResult.token));
  };

  const content = uploadResult ? (
    <SuccessView
      result={uploadResult}
      file={file}
      expirationDays={expirationDays}
      onCopyLink={handleCopyLink}
    />
  ) : (
    <UploadForm
      file={file}
      fileError={fileError}
      password={password}
      passwordError={passwordError}
      expirationDays={expirationDays}
      tags={tags}
      fileInputRef={fileInputRef}
      upload={upload}
      onFileChange={handleFileChange}
      onPasswordChange={setPassword}
      onExpirationChange={setExpirationDays}
      onTagsChange={setTags}
      onSubmit={handleSubmit}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="overflow-hidden border-none p-8 sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Ajouter un fichier
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="overflow-hidden rounded-t-2xl border-none p-6"
      >
        <SheetHeader>
          <SheetTitle className="text-center text-2xl font-bold">
            Ajouter un fichier
          </SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
