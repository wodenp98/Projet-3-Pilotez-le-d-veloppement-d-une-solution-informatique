import { type UploadResponse } from "../api/files";
import { formatExpiresLabel } from "./formatters";

export type FileStatus = "active" | "expired";

export interface UserFile {
  id: number;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  status: FileStatus;
  expiresLabel: string;
  hasPassword: boolean;
  token: string;
}

export function toUserFile(file: UploadResponse): UserFile {
  const now = new Date();
  const expDate = new Date(file.expiredAt);
  const status: FileStatus = expDate <= now ? "expired" : "active";

  return {
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: file.createdAt,
    status,
    expiresLabel: formatExpiresLabel(file.expiredAt),
    hasPassword: file.passwordProtected,
    token: file.token,
  };
}
