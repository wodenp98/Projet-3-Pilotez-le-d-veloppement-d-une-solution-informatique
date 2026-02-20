import { beforeEach, describe, expect, it } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import api from "../axios";

describe("api axios instance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("has the correct baseURL", () => {
    expect(api.defaults.baseURL).toBe("/api");
  });

  it("adds the Authorization header when a token exists", async () => {
    localStorage.setItem("token", "test-jwt-token");
    const handler = api.interceptors.request.handlers?.[0];
    if (!handler?.fulfilled) throw new Error("No request interceptor found");
    const config = await handler.fulfilled({
      headers: new (await import("axios")).AxiosHeaders(),
    } as unknown as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBe("Bearer test-jwt-token");
  });

  it("does not add the Authorization header without a token", async () => {
    const handler = api.interceptors.request.handlers?.[0];
    if (!handler?.fulfilled) throw new Error("No request interceptor found");
    const config = await handler.fulfilled({
      headers: new (await import("axios")).AxiosHeaders(),
    } as unknown as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
