import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { type UploadResponse } from "../../api/files";
import { FileIcon } from "../file-icon";
import { formatExpiration, formatFileSize, getShareLink } from "../../lib/formatters";

export function SuccessView({
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
        <FileIcon
          type={result.type}
          className="h-10 w-10 shrink-0 text-gray-400"
        />
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
