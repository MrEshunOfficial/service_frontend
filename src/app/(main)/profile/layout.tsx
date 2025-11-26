// profile/layout.tsx
import React from "react";
import UserProfileNav from "@/components/layout/UserProfileNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className=" w-full
        flex flex-col h-screen gap-1
        md:flex-row md:h-[92vh]
      ">
      {/* Sidebar - responsive width & collapsible */}
      <aside
        className="
          w-full h-auto 
          border p-2 rounded md:w-64 md:h-full md:border-r 
        ">
        <UserProfileNav />
      </aside>

      {/* Main content */}
      <section
        className="
          flex-1 p-2 border rounded h-full 
          overflow-hidden
        ">
        {children}
      </section>
    </div>
  );
}
