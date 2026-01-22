"use client";
import React, { useState, useMemo } from "react";
import { useProviderFloatingTasks } from "@/hooks/useTasksAndBookings";
import { Task, TaskPriority, PRIORITY_LABELS } from "@/types/task.types";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Heart,
  Send,
  Filter,
  Search,
} from "lucide-react";

const RecentlyPostedTasksPage = () => {
  const { tasks, loading, error, expressInterest, refreshTasks } =
    useProviderFloatingTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [expressingInterest, setExpressingInterest] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  const handleExpressInterest = async (taskId: string) => {
    if (!interestMessage.trim()) {
      alert("Please provide a message to the client");
      return;
    }

    setExpressingInterest(taskId);
    try {
      await expressInterest(taskId, interestMessage);
      setInterestMessage("");
      setSelectedTask(null);
      alert("Interest expressed successfully! The client will be notified.");
    } catch (err) {
      alert("Failed to express interest");
    } finally {
      setExpressingInterest(null);
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
          task.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          task.category?.toLowerCase().includes(query)
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(
        (task) => task.schedule.priority === filterPriority
      );
    }

    filtered.sort((a, b) => {
      const aDistance = a.matchedProviders?.[0]?.distance || Infinity;
      const bDistance = b.matchedProviders?.[0]?.distance || Infinity;

      if (aDistance !== bDistance) return aDistance - bDistance;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [tasks, searchQuery, filterPriority]);

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      [TaskPriority.LOW]:
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      [TaskPriority.MEDIUM]:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      [TaskPriority.HIGH]:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      [TaskPriority.URGENT]:
        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
      colors[priority] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
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

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const hasExpressedInterest = (task: Task) => {
    return task.interestedProviders && task.interestedProviders.length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4].map((i) => (
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
            <p className="text-red-800 dark:text-red-300 text-lg font-medium mb-2">
              Failed to load tasks
            </p>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error.message}
            </p>
            <button
              onClick={refreshTasks}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Recently Posted Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse all available tasks and express interest to connect with
            clients
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-950/40 p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterPriority("all")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filterPriority === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All
                  </button>
                  {Object.values(TaskPriority).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setFilterPriority(priority)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        filterPriority === priority
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {PRIORITY_LABELS[priority]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-950/30 p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || filterPriority !== "all"
                ? "No tasks match your filters"
                : "No tasks available"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchQuery || filterPriority !== "all"
                ? "Try adjusting your search or filters to see more results."
                : "Check back soon for new task opportunities."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const matchData = task.matchedProviders?.[0];
              const alreadyInterested = hasExpressedInterest(task);
              const interestCount = task.interestedProviders?.length || 0;

              return (
                <div
                  key={task._id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-950/50 transition-all border border-gray-200 dark:border-gray-800"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {task.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.schedule.priority
                            )}`}
                          >
                            {PRIORITY_LABELS[task.schedule.priority]}
                          </span>
                          {task.category && (
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              {task.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getTimeAgo(task.createdAt)}
                          </span>
                          {matchData?.distance !== undefined && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                              <MapPin className="w-4 h-4" />
                              {matchData.distance.toFixed(1)} km away
                            </span>
                          )}
                          {interestCount > 0 && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Heart className="w-4 h-4" />
                              {interestCount}{" "}
                              {interestCount === 1 ? "provider" : "providers"}{" "}
                              interested
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Location
                          </p>
                          <p>{task.customerLocation.ghanaPostGPS}</p>
                          {task.customerLocation.nearbyLandmark && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Near {task.customerLocation.nearbyLandmark}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Preferred Date
                          </p>
                          <p>
                            {task.schedule.preferredDate
                              ? formatDate(task.schedule.preferredDate)
                              : "Flexible"}
                          </p>
                          {task.schedule.flexibleDates && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Flexible dates
                            </p>
                          )}
                        </div>
                      </div>

                      {task.estimatedBudget && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Budget
                            </p>
                            <p>
                              {task.estimatedBudget.min &&
                              task.estimatedBudget.max
                                ? `${formatCurrency(
                                    task.estimatedBudget.min
                                  )} - ${formatCurrency(
                                    task.estimatedBudget.max
                                  )}`
                                : task.estimatedBudget.max
                                ? `Up to ${formatCurrency(
                                    task.estimatedBudget.max
                                  )}`
                                : "Negotiable"}
                            </p>
                          </div>
                        </div>
                      )}

                      {task.schedule.timeSlot && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Time Slot
                            </p>
                            <p>
                              {task.schedule.timeSlot.start} -{" "}
                              {task.schedule.timeSlot.end}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {matchData?.matchReasons &&
                      matchData.matchReasons.length > 0 && (
                        <div className="mb-5">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Relevant to your services:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matchData.matchReasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                      {alreadyInterested ? (
                        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 dark:text-blue-300">
                              You've expressed interest in this task
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                              The client has been notified and may request you
                            </p>
                          </div>
                        </div>
                      ) : selectedTask?._id === task._id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Message to Client
                            </label>
                            <textarea
                              value={interestMessage}
                              onChange={(e) =>
                                setInterestMessage(e.target.value)
                              }
                              placeholder="Tell the client why you're interested and how you can help..."
                              rows={4}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-colors"
                            />
                          </div>
                          <div className="flex gap-3 flex-col sm:flex-row">
                            <button
                              onClick={() => handleExpressInterest(task._id)}
                              disabled={expressingInterest === task._id}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                              <Send className="w-5 h-5" />
                              {expressingInterest === task._id
                                ? "Sending..."
                                : "Send Interest"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTask(null);
                                setInterestMessage("");
                              }}
                              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                          Express Interest
                        </button>
                      )}
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
};

export default RecentlyPostedTasksPage;
