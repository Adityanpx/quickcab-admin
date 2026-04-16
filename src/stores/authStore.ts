import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenStorage } from "@/lib/api/client";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  setAdmin: (admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,

      setAdmin: (admin) =>
        set({ admin, isAuthenticated: true }),

      logout: () => {
        tokenStorage.clear();
        set({ admin: null, isAuthenticated: false });
      },
    }),
    {
      name: "qc_admin_auth",
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
