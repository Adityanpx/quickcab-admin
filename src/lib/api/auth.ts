import apiClient, { tokenStorage } from "./client";
import type { ApiResponse } from "@/types/api";

// ─── Dev-only debug logger (persists to sessionStorage) ──
export function debugLog(label: string, data: unknown) {
  if (typeof window === "undefined") return;
  const entry = { label, data, ts: new Date().toISOString() };
  const existing = JSON.parse(sessionStorage.getItem("__qc_debug__") || "[]");
  existing.push(entry);
  sessionStorage.setItem("__qc_debug__", JSON.stringify(existing.slice(-20)));
  console.log(`[DEBUG] ${label}`, data);
}

export function clearDebugLog() {
  if (typeof window !== "undefined") sessionStorage.removeItem("__qc_debug__");
}

export function getDebugLog(): { label: string; data: unknown; ts: string }[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(sessionStorage.getItem("__qc_debug__") || "[]");
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    debugLog("login:start", { email: payload.email });
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/admin/auth/login",
        payload
      );
      debugLog("login:raw_response", {
        status: response.status,
        data: response.data,
      });

      const data = response.data.data;

      if (!data) {
        const err = {
          reason: "response.data.data is null/undefined",
          actualShape: response.data,
        };
        debugLog("login:structure_error", err);
        throw new Error("Unexpected response structure from server");
      }
      if (!data.accessToken) {
        debugLog("login:missing_token", { keysReceived: Object.keys(data) });
      }

      const { accessToken, refreshToken, admin } = data;
      tokenStorage.setTokens(accessToken, refreshToken);
      debugLog("login:success", { admin });
      return data;
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
        code?: string;
      };
      debugLog("login:error", {
        status: axiosErr?.response?.status,
        responseData: axiosErr?.response?.data,
        message: axiosErr?.message,
        code: axiosErr?.code,
      });
      throw err;
    }
  },

  getMe: async () => {
    const response = await apiClient.get<
      ApiResponse<LoginResponse["admin"]>
    >("/admin/auth/me");
    return response.data.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/admin/auth/logout");
    } finally {
      tokenStorage.clear();
    }
  },
};
