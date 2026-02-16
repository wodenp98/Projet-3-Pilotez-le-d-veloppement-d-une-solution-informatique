import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CloudUpload, Copy, File, FileAudio, FileImage, FileText, FileVideo, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { type UploadResponse, useUploadFile } from "../api/files";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatExpiration(expirationDays: number): string {
  if (expirationDays === 1) return "une journée";
  if (expirationDays === 7) return "une semaine";
  return `${expirationDays} jours`;
}

function getShareLink(token: string): string {
  return `${window.location.origin}/download/${token}`;
}

function FileIcon({ type, className }: { type: string; className?: string }) {
  if (type.startsWith("image/")) return <FileImage className={className} />;
  if (type.startsWith("video/")) return <FileVideo className={className} />;
  if (type.startsWith("audio/")) return <FileAudio className={className} />;
  if (type.startsWith("text/") || type === "application/pdf") return <FileText className={className} />;
  return <File className={className} />;
}

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 Go
const FORBIDDEN_EXTENSIONS = new Set(["exe", "bat", "cmd", "sh", "msi", "com", "scr", "ps1", "vbs"]);

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
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
      ? selected.name.substring(selected.name.lastIndexOf(".") + 1).toLowerCase()
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

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!file) return;
    if (password && password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setPasswordError(null);
    upload.mutate(
      { file, password: password || undefined, expirationDays, tags: tags.length > 0 ? tags : undefined },
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
      <SheetContent side="bottom" className="overflow-hidden rounded-t-2xl border-none p-6">
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

function UploadForm({
  file,
  fileError,
  password,
  passwordError,
  expirationDays,
  tags,
  fileInputRef,
  upload,
  onFileChange,
  onPasswordChange,
  onExpirationChange,
  onTagsChange,
  onSubmit,
}: {
  file: File | null;
  fileError: string | null;
  password: string;
  passwordError: string | null;
  expirationDays: number;
  tags: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  upload: ReturnType<typeof useUploadFile>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (v: string) => void;
  onExpirationChange: (v: number) => void;
  onTagsChange: (v: string[]) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="min-w-0 space-y-6">
      {file ? (
        <div className="flex items-center gap-3">
          <FileIcon type={file.type} className="h-10 w-10 shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-btn-login-border text-btn-login-text hover:opacity-80"
          >
            Changer
          </Button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-transparent py-8 text-sm text-gray-500 hover:border-gray-400"
        >
          <CloudUpload className="h-5 w-5" />
          Choisir un fichier
        </button>
      )}

      {fileError && (
        <p className="text-center text-xs text-red-500">{fileError}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="space-y-1">
        <Label>Mot de passe</Label>
        <Input
          type="password"
          placeholder="Optionnel"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
        {passwordError && (
          <p className="text-xs text-red-500">{passwordError}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Expiration</Label>
        <Select
          value={String(expirationDays)}
          onValueChange={(v) => onExpirationChange(Number(v))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Une journée</SelectItem>
            <SelectItem value="2">Deux jours</SelectItem>
            <SelectItem value="3">Trois jours</SelectItem>
            <SelectItem value="7">Une semaine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Tags</Label>
        <Input
          placeholder="Ajouter un tag puis Entrée"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value && value.length <= 30 && !tags.includes(value)) {
                onTagsChange([...tags, value]);
                e.currentTarget.value = "";
              }
            }
          }}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 rounded-full bg-btn-login-bg px-2.5 py-0.5 text-xs text-btn-login-text"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onTagsChange(tags.filter((_, i) => i !== index))}
                  className="cursor-pointer border-none bg-transparent p-0 text-btn-login-text hover:opacity-60"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {upload.isError && (
        <p className="text-center text-xs text-destructive">
          {upload.error instanceof Error
            ? upload.error.message
            : "Une erreur est survenue"}
        </p>
      )}

      <div className="flex justify-center">
        <Button
          onClick={onSubmit}
          disabled={!file || upload.isPending}
          variant="outline"
          className={
            file
              ? "border-btn-login-border bg-btn-login-bg text-btn-login-text hover:bg-btn-login-bg hover:opacity-80"
              : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
          }
        >
          <CloudUpload className="h-4 w-4" />
          {upload.isPending ? "Envoi..." : "Téleverser"}
        </Button>
      </div>
    </div>
  );
}

function SuccessView({
  result,
  file,
  expirationDays,
  onCopyLink,
}: {
  result: UploadResponse;
  file: File | null;
  expirationDays: number;
  onCopyLink: () => void;
}) {
  const shareLink = getShareLink(result.token);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileIcon type={result.type} className="h-10 w-10 shrink-0 text-gray-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {result.name}
          </p>
          <p className="text-xs text-gray-500">
            {file ? formatFileSize(file.size) : `${result.size} o`}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-900">
        Félicitations, ton fichier sera conservé chez nous pendant{" "}
        {formatExpiration(expirationDays)} !
      </p>

      <div className="rounded-lg bg-gray-100 px-4 py-3">
        <a
          href={shareLink}
          className="text-sm text-btn-login-text break-all hover:underline"
        >
          {shareLink}
        </a>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-btn-login-border bg-btn-login-bg text-btn-login-text hover:bg-btn-login-bg hover:opacity-80"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Lien copié" : "Copier le lien"}
        </Button>
      </div>
    </div>
  );
}
