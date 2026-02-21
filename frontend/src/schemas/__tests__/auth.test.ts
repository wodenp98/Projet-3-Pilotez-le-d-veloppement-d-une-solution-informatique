import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../auth";

describe("loginSchema", () => {
  it("validates correct data", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "monmotdepasse" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "pas-un-email", password: "monmotdepasse" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct data", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password that is too short", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "court",
      confirmPassword: "court",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatching passwords", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "password123",
      confirmPassword: "different456",
    });
    expect(result.success).toBe(false);
  });
});
