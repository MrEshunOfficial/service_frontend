// app/(auth)/layout.tsx
import AuthHeader from "@/components/headerUi/AuthHeader";
import BaseLayout from "@/components/layout/BaseLayout";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout maxWidth="container mx-auto max-w-7xl">
      {/* Main container with full viewport height */}
      <div className="h-[99vh] flex flex-col">
        {/* Header - responsive height */}
        <div className="flex-shrink-0">
          <AuthHeader />
        </div>

        {/* Main content area - takes remaining height */}
        <main className="flex-1 mt-1 p-1 border rounded-md overflow-hidden">
          {children}
        </main>
      </div>
    </BaseLayout>
  );
}
