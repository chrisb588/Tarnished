import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  adminLogin,
  getAdminToken,
  verifyAdminToken,
  adminLogout,
} from "../api/admin";
import apiClient from "../lib/apiClient";

vi.mock("../lib/apiClient");

beforeEach(() => {
  sessionStorage.clear();
});

describe("adminLogin", () => {
  it("stores token on success", async () => {
    apiClient.post.mockResolvedValue({
      status: 200,
      data: { access_token: "test-token" },
    });
    await adminLogin("admin", "password");
    expect(sessionStorage.getItem("adminToken")).toBe("test-token");
  });

  it("returns error detail on failure", async () => {
    apiClient.post.mockResolvedValue({
      status: 401,
      data: { detail: "Invalid admin credentials" },
    });
    const result = await adminLogin("wrong", "creds");
    expect(result).toBe("Invalid admin credentials");
    expect(sessionStorage.getItem("adminToken")).toBeNull();
  });
});

describe("getAdminToken", () => {
  it("returns token from sessionStorage", () => {
    sessionStorage.setItem("adminToken", "test-token");
    expect(getAdminToken()).toBe("test-token");
  });

  it("returns null when no token exists", () => {
    expect(getAdminToken()).toBeNull();
  });
});

describe("verifyAdminToken", () => {
  it("returns true when token is valid", async () => {
    sessionStorage.setItem("adminToken", "test-token");
    apiClient.get.mockResolvedValue({ status: 200 });
    const result = await verifyAdminToken();
    expect(result).toBe(true);
  });

  it("returns false when token is invalid", async () => {
    sessionStorage.setItem("adminToken", "expired-token");
    apiClient.get.mockResolvedValue({ status: 401 });
    const result = await verifyAdminToken();
    expect(result).toBe(false);
  });
});

describe("adminLogout", () => {
  it("removes token from sessionStorage", () => {
    sessionStorage.setItem("adminToken", "test-token");
    adminLogout();
    expect(sessionStorage.getItem("adminToken")).toBeNull();
  });
});
