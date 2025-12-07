"use client";
import RecentTasksPage from "@/components/tasks/consolidated.task";
import { useRecentTasks } from "@/hooks/useTask";
import React from "react";

export default function RecentlyPostedTask() {
  const { tasks, loading, error, refetch } = useRecentTasks();
  console.log(tasks);
  return (
    <div className="w-full h-full p-2 flex flex-col">
      <RecentTasksPage />
    </div>
  );
}
