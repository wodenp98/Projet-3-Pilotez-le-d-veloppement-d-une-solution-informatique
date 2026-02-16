import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import axios from "axios";
import api from "./axios";

interface AuthPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  "Email already exists": "Cette adresse email est déjà utilisée",
};

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined;
    if (serverMessage && ERROR_MESSAGES[serverMessage]) {
      return ERROR_MESSAGES[serverMessage];
    }
    if (serverMessage) {
      return serverMessage;
    }
  }
  return "Une erreur est survenue";
}

function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AuthPayload) => {
      try {
        const res = await api.post<AuthResponse>("/auth/register", data);
        return res.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    onSuccess: async (data) => {
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new StorageEvent("storage"));

      await router.invalidate();
      await router.navigate({ to: "/dashboard" });
    },
  });
}

function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AuthPayload) => {
      try {
        const res = await api.post<AuthResponse>("/auth/login", data);
        return res.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    onSuccess: async (data) => {
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new StorageEvent("storage"));

      await router.invalidate();
      await router.navigate({ to: "/dashboard" });
    },
  });
}

export { useLogin, useRegister };
