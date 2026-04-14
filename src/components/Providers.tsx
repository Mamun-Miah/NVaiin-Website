"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1C1C1C",
            border: "1px solid #2E2E2E",
            color: "#F0EDE6",
            fontFamily: "var(--font-mono-brand)",
          },
        }}
      />
    </SessionProvider>
  );
}
