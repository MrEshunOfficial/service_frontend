"use client";
import { useState, useMemo } from "react";
import { useCustomerTasks } from "@/hooks/useTasksAndBookings";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/types/task.types";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Search,
  Filter,
  Plus,
  UserCheck,
  MessageSquare,
  Briefcase,
  ArrowRight,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";
import Link from "next/link";

const CustomerTasksPage = () => {
  const { tasks, loading, error, requestProvider, refreshTasks } =
    useCustomerTasks();

  console.log("Tasks:", tasks);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingProvider, setRequestingProvider] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleRequestProvider = async (taskId: string, providerId: string) => {
    if (!requestMessage.trim()) {
      alert("Please provide a message to the provider");
      return;
    }

    setRequestingProvider(true);
    try {
      await requestProvider(taskId, {
        providerId,
        message: requestMessage,
      });
      setRequestMessage("");
      setSelectedProviderId(null);
      setSelectedTaskId(null);
      setOpenPopover(null);
      alert("Provider requested successfully! They will be notified.");
    } catch (err) {
      alert("Failed to request provider");
    } finally {
      setRequestingProvider(false);
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return filtered;
  }, [tasks, searchQuery, filterStatus]);

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.PENDING]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      [TaskStatus.MATCHED]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      [TaskStatus.FLOATING]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
      [TaskStatus.REQUESTED]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
      [TaskStatus.ACCEPTED]:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
      [TaskStatus.CONVERTED]:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
      [TaskStatus.EXPIRED]:
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
      [TaskStatus.CANCELLED]:
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      [TaskPriority.LOW]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      [TaskPriority.MEDIUM]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      [TaskPriority.HIGH]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
      [TaskPriority.URGENT]:
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    };
    return (
      colors[priority] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const getTaskSummary = (task: Task) => {
    const matchedCount = task.matchedProviders?.length || 0;
    const interestedCount = task.interestedProviders?.length || 0;

    if (task.status === TaskStatus.MATCHED && matchedCount > 0) {
      return `${matchedCount} ${
        matchedCount === 1 ? "provider" : "providers"
      } matched`;
    }
    if (task.status === TaskStatus.FLOATING && interestedCount > 0) {
      return `${interestedCount} ${
        interestedCount === 1 ? "provider" : "providers"
      } interested`;
    }
    if (task.status === TaskStatus.REQUESTED) {
      return "Waiting for provider response";
    }
    if (task.status === TaskStatus.ACCEPTED) {
      return "Provider accepted";
    }
    return "";
  };

  const renderProviderCard = (provider: any, task: Task) => {
    const providerProfile = provider.providerId as PopulatedProviderProfile;
    const isRequestingThisProvider =
      selectedProviderId === providerProfile._id.toString() &&
      selectedTaskId === task._id;

    return (
      <div
        key={providerProfile._id.toString()}
        className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
            {providerProfile.profile?.profilePictureId?.url ? (
              <img
                src={providerProfile.profile.profilePictureId.url}
                alt={providerProfile.businessName || "Provider"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {providerProfile.businessName || "Provider"}
                </h4>
              </div>
              {provider.matchScore && (
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  {provider.matchScore}%
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
              {provider.distance !== undefined && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{provider.distance.toFixed(1)} km away</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {providerProfile.locationData.ghanaPostGPS}
                </span>
              </div>
            </div>

            {provider.matchReasons && provider.matchReasons.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {provider.matchReasons.map((reason: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 text-xs rounded"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isRequestingThisProvider ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell the provider about your task..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleRequestProvider(
                        task._id,
                        providerProfile._id.toString(),
                      )
                    }
                    disabled={requestingProvider}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {requestingProvider ? "Sending..." : "Send Request"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProviderId(null);
                      setSelectedTaskId(null);
                      setRequestMessage("");
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSelectedProviderId(providerProfile._id.toString());
                  setSelectedTaskId(task._id);
                }}
                disabled={
                  task.status === TaskStatus.REQUESTED ||
                  task.status === TaskStatus.ACCEPTED
                }
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium mt-2 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Request Provider
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3 mt-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-800 dark:text-red-200 text-lg font-medium mb-2">
              Failed to load tasks
            </p>
            <p className="text-red-600 dark:text-red-300 mb-4">
              {error.message}
            </p>
            <button
              onClick={refreshTasks}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              My Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your posted tasks and connect with service providers
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Post New Task
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-950/30 p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All
                  </button>
                  {[
                    TaskStatus.PENDING,
                    TaskStatus.MATCHED,
                    TaskStatus.FLOATING,
                    TaskStatus.REQUESTED,
                    TaskStatus.ACCEPTED,
                    TaskStatus.CONVERTED,
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {TASK_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-950/30 p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No tasks match your filters"
                : "No tasks yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by posting your first task to connect with service providers."}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                Post Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const matchedCount = task.matchedProviders?.length || 0;
              const interestedCount = task.interestedProviders?.length || 0;
              const hasProviders = matchedCount > 0 || interestedCount > 0;

              return (
                <div
                  key={task._id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-950/50 transition-all border border-gray-200 dark:border-gray-800"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="w-full flex items-center justify-between p-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              {task.title}
                            </h3>
                            <Link href={`/tasks/${task._id}`}>
                              <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </Link>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status,
                            )}`}
                          >
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.schedule.priority,
                            )}`}
                          >
                            {PRIORITY_LABELS[task.schedule.priority]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {getTaskSummary(task)}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-200 mb-5 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Location
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {task.customerLocation.ghanaPostGPS}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Date
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {task.schedule.preferredDate
                              ? formatDate(task.schedule.preferredDate)
                              : "Flexible"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Posted
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {formatDate(task.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasProviders &&
                      task.status !== TaskStatus.REQUESTED &&
                      task.status !== TaskStatus.ACCEPTED && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                          <Popover
                            open={openPopover === task._id}
                            onOpenChange={(open) => {
                              setOpenPopover(open ? task._id : null);
                              if (!open) {
                                setSelectedProviderId(null);
                                setSelectedTaskId(null);
                                setRequestMessage("");
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                                <Users className="w-5 h-5" />
                                View{" "}
                                {matchedCount > 0
                                  ? matchedCount
                                  : interestedCount}{" "}
                                {matchedCount > 0 ? "Matched" : "Interested"}{" "}
                                {(matchedCount > 0
                                  ? matchedCount
                                  : interestedCount) === 1
                                  ? "Provider"
                                  : "Providers"}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-96 p-5 max-h-[500px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-950/50"
                              align="center"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {matchedCount > 0
                                    ? "Matched Providers"
                                    : "Interested Providers"}
                                </h4>
                                <button
                                  onClick={() => {
                                    setOpenPopover(null);
                                    setSelectedProviderId(null);
                                    setSelectedTaskId(null);
                                    setRequestMessage("");
                                  }}
                                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="space-y-4">
                                {matchedCount > 0 &&
                                  task.matchedProviders?.map((provider) =>
                                    renderProviderCard(provider, task),
                                  )}
                                {interestedCount > 0 &&
                                  matchedCount === 0 &&
                                  task.interestedProviders?.map((provider) =>
                                    renderProviderCard(provider, task),
                                  )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                    {task.status === TaskStatus.REQUESTED && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <div>
                            <p className="font-medium text-yellow-900 dark:text-yellow-200">
                              Provider request sent
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Waiting for the provider to respond
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {task.status === TaskStatus.ACCEPTED && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                          <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-200">
                              Provider accepted your request
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              This will soon be converted to a booking
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTasksPage;
