import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import api from "./axios";

interface UploadPayload {
  file: File;
  password?: string;
  expirationDays: number;
  tags?: string[];
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
      if (data.tags) {
        data.tags.forEach((tag) => formData.append("tags", tag));
      }
      return api
        .post<UploadResponse>("/files", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },
  });
}

interface FileInfoResponse {
  name: string;
  type: string;
  size: number;
  expiredAt: string;
  passwordProtected: boolean;
  expired: boolean;
}

function useFileInfo(token: string) {
  return useQuery({
    queryKey: ["file-info", token],
    queryFn: () =>
      api
        .get<FileInfoResponse>(`/files/download/${token}`)
        .then((res) => res.data),
    retry: false,
  });
}

function useDownloadFile() {
  return useMutation({
    mutationFn: async ({
      token,
      password,
      fileName,
    }: {
      token: string;
      password?: string;
      fileName: string;
    }) => {
      const params = new URLSearchParams();
      if (password) params.append("password", password);

      try {
        const response = await api.post(`/files/download/${token}`, null, {
          params,
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          throw new Error(parsed.error || "Une erreur est survenue");
        }
        throw err;
      }
    },
  });
}

function useUserFiles() {
  return useQuery({
    queryKey: ["user-files"],
    queryFn: () => api.get<UploadResponse[]>("/files").then((res) => res.data),
  });
}

function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: number) =>
      api.delete(`/files/${fileId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-files"] });
    },
  });
}

export {
  useDeleteFile,
  useDownloadFile,
  useFileInfo,
  useUploadFile,
  useUserFiles,
};
export type { FileInfoResponse, UploadResponse };
