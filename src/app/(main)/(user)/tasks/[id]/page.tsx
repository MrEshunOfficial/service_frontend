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
    toast.success("Task updated successfully");
  };

  const handleRequestProvider = () => {
    toast.success("Provider request sent successfully");
  };

  const handleCancel = () => {
    toast.success("Task cancelled successfully");
    setTimeout(() => {
      router.push("/customer/tasks");
    }, 1500);
  };

  const handleDelete = async (taskId: string) => {
    try {
      // Show confirmation dialog
      if (
        !confirm(
          "Are you sure you want to delete this task? This action cannot be undone.",
        )
      ) {
        return;
      }

      await taskAPI.deleteTask(taskId);
      toast.success("Task deleted successfully");

      // Redirect to tasks list
      setTimeout(() => {
        router.push("/customer/tasks");
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete task");
      throw error;
    }
  };

  const handleRematch = async (
    taskId: string,
    data?: { strategy?: "intelligent" | "location-only" },
  ) => {
    try {
      const strategyLabel =
        data?.strategy === "location-only" ? "location-based" : "intelligent";

      toast.loading(`Finding providers using ${strategyLabel} matching...`);

      const result = await taskAPI.rematchTask(taskId, data);

      toast.dismiss();

      if (result.matchedProviders && result.matchedProviders.length > 0) {
        toast.success(
          `Found ${result.matchedProviders.length} matching provider${
            result.matchedProviders.length > 1 ? "s" : ""
          }!`,
        );
      } else {
        toast.warning(
          "No providers found. Try location-based matching or adjust your task details.",
        );
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || "Failed to rematch task");
      throw error;
    }
  };

  const handleExpressInterest = async (taskId: string, message?: string) => {
    try {
      toast.loading("Sending your interest...");

      await taskAPI.expressInterest(taskId, { message });

      toast.dismiss();
      toast.success("Interest sent to customer successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || "Failed to express interest");
      throw error;
    }
  };

  const handleRespondToRequest = async (
    taskId: string,
    data: { action: "accept" | "reject"; message?: string },
  ) => {
    try {
      const actionLabel = data.action === "accept" ? "Accepting" : "Rejecting";
      toast.loading(`${actionLabel} task request...`);

      const response = await taskAPI.respondToRequest(taskId, data);

      toast.dismiss();

      if (data.action === "accept") {
        toast.success("Task accepted successfully! Creating your booking...");

        // Navigate to booking if created
        const bookingId = response?.booking?._id;
        if (bookingId) {
          setTimeout(() => {
            router.push(`/provider/bookings/${bookingId}`);
          }, 1500);
        } else {
          // Fallback to provider bookings list
          setTimeout(() => {
            router.push("/provider/bookings");
          }, 1500);
        }
      } else {
        toast.success("Task request declined");
        setTimeout(() => {
          router.push("/provider/tasks/matched");
        }, 1000);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || `Failed to ${data.action} request`);
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
            onClick={() => router.push("/customer/tasks")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TaskDetails
        taskId={taskId}
        userRole={UserRole.CUSTOMER}
        useTaskHook={useTask}
        onUpdate={handleUpdate}
        onRequestProvider={handleRequestProvider}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onRematch={handleRematch}
        onExpressInterest={handleExpressInterest}
        onRespondToRequest={handleRespondToRequest}
      />
    </>
  );
}
