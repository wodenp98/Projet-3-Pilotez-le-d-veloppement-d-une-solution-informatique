import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useAuth } from "../useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns isAuthenticated=false without a token", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
  });

  it("returns isAuthenticated=true with a token", () => {
    localStorage.setItem("token", "mon-jwt");
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe("mon-jwt");
  });

  it("logout removes the token", () => {
    localStorage.setItem("token", "mon-jwt");
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("reacts to storage changes", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      localStorage.setItem("token", "nouveau-jwt");
      window.dispatchEvent(new StorageEvent("storage"));
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
