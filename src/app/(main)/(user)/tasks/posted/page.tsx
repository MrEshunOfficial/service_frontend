"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  FileText,
  Eye,
} from "lucide-react";
import {
  useMyTasks,
  useCustomerStats,
  useRequestProvider,
} from "@/hooks/useTask";
import {
  TaskStatus,
  TaskPriority,
  enrichTaskWithComputed,
  TaskDTO,
} from "@/types/task.types";
import { InterestedProvidersPopover } from "@/components/tasks/InterestedProviders";

export default function TaskListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [selectedTaskForPopover, setSelectedTaskForPopover] =
    useState<TaskDTO | null>(null);
  const [requestingProviderId, setRequestingProviderId] = useState<
    string | null
  >(null);

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useMyTasks();

  console.log(tasks);

  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useCustomerStats();

  const { loading: requestingProvider, requestProvider } = useRequestProvider({
    onSuccess: () => {
      setSelectedTaskForPopover(null);
      setRequestingProviderId(null);
      refetchTasks();
    },
    onError: () => {
      setRequestingProviderId(null);
    },
  });

  const handleRefresh = () => {
    refetchTasks();
    refetchStats();
  };

  const handleRequestProvider = async (providerId: string) => {
    if (!selectedTaskForPopover) return;

    setRequestingProviderId(providerId);
    try {
      await requestProvider({
        taskId: selectedTaskForPopover._id,
        providerId,
        message: "I'd like to request your services for this task.",
      });
    } catch (error) {
      console.error("Failed to request provider:", error);
    }
  };

  const handleShowInterested = (task: TaskDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskForPopover(task);
  };

  // Filter and search tasks
  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Interested Providers Popover */}
      {selectedTaskForPopover && (
        <InterestedProvidersPopover
          task={selectedTaskForPopover}
          onClose={() => setSelectedTaskForPopover(null)}
          onRequestProvider={handleRequestProvider}
          isRequesting={requestingProvider}
          requestingProviderId={requestingProviderId}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Tasks
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage and track all your task requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-2">
        {/* Stats Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Tasks
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {stats.draftTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Drafts
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.openTasks}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Open
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.floatingTasks}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Floating
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.assignedTasks}
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-300">
                Assigned
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completedTasks}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Completed
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.cancelledTasks}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Cancelled
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Loading State */}
        {tasksLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading your tasks...
            </p>
          </div>
        )}

        {/* Error State */}
        {tasksError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Error loading tasks
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {tasksError.message || "Something went wrong"}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!tasksLoading && !tasksError && filteredTasks?.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No tasks found"
                : "No tasks yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first task to get started"}
            </p>
          </div>
        )}

        {/* Tasks Grid */}
        {!tasksLoading &&
          !tasksError &&
          filteredTasks &&
          filteredTasks.length > 0 && (
            <div className="grid gap-4">
              {filteredTasks.map((task) => {
                const enrichedTask = enrichTaskWithComputed(task);
                const statusConfig = getStatusConfig(task.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={task._id}
                    onClick={() => router.push(`/tasks/${task._id}`)}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {task.title}
                            </h3>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {task.location.clientLocality}
                          </div>
                          {task.schedule.preferredDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(task.schedule.preferredDate)}
                            </div>
                          )}
                          <div
                            className={`flex items-center gap-1.5 font-medium ${getPriorityColor(
                              task.schedule.urgency
                            )}`}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {task.schedule.urgency.toUpperCase()}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
                          {enrichedTask.matchCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {enrichedTask.matchCount} matched providers
                            </div>
                          )}
                          {enrichedTask.interestCount > 0 && (
                            <button
                              onClick={(e) => handleShowInterested(task, e)}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {enrichedTask.interestCount} interested
                            </button>
                          )}
                          <div>Created {formatDate(task.createdAt)}</div>
                          {enrichedTask.daysUntilExpiry !== null &&
                            enrichedTask.daysUntilExpiry > 0 && (
                              <div className="text-orange-600 dark:text-orange-400">
                                Expires in {enrichedTask.daysUntilExpiry} days
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Right Content - View Count */}
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{task.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
