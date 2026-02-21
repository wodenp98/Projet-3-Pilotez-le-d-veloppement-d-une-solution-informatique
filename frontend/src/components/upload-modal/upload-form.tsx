import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudUpload, X } from "lucide-react";
import type { useUploadFile } from "../../api/files";
import { FileIcon } from "../file-icon";
import { formatFileSize } from "../../lib/formatters";

export const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 Go
export const FORBIDDEN_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "sh",
  "msi",
  "com",
  "scr",
  "ps1",
  "vbs",
]);

export function UploadForm({
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
          <FileIcon
            type={file.type}
            className="h-10 w-10 shrink-0 text-gray-400"
          />
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
        <Label htmlFor="upload-password">Mot de passe</Label>
        <Input
          id="upload-password"
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
        <Label htmlFor="upload-tags">Tags</Label>
        <Input
          id="upload-tags"
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
                  aria-label={`Supprimer le tag ${tag}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
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
