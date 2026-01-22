"use client";

import { useParams, useRouter } from "next/navigation";
import { useTask } from "@/hooks/useTasksAndBookings";
import TaskDetails from "@/components/tasks/TaskDetails";
import { taskAPI } from "@/lib/api/task/task.api";
import { AlertCircle } from "lucide-react";
import { UserRole } from "@/types/base.types";
import { toast } from "sonner";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const handleUpdate = () => {
    console.log("Task updated successfully");
    // TODO: Add toast notification
  };

  const handleRequestProvider = () => {
    console.log("Provider requested successfully");
    // TODO: Add toast notification
  };

  const handleCancel = () => {
    console.log("Task cancelled successfully");
    // TODO: Add toast notification
    setTimeout(() => {
      router.push("/tasks/posted");
    }, 1500);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskAPI.deleteTask(taskId);
      toast.success("Task deleted successfully");
      router.push("/tasks/posted");
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const handleRematch = async (
    taskId: string,
    data?: { strategy?: "intelligent" | "location-only" }
  ) => {
    try {
      await taskAPI.rematchTask(taskId, data);
      console.log("Task rematched successfully");
      // TODO: Add toast notification
    } catch (error) {
      console.error("Error rematching task:", error);
      // TODO: Add error toast notification
      throw error;
    }
  };

  const handleExpressInterest = async (taskId: string, message?: string) => {
    try {
      await taskAPI.expressInterest(taskId, { message });
      console.log("Interest expressed successfully");
      // TODO: Add toast notification
    } catch (error) {
      console.error("Error expressing interest:", error);
      // TODO: Add error toast notification
      throw error;
    }
  };

  const handleRespondToRequest = async (
    taskId: string,
    data: { action: "accept" | "reject"; message?: string }
  ) => {
    try {
      await taskAPI.respondToRequest(taskId, data);
      console.log(`Request ${data.action}ed successfully`);
      // TODO: Add toast notification
    } catch (error) {
      console.error("Error responding to request:", error);
      // TODO: Add error toast notification
      throw error;
    }
  };

  // Invalid task ID
  if (!taskId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-semibold mb-2">
            Invalid Task ID
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The task ID provided is not valid.
          </p>
          <button
            onClick={() => router.push("/tasks")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <TaskDetails
      taskId={taskId}
      userRole={UserRole.CUSTOMER ? "customer" : "provider"}
      useTaskHook={useTask}
      onUpdate={handleUpdate}
      onRequestProvider={handleRequestProvider}
      onCancel={handleCancel}
      onDelete={handleDelete}
      onRematch={handleRematch}
      onExpressInterest={handleExpressInterest}
      onRespondToRequest={handleRespondToRequest}
    />
  );
}
