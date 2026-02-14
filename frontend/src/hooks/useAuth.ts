import { useCallback, useSyncExternalStore } from "react";

function getToken() {
  return localStorage.getItem("token");
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken, () => null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  return { isAuthenticated: !!token, token, logout };
}
