"use client";
import { useRouter } from "next/navigation";
import UserProfileNav from "@/components/layout/UserProfileNav";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Handle post task action
  const handlePostTask = () => {
    router.push("/");
  };
  const handleBrowseTask = () => {
    console.log("Recently posted task");
    router.push("/tasks/recently-posted");
  };

  return (
    <div className="w-full h-full flex gap-2">
      <aside className="w-80 h-full p-2 border rounded">
        <UserProfileNav
          onPostTask={handlePostTask}
          onBrowseTasks={handleBrowseTask}
        />
      </aside>
      <ScrollArea className="flex-1 h-full p-4 overflow-y-auto">
        {children}
      </ScrollArea>
    </div>
  );
}
