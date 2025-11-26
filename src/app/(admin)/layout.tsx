// app/(admin)/layout.tsx
import AdminHeader from "@/components/headerUi/AdminHeader";
import BaseLayout from "@/components/layout/BaseLayout";
import AdminNav from "@/lib/utils/AdminDashboardNav";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout maxWidth="container">
      <div className="w-full min-h-screen flex flex-col p-2 gap-2">
        {/* Header */}
        <div className="flex-shrink-0">
          <AdminHeader />
        </div>

        <div className=" w-full flex flex-col gap-2 md:flex-row md:h-[93vh]">
          {/* Sidebar - responsive width & collapsible */}
          <aside className="w-full h-auto border p-2 rounded md:w-64 md:h-full md:border-r">
            <AdminNav />
          </aside>

          {/* Main content */}
          <section className="flex-1">{children}</section>
        </div>
      </div>
    </BaseLayout>
  );
}
