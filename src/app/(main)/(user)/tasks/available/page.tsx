"use client";
import { useState } from "react";
import { useProviderMatchedTasks } from "@/hooks/useTasksAndBookings";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/types/task.types";

const AvailableTasksPage = () => {
  const { tasks, loading, error, respondToRequest, refreshTasks } =
    useProviderMatchedTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [respondingToTask, setRespondingToTask] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const handleAccept = async (taskId: string) => {
    if (!responseMessage.trim()) {
      alert("Please provide a message to the client");
      return;
    }

    setRespondingToTask(taskId);
    try {
      const response = await respondToRequest(taskId, {
        action: "accept",
        message: responseMessage,
      });

      setResponseMessage("");
      setSelectedTask(null);

      // Show success message with booking info if available
      if (response.booking) {
        alert(
          `Task accepted and converted to booking! Booking ID: ${response.booking._id}`,
        );
      } else {
        alert("Task request accepted successfully!");
      }
    } catch (err) {
      alert("Failed to accept task request");
      console.error(err);
    } finally {
      setRespondingToTask(null);
    }
  };

  const handleReject = async (taskId: string) => {
    setRespondingToTask(taskId);
    try {
      await respondToRequest(taskId, {
        action: "reject",
        message: responseMessage || undefined,
      });
      setResponseMessage("");
      setSelectedTask(null);
      alert("Task request rejected");
    } catch (err) {
      alert("Failed to reject task request");
      console.error(err);
    } finally {
      setRespondingToTask(null);
    }
  };

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

  const getStatusColor = (status: TaskStatus): string => {
    const colors: Partial<Record<TaskStatus, string>> = {
      [TaskStatus.MATCHED]:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      [TaskStatus.REQUESTED]:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
      [TaskStatus.ACCEPTED]:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    };

    return (
      colors[status] ??
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
            <p className="text-red-800 dark:text-red-300 text-lg font-medium mb-2">
              Failed to load tasks
            </p>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error.message}
            </p>
            <button
              onClick={refreshTasks}
              className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              My Match History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              All tasks you've been matched with ({tasks.length}{" "}
              {tasks.length === 1 ? "match" : "matches"})
            </p>
          </div>
          <button
            onClick={refreshTasks}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-950/30 p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No match history yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Your match history will appear here as clients post tasks that
              match your services and location.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isRequested = task.status === TaskStatus.REQUESTED;
              const isAccepted = task.status === TaskStatus.ACCEPTED;
              const isConverted = task.status === TaskStatus.CONVERTED;
              const isCancelled = task.status === TaskStatus.CANCELLED;
              const isExpired = task.status === TaskStatus.EXPIRED;

              const canRespond = isRequested && !isAccepted;

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
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Location
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {task.customerLocation.ghanaPostGPS}
                          </p>
                          {task.customerLocation.nearbyLandmark && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Near {task.customerLocation.nearbyLandmark}
                            </p>
                          )}
                          {task.customerLocation.locality && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {task.customerLocation.locality}
                              {task.customerLocation.city &&
                                `, ${task.customerLocation.city}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Preferred Date
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {task.schedule.preferredDate
                              ? formatDate(task.schedule.preferredDate)
                              : "Flexible"}
                          </p>
                          {task.schedule.flexibleDates && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Flexible dates
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Budget
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Negotiable
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Posted
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
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
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.category && (
                      <div className="mb-5">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                          Category: {task.category}
                        </span>
                      </div>
                    )}

                    {canRespond && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        {selectedTask?._id === task._id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Message to Client
                              </label>
                              <textarea
                                value={responseMessage}
                                onChange={(e) =>
                                  setResponseMessage(e.target.value)
                                }
                                placeholder="Introduce yourself and explain why you're a good fit for this task..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-colors"
                              />
                            </div>
                            <div className="flex gap-3 flex-col sm:flex-row">
                              <button
                                onClick={() => handleAccept(task._id)}
                                disabled={respondingToTask === task._id}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                              >
                                {respondingToTask === task._id ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Accepting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-5 h-5" />
                                    Accept Task
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(task._id)}
                                disabled={respondingToTask === task._id}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                              >
                                {respondingToTask === task._id ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-5 h-5" />
                                    Reject Task
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTask(null);
                                  setResponseMessage("");
                                }}
                                disabled={respondingToTask === task._id}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center justify-between bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg gap-4">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              <div>
                                <p className="font-medium text-yellow-900 dark:text-yellow-300">
                                  Client has requested you for this task
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                  Respond to let them know if you can help
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                              Respond
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {isAccepted && !isConverted && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-300">
                              You've accepted this task
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-400">
                              Waiting to be converted to a booking
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isConverted && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/30 p-4 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          <div className="flex-1">
                            <p className="font-medium text-teal-900 dark:text-teal-300">
                              Converted to Booking
                            </p>
                            <p className="text-sm text-teal-700 dark:text-teal-400">
                              This task has been successfully converted to a
                              booking
                            </p>
                          </div>
                          {task.convertedToBookingId && (
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono">
                              Booking ID: {task.convertedToBookingId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="font-medium text-red-900 dark:text-red-300">
                              Task Cancelled
                            </p>
                          </div>
                          {task.cancellationReason && (
                            <p className="text-sm text-red-700 dark:text-red-400 ml-8">
                              Reason: {task.cancellationReason}
                            </p>
                          )}
                          {task.cancelledAt && (
                            <p className="text-xs text-red-600 dark:text-red-400 ml-8 mt-1">
                              Cancelled on {formatDate(task.cancelledAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {isExpired && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-300">
                              Task Expired
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-400">
                              This task has expired and is no longer active
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

export default AvailableTasksPage;
