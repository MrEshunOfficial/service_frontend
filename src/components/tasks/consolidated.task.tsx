// pages/provider/recent-tasks.tsx
import React, { useState } from "react";
import {
  useRecentTasks,
  useExpressInterest,
  useFloatingTasks,
} from "@/hooks/useTask";
import {
  TaskDTO,
  TaskPriority,
  TaskStatus,
  enrichTaskWithComputed,
} from "@/types/task.types";
import { Clock, MapPin, Calendar, Loader2, RefreshCw } from "lucide-react";

export default function RecentTasksPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Fetch recent tasks
  const {
    tasks: recentTasks,
    loading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useRecentTasks();

  // Express interest hook
  const {
    loading: expressingInterest,
    error: interestError,
    expressInterest,
  } = useExpressInterest({
    onSuccess: () => {
      setSelectedTask(null);
      refetchRecent();
    },
  });

  const handleExpressInterest = async (taskId: string) => {
    try {
      await expressInterest({
        taskId,
        message: "I'm interested in this task and available to help!",
      });
    } catch (error) {
      console.error("Failed to express interest:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Recently Posted Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse the latest tasks posted by customers in your area
            </p>
          </div>
          <button
            onClick={refetchRecent}
            disabled={recentLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${recentLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Error Display */}
        {(recentError || interestError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400 text-sm">
              {recentError?.message ||
                interestError?.message ||
                "An error occurred"}
            </p>
          </div>
        )}

        {/* Loading State */}
        {recentLoading && !recentTasks && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
          </div>
        )}

        {/* Empty State */}
        {!recentLoading && recentTasks && recentTasks.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent tasks
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no recently posted tasks at the moment. Check back soon!
            </p>
          </div>
        )}

        {/* Task List */}
        {!recentLoading && recentTasks && recentTasks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onExpressInterest={handleExpressInterest}
                isExpressing={expressingInterest && selectedTask === task._id}
                onSelectTask={() => setSelectedTask(task._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: TaskDTO;
  onExpressInterest: (taskId: string) => void;
  isExpressing: boolean;
  onSelectTask: () => void;
}

function TaskCard({
  task,
  onExpressInterest,
  isExpressing,
  onSelectTask,
}: TaskCardProps) {
  const enrichedTask = enrichTaskWithComputed(task);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800";
      case TaskPriority.HIGH:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case TaskPriority.LOW:
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      [TaskStatus.OPEN]: {
        label: "Open",
        color:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
      },
      [TaskStatus.FLOATING]: {
        label: "Floating",
        color:
          "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400",
      },
      [TaskStatus.REQUESTED]: {
        label: "Requested",
        color:
          "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400",
      },
      [TaskStatus.ASSIGNED]: {
        label: "Assigned",
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-2">
            {task.title}
          </h3>
          {getStatusBadge(task.status)}
        </div>

        {/* Priority and Time */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              task.schedule.urgency
            )}`}
          >
            {task.schedule.urgency.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Posted {formatTimeAgo(task.createdAt)}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {task.location.providerLocality}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Date
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(task.schedule.preferredDate)}
            </p>
            {task.schedule.timeSlot && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {task.schedule.timeSlot.startTime} -{" "}
                {task.schedule.timeSlot.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            {enrichedTask.matchCount > 0 && (
              <span>{enrichedTask.matchCount} matches</span>
            )}
            {enrichedTask.interestCount > 0 && (
              <span>{enrichedTask.interestCount} interested</span>
            )}
            {task.viewCount > 0 && <span>{task.viewCount} views</span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => {
            onSelectTask();
            onExpressInterest(task._id);
          }}
          disabled={isExpressing}
          className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isExpressing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Expressing Interest...
            </>
          ) : (
            "Express Interest"
          )}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// pages/provider/floating-tasks.tsx
// =============================================================================

export function FloatingTasksPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Fetch floating tasks
  const {
    tasks: floatingTasks,
    loading: floatingLoading,
    error: floatingError,
    refetch: refetchFloating,
  } = useFloatingTasks();

  // Express interest hook
  const {
    loading: expressingInterest,
    error: interestError,
    expressInterest,
  } = useExpressInterest({
    onSuccess: () => {
      setSelectedTask(null);
      refetchFloating();
    },
  });

  const handleExpressInterest = async (taskId: string) => {
    try {
      const interest = await expressInterest({
        taskId,
        message: "I'm interested in this task and available to help!",
      });
      console.log(interest);
    } catch (error) {
      console.error("Failed to express interest:", error);
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Floating Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tasks with no matches yet - express interest to get noticed
            </p>
          </div>
          <button
            onClick={refetchFloating}
            disabled={floatingLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${floatingLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-400 text-sm">
            💡 <strong>Tip:</strong> Floating tasks have no automatic matches
            yet. By expressing interest, you'll be directly notified to the
            customer!
          </p>
        </div>

        {/* Error Display */}
        {(floatingError || interestError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400 text-sm">
              {floatingError?.message ||
                interestError?.message ||
                "An error occurred"}
            </p>
          </div>
        )}

        {/* Loading State */}
        {floatingLoading && !floatingTasks && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
          </div>
        )}

        {/* Empty State */}
        {!floatingLoading && floatingTasks && floatingTasks.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No floating tasks
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All tasks currently have matches. Check back later or browse
              recent tasks!
            </p>
          </div>
        )}

        {/* Task List */}
        {!floatingLoading && floatingTasks && floatingTasks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {floatingTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onExpressInterest={handleExpressInterest}
                isExpressing={expressingInterest && selectedTask === task._id}
                onSelectTask={() => setSelectedTask(task._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
