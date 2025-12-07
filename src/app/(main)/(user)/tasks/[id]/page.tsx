"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  FileText,
  Edit,
  Trash2,
  PlayCircle,
  StopCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useTask,
  useDeleteTask,
  useCancelTask,
  useStartTask,
  useCompleteTask,
} from "@/hooks/useTask";
import {
  TaskStatus,
  TaskPriority,
  enrichTaskWithComputed,
} from "@/types/task.types";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    task,
    loading: taskLoading,
    error: taskError,
    refetch: refetchTask,
  } = useTask(taskId);

  const { deleteTask, loading: deleteLoading } = useDeleteTask({
    onSuccess: () => {
      router.push("/tasks/posted");
    },
  });

  const { cancelTask, loading: cancelLoading } = useCancelTask({
    onSuccess: () => {
      setShowCancelConfirm(false);
      refetchTask();
    },
  });

  const { startTask, loading: startLoading } = useStartTask({
    onSuccess: () => {
      refetchTask();
    },
  });

  const { completeTask, loading: completeLoading } = useCompleteTask({
    onSuccess: () => {
      refetchTask();
    },
  });

  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCancel = async () => {
    if (!taskId) return;
    try {
      await cancelTask(taskId, cancelReason);
    } catch (error) {
      console.error("Failed to cancel task:", error);
    }
  };

  const handleStart = async () => {
    if (!taskId) return;
    try {
      await startTask(taskId);
    } catch (error) {
      console.error("Failed to start task:", error);
    }
  };

  const handleComplete = async () => {
    if (!taskId) return;
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DRAFT:
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-800",
          icon: FileText,
          label: "Draft",
        };
      case TaskStatus.OPEN:
        return {
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          icon: Clock,
          label: "Open",
        };
      case TaskStatus.FLOATING:
        return {
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          icon: AlertCircle,
          label: "Floating",
        };
      case TaskStatus.REQUESTED:
        return {
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          icon: Users,
          label: "Requested",
        };
      case TaskStatus.ASSIGNED:
        return {
          color: "text-indigo-600 dark:text-indigo-400",
          bg: "bg-indigo-100 dark:bg-indigo-900/30",
          icon: Users,
          label: "Assigned",
        };
      case TaskStatus.IN_PROGRESS:
        return {
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          icon: RefreshCw,
          label: "In Progress",
        };
      case TaskStatus.COMPLETED:
        return {
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30",
          icon: CheckCircle,
          label: "Completed",
        };
      case TaskStatus.CANCELLED:
        return {
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/30",
          icon: XCircle,
          label: "Cancelled",
        };
      case TaskStatus.EXPIRED:
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-800",
          icon: Clock,
          label: "Expired",
        };
      default:
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-800",
          icon: FileText,
          label: status,
        };
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "text-red-600 dark:text-red-400";
      case TaskPriority.HIGH:
        return "text-orange-600 dark:text-orange-400";
      case TaskPriority.MEDIUM:
        return "text-yellow-600 dark:text-yellow-400";
      case TaskPriority.LOW:
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (taskLoading) {
    return (
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
        </div>
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Task Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {taskError?.message || "The task you're looking for doesn't exist"}
          </p>
          <button
            onClick={() => router.push("/tasks/posted")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-blue-600 text-white rounded-lg hover:from-red-600 hover:to-blue-700 transition-all font-semibold"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const enrichedTask = enrichTaskWithComputed(task);
  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  const canEdit =
    task.status === TaskStatus.DRAFT || task.status === TaskStatus.OPEN;
  const canDelete = task.status === TaskStatus.DRAFT;
  const canCancel = [
    TaskStatus.OPEN,
    TaskStatus.FLOATING,
    TaskStatus.REQUESTED,
    TaskStatus.ASSIGNED,
  ].includes(task.status);
  const canStart = task.status === TaskStatus.ASSIGNED;
  const canComplete = task.status === TaskStatus.IN_PROGRESS;

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/tasks/posted")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {task.title}
                </h1>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {task.viewCount} views
                </div>
                <div>Created {formatDateTime(task.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canEdit && (
              <button
                onClick={() => router.push(`/tasks/${taskId}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Task
              </button>
            )}

            {canStart && (
              <button
                onClick={handleStart}
                disabled={startLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                Start Task
              </button>
            )}

            {canComplete && (
              <button
                onClick={handleComplete}
                disabled={completeLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Task
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Cancel Task
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full p-2">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Location Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Client Location
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {task.location.clientLocality}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    GPS Address
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {task.location.clientGPSAddress}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Provider Area
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {task.location.providerLocality}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Schedule Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Priority
                  </label>
                  <p
                    className={`font-semibold ${getPriorityColor(
                      task.schedule.urgency
                    )}`}
                  >
                    {task.schedule.urgency.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Preferred Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(task.schedule.preferredDate)}
                  </p>
                </div>
                {task.schedule.timeSlot && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Time Slot
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {task.schedule.timeSlot.startTime} -{" "}
                      {task.schedule.timeSlot.endTime}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Provider Matches */}
            {enrichedTask.matchCount > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Matched Providers ({enrichedTask.matchCount})
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {enrichedTask.matchCount} provider
                  {enrichedTask.matchCount !== 1 ? "s" : ""} matched for this
                  task
                </p>
              </div>
            )}

            {/* Cancellation Info */}
            {task.status === TaskStatus.CANCELLED &&
              task.cancellationReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Cancellation Reason
                  </h2>
                  <p className="text-red-700 dark:text-red-300">
                    {task.cancellationReason}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Cancelled on {formatDateTime(task.cancelledAt)}
                  </p>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Priority
                  </span>
                  <span
                    className={`text-sm font-medium ${getPriorityColor(
                      task.schedule.urgency
                    )}`}
                  >
                    {task.schedule.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Views
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.viewCount}
                  </span>
                </div>
                {enrichedTask.daysUntilExpiry !== null &&
                  enrichedTask.daysUntilExpiry > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Expires in
                      </span>
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {enrichedTask.daysUntilExpiry} days
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Created
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(task.createdAt)}
                  </p>
                </div>
                {task.requestedAt && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Requested
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(task.requestedAt)}
                    </p>
                  </div>
                )}
                {task.assignedAt && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Assigned
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(task.assignedAt)}
                    </p>
                  </div>
                )}
                {task.completedAt && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(task.completedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Task
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Cancel Task
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for cancelling this task:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white mb-6"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling..." : "Cancel Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
