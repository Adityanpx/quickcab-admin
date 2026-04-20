import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// ─── Token Helpers ────────────────────────────────────────
const TOKEN_KEY = "qc_admin_token";
const REFRESH_KEY = "qc_admin_refresh";

export const tokenStorage = {
  getToken: () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  getRefresh: () =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Axios Instance ───────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // 65 s — long enough to survive Render free-tier cold starts (~50 s)
  timeout: 65000,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "ADMIN",
  },
});

// ─── Request Interceptor — Attach Token ───────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `%c[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      "color: #5E5CE6; font-weight: bold"
    );
    console.log("[API REQUEST] Headers:", {
      "Content-Type": config.headers["Content-Type"],
      "X-Client-Type": config.headers["X-Client-Type"],
      Authorization: token ? `Bearer ${token.slice(0, 20)}...` : "none",
    });
    if (config.data) {
      const safeData = { ...config.data };
      if (safeData.password) safeData.password = "***hidden***";
      console.log("[API REQUEST] Body:", safeData);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle 401 + Refresh ─────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `%c[API RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      "color: #02E642; font-weight: bold"
    );
    console.log("[API RESPONSE] Data:", response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── Log every error ──────────────────────────────────
    console.error(
      `%c[API ERROR] ${error.response?.status ?? "NETWORK"} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
      "color: #FF453A; font-weight: bold"
    );
    console.error("[API ERROR] Status:", error.response?.status);
    console.error("[API ERROR] Response data:", error.response?.data);
    console.error("[API ERROR] Message:", error.message);
    if (!error.response) {
      console.error(
        "[API ERROR] No response received — possible causes: server is down, CORS blocked, or wrong URL.",
        "\n  → URL attempted:", `${BASE_URL}${originalRequest.url}`
      );
    }

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ── Never redirect on auth endpoints — 401 here means wrong
      //    credentials, not session expiry. Redirecting would cause a
      //    hard page reload that wipes the console before the error
      //    reaches the UI catch block.
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register");
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      const refreshToken = tokenStorage.getRefresh();

      // No refresh token — go to login
      if (!refreshToken) {
        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/admin/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } =
          response.data.data;
        tokenStorage.setTokens(accessToken, newRefresh);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
