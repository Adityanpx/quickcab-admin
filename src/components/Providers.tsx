"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            // Retry once on true network failures (timeout / offline).
            // Never retry on HTTP errors (4xx/5xx) — they won't self-heal.
            retry: (failureCount, error: unknown) => {
              const status = (error as { response?: { status?: number } })?.response?.status;
              if (status) return false;          // HTTP error → don't retry
              return failureCount < 1;           // Network error → one retry
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "Outfit, sans-serif",
              fontSize: "14px",
              borderRadius: "10px",
              padding: "12px 16px",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
