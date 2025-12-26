// app/(auth)/layout.tsx
import AuthHeader from "@/components/headerUi/AuthHeader";
import BaseLayout from "@/components/layout/BaseLayout";
import { BackgroundOverlay } from "@/components/ui/LoadingOverlay";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout maxWidth="container mx-auto max-w-7xl relative p-3">
      <BackgroundOverlay />
      {/* Main container with full viewport height */}
      <main className="h-[96vh] p-1 overflow-hidden hide-scrollbar">
        {children}
      </main>
    </BaseLayout>
  );
}
