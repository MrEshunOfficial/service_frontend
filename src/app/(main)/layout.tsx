// app/(main)/layout.tsx
import MainHeader from "@/components/headerUi/MainHeader";
import BaseLayout from "@/components/layout/BaseLayout";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout maxWidth="container">
      <div className="w-full min-h-screen flex flex-col p-2">
        {/* Header */}
        <div className="flex-shrink-0">
          <MainHeader />
        </div>

        {/* Content */}
        <main
          className="
          flex-1 w-full mt-1 overflow-auto
         flex items-center justify-center
        ">
          {children}
        </main>
      </div>
    </BaseLayout>
  );
}
