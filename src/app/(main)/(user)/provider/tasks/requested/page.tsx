"use client";
import React, { useState } from "react";
import { useProviderRequestedTasks } from "@/hooks/useTasksAndBookings";
import {
  Task,
  ProviderResponseRequestBody,
  TaskStatus,
} from "@/types/task.types";
import {
  Clock,
  MapPin,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Check,
  Calendar,
  ExternalLink,
  ExpandIcon,
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
    router.push(`/provider/tasks/requested/${taskId}`);
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/provider/tasks/bookings/${bookingId}`);
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
              Customers have specifically requested you
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {tasks.length} {tasks.length === 1 ? "Request" : "Requests"}
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

        <div className="space-y-3">
          {tasks.map((task) => (
            <CompactTaskCard
              key={task._id}
              task={task}
              onAccept={() => handleQuickAccept(task._id)}
              onReject={() => handleQuickReject(task._id)}
              onViewDetails={() => handleViewDetails(task._id)}
              onViewBooking={
                task.convertedToBookingId
                  ? () => handleViewBooking(task.convertedToBookingId!)
                  : undefined
              }
              isProcessing={processingTaskId === task._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CompactTaskCardProps {
  task: Task;
  onAccept: () => void;
  onReject: () => void;
  onViewDetails: () => void;
  onViewBooking?: () => void;
  isProcessing: boolean;
}

const CompactTaskCard: React.FC<CompactTaskCardProps> = ({
  task,
  onAccept,
  onReject,
  onViewDetails,
  onViewBooking,
  isProcessing,
}) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCustomerName = () => {
    if (typeof task.customerId === "object" && task.customerId !== null) {
      return task.customerId.name || "Unknown";
    }
    return "Unknown";
  };

  // Status checks
  const isAccepted = task.status === TaskStatus.ACCEPTED;
  const isConverted = task.status === TaskStatus.CONVERTED;
  const isCancelled = task.status === TaskStatus.CANCELLED;
  const isExpired = task.status === TaskStatus.EXPIRED;

  const canAccept =
    task.status === TaskStatus.REQUESTED &&
    !isAccepted &&
    !isConverted &&
    !isCancelled &&
    !isExpired;

  // Get status indicator
  const getStatusIndicator = () => {
    if (isConverted) {
      return (
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <Check className="w-4 h-4" />
          <span className="text-xs font-semibold">Booked</span>
        </div>
      );
    }
    if (isAccepted) {
      return (
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Accepted</span>
        </div>
      );
    }
    if (isCancelled) {
      return (
        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
          <XCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Cancelled</span>
        </div>
      );
    }
    if (isExpired) {
      return (
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold">Expired</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200">
      {/* Compact Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                {task.title}
              </h3>
              {getStatusIndicator()}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">
                  {getCustomerName()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">
                  {task.customerLocation.locality || task.customerLocation.city}
                </span>
              </div>
              {task.schedule?.preferredDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(task.schedule.preferredDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {canAccept && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept();
                  }}
                  disabled={isProcessing}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Accept"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject();
                  }}
                  disabled={isProcessing}
                  className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                  title="Decline"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {isConverted && onViewBooking && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewBooking();
                }}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="View Booking"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              disabled={isProcessing}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              title="View Details"
            >
              <ExpandIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestedTasksList;
