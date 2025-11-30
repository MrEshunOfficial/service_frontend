// app/(auth)/layout.tsx
import AuthHeader from "@/components/headerUi/AuthHeader";
import BaseLayout from "@/components/layout/BaseLayout";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout maxWidth="container mx-auto max-w-7xl">
      {/* Main container with full viewport height */}
      <div className="flex flex-col">
        {/* Header - responsive height */}
        <div className="flex-shrink-0">
          <AuthHeader />
        </div>

        {/* Main content area - takes remaining height */}
        <main className="max-h-[90vh] mt-1 p-1 border rounded-md overflow-auto hide-scrollbar">
          {children}
        </main>
      </div>
    </BaseLayout>
  );
}
