"use client";

// app/(admin)/layout.tsx
import AdminHeader from "@/components/headerUi/AdminHeader";
import BaseLayout from "@/components/layout/BaseLayout";
import LoadingOverlay, {
  BackgroundOverlay,
} from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/hooks/auth/useAuth";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingOverlay
        show={true}
        message="Getting admin ready... please wait"
      />
    );
  }

  return (
    <BaseLayout maxWidth="container">
      <div className="w-full h-screen flex flex-col p-2 relative">
        <BackgroundOverlay />
        {/* Content */}
        <main
          className="w-full h-full overflow-auto
         flex items-center justify-center border rounded
        "
        >
          {children}
        </main>
      </div>
    </BaseLayout>
  );
}
