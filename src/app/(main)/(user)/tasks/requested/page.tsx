"use client";
import React, { useState } from "react";
import { useProviderRequestedTasks } from "@/hooks/useTasksAndBookings";
import { Task, ProviderResponseRequestBody } from "@/types/task.types";
import {
  Clock,
  MapPin,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BackgroundOverlay } from "@/components/ui/LoadingOverlay";

const RequestedTasksList: React.FC = () => {
  const router = useRouter();
  const { tasks, loading, error, respondToRequest, refreshTasks } =
    useProviderRequestedTasks();
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  const handleQuickAccept = async (taskId: string) => {
    setProcessingTaskId(taskId);
    try {
      const response = await respondToRequest(taskId, {
        action: "accept",
        message: "I'd be happy to help with this task!",
      });

      console.log("Task accepted:", response.task);

      // If a booking was created, navigate to it
      if (response.booking) {
        console.log("Booking created:", response.booking);
        router.push(`/tasks/provider/bookings/${response.booking._id}`);
      }
    } catch (error) {
      console.error("Failed to accept task:", error);
      alert("Failed to accept task. Please try again.");
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleQuickReject = async (taskId: string) => {
    setProcessingTaskId(taskId);
    try {
      const responseData: ProviderResponseRequestBody = {
        action: "reject",
        message: "Unfortunately, I cannot take on this task at this time.",
      };
      await respondToRequest(taskId, responseData);
    } catch (err) {
      console.error("Failed to reject task:", err);
      alert("Failed to reject task. Please try again.");
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleViewDetails = (taskId: string) => {
    router.push(`/tasks/requested/${taskId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
        <BackgroundOverlay />
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading requested tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
        <BackgroundOverlay />
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-red-900 dark:text-red-100 font-bold text-lg text-center mb-2">
              Error Loading Tasks
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm text-center mb-4">
              {error.message}
            </p>
            <button
              onClick={refreshTasks}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
        <BackgroundOverlay />
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              No Requested Tasks
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              You don't have any pending task requests at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <BackgroundOverlay />
      <div className="relative max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Requested Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
              Customers have specifically requested you for these tasks
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {tasks.length} {tasks.length === 1 ? "Request" : "Requests"}{" "}
                Pending
              </span>
            </div>
          </div>
          <button
            onClick={refreshTasks}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="space-y-5">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onAccept={() => handleQuickAccept(task._id)}
              onReject={() => handleQuickReject(task._id)}
              onViewDetails={() => handleViewDetails(task._id)}
              isProcessing={processingTaskId === task._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onAccept: () => void;
  onReject: () => void;
  onViewDetails: () => void;
  isProcessing: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onAccept,
  onReject,
  onViewDetails,
  isProcessing,
}) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCustomerName = () => {
    if (typeof task.customerId === "object" && task.customerId !== null) {
      return task.customerId.name || "Unknown Customer";
    }
    return "Unknown Customer";
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {task.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 bg-linear-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {getCustomerName()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 bg-linear-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {task.customerLocation.locality || task.customerLocation.city}
          </span>
        </div>

        {task.schedule?.preferredDate && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {formatDate(task.schedule.preferredDate)}
            </span>
          </div>
        )}
      </div>

      {task.requestedProvider?.clientMessage && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-5">
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
            <span className="font-semibold block mb-1">
              Customer's message:
            </span>
            <span className="text-blue-800 dark:text-blue-200">
              "{task.requestedProvider.clientMessage}"
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAccept}
          disabled={isProcessing}
          className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white py-3 px-5 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Accept
            </>
          )}
        </button>
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-5 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="w-5 h-5" />
          Reject
        </button>
        <button
          onClick={onViewDetails}
          disabled={isProcessing}
          className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white py-3 px-5 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-5 h-5" />
          Details
        </button>
      </div>
    </div>
  );
};

export default RequestedTasksList;
