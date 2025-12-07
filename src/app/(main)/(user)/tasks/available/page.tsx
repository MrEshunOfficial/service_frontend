"use client";
import { FloatingTasksPage } from "@/components/tasks/consolidated.task";
import { useUnmatchedTasks } from "@/hooks/useTask";

export default function AvailableTask() {
  const { tasks, loading, error, refetch } = useUnmatchedTasks();
  console.log(tasks);
  return (
    <div className="w-full h-full p-2 flex flex-col">
      <FloatingTasksPage />
    </div>
  );
}
