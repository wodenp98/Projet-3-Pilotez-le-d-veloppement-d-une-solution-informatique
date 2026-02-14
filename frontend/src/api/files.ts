import { useMutation } from "@tanstack/react-query";
import api from "./axios";

interface UploadPayload {
  file: File;
  password?: string;
  expirationDays: number;
}

interface UploadResponse {
  id: number;
  name: string;
  type: string;
  size: number;
  token: string;
  createdAt: string;
  expiredAt: string;
  passwordProtected: boolean;
  tags: string[];
}

function useUploadFile() {
  return useMutation({
    mutationFn: (data: UploadPayload) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("expirationDays", String(data.expirationDays));
      if (data.password) {
        formData.append("password", data.password);
      }
      return api
        .post<UploadResponse>("/files", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },
  });
}

export { useUploadFile };
export type { UploadResponse };
