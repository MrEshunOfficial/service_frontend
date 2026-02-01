"use client";
import { useState, useMemo } from "react";
import { useCustomerTasks } from "@/hooks/useTasksAndBookings";
import { Task, TaskStatus, TASK_STATUS_LABELS } from "@/types/task.types";
import {
  MapPin,
  Search,
  Filter,
  Plus,
  UserCheck,
  Users,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";
import Link from "next/link";

const CustomerTasksPage = () => {
  const { tasks, loading, error, requestProvider, refreshTasks } =
    useCustomerTasks();

  console.log(tasks);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingProvider, setRequestingProvider] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const renderProviderCard = (provider: any, task: Task) => {
    const providerProfile = provider.providerId as PopulatedProviderProfile;
    const isRequestingThisProvider =
      selectedProviderId === providerProfile._id.toString() &&
      selectedTaskId === task._id;

    return (
      <div
        key={providerProfile._id.toString()}
        className="flex items-start gap-3 border border-gray-200 dark:border-gray-800 rounded-lg p-3"
      >
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
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-2 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg"
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
    <div className="min-h-screen p-3">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            My Tasks
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm">
          <Plus className="w-4 h-4" />
          Post New Task
        </button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                Status:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const matchedCount = task.matchedProviders?.length || 0;
            const interestedCount = task.interestedProviders?.length || 0;
            const hasProviders = matchedCount > 0 || interestedCount > 0;

            return (
              <div
                key={task._id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-950/50 transition-all border border-gray-200 dark:border-gray-800 p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Title - takes up remaining space */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {task.title}
                    </h3>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 shrink-0">
                    <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <span className="hidden sm:inline truncate max-w-[120px]">
                      {task.customerLocation.ghanaPostGPS}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusColor(
                      task.status,
                    )}`}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </span>

                  {/* View Providers Button - only show if has providers and not requested/accepted */}
                  {hasProviders &&
                    task.status !== TaskStatus.REQUESTED &&
                    task.status !== TaskStatus.ACCEPTED && (
                      <Sheet
                        open={openSheet && selectedTask?._id === task._id}
                        onOpenChange={(open) => {
                          setOpenSheet(open);
                          if (open) {
                            setSelectedTask(task);
                          } else {
                            setSelectedTask(null);
                            setSelectedProviderId(null);
                            setSelectedTaskId(null);
                            setRequestMessage("");
                          }
                        }}
                      >
                        <SheetTrigger asChild>
                          <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white rounded text-xs font-medium transition-colors shrink-0">
                            matched providers
                            <Users className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {matchedCount > 0
                                ? matchedCount
                                : interestedCount}
                            </span>
                          </button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-sm overflow-y-auto p-4">
                          <SheetHeader>
                            <SheetTitle>
                              {matchedCount > 0
                                ? "Matched Providers"
                                : "Interested Providers"}
                            </SheetTitle>
                          </SheetHeader>
                          <div className="mt-2 space-y-4">
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
                        </SheetContent>
                      </Sheet>
                    )}

                  {/* External Link */}
                  <Link
                    href={`/client/tasks/posted/${task._id}`}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerTasksPage;
