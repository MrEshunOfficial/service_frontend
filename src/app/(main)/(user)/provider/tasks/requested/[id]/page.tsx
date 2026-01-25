"use client";
import React, { useState } from "react";
import { useProviderRequestedTask } from "@/hooks/useTasksAndBookings";
import { ProviderResponseRequestBody, TaskStatus } from "@/types/task.types";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Mail,
  Tag,
  AlertTriangle,
  Check,
  ArrowRight,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { BackgroundOverlay } from "@/components/ui/LoadingOverlay";

const RequestedTaskDetails: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { task, loading, error, respondToRequest } =
    useProviderRequestedTask(taskId);

  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseAction, setResponseAction] = useState<"accept" | "reject">(
    "accept",
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    setSubmitting(true);

    try {
      const responseData: ProviderResponseRequestBody = {
        action: responseAction,
        message: message || undefined,
      };

      const response = await respondToRequest(responseData);

      // If accepting and a booking was created, navigate to it
      if (responseAction === "accept" && response.booking) {
        router.push(`/tasks/provider/bookings/${response.booking._id}`);
      } else {
        router.push("/tasks/requested");
      }
    } catch (err) {
      console.error("Failed to respond to task:", err);
      alert("Failed to submit response. Please try again.");
      setSubmitting(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCustomerName = () => {
    if (!task?.customerId) return "Unknown Customer";
    if (typeof task.customerId === "object" && task.customerId !== null) {
      return task.customerId.name || "Unknown Customer";
    }
    return "Unknown Customer";
  };

  const getCustomerEmail = () => {
    if (!task?.customerId) return null;
    if (typeof task.customerId === "object" && task.customerId !== null) {
      return task.customerId.email || null;
    }
    return null;
  };

  // ✅ Status checks
  const isAccepted = task?.status === TaskStatus.ACCEPTED;
  const isConverted = task?.status === TaskStatus.CONVERTED;
  const isCancelled = task?.status === TaskStatus.CANCELLED;
  const isExpired = task?.status === TaskStatus.EXPIRED;
  const canRespond =
    task?.status === TaskStatus.REQUESTED &&
    !isAccepted &&
    !isConverted &&
    !isCancelled &&
    !isExpired;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
        <BackgroundOverlay />
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading task details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
        <BackgroundOverlay />
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-red-900 dark:text-red-100 font-bold text-lg text-center mb-2">
              Error Loading Task
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm text-center mb-4">
              {error?.message || "Task not found"}
            </p>
            <button
              onClick={() => router.push("/tasks/requested")}
              className="w-full inline-flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to requested tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Get status badge component
  const getStatusBadge = () => {
    if (isConverted) {
      return (
        <span className="bg-linear-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 inline-flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          CONVERTED TO BOOKING
        </span>
      );
    }

    if (isAccepted) {
      return (
        <span className="bg-linear-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-800 dark:text-blue-200 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 inline-flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5" />
          ALREADY ACCEPTED
        </span>
      );
    }

    if (isCancelled) {
      return (
        <span className="bg-linear-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 text-red-800 dark:text-red-200 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800 inline-flex items-center gap-2">
          <XCircle className="w-3.5 h-3.5" />
          CANCELLED
        </span>
      );
    }

    if (isExpired) {
      return (
        <span className="bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 text-gray-800 dark:text-gray-200 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 inline-flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          EXPIRED
        </span>
      );
    }

    return (
      <span className="bg-linear-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
        REQUESTED
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <BackgroundOverlay />
      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 py-8">
        <button
          onClick={() => router.push("/tasks/requested")}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to requested tasks
        </button>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6 shadow-xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge()}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {task.title}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* ✅ Show status message for non-actionable tasks */}
          {!canRespond && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isConverted
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  : isAccepted
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {isConverted ? (
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : isAccepted ? (
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 ${
                      isConverted
                        ? "text-green-900 dark:text-green-100"
                        : isAccepted
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {isConverted
                      ? "Task Converted to Booking"
                      : isAccepted
                        ? "Task Already Accepted"
                        : isCancelled
                          ? "Task Cancelled"
                          : "Task Expired"}
                  </h3>
                  <p
                    className={`text-sm ${
                      isConverted
                        ? "text-green-800 dark:text-green-200"
                        : isAccepted
                          ? "text-blue-800 dark:text-blue-200"
                          : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {isConverted
                      ? "This task has been successfully converted to a booking. You can view the booking details below."
                      : isAccepted
                        ? "You have already accepted this task. The booking will be created shortly."
                        : isCancelled
                          ? "This task has been cancelled and is no longer available."
                          : "This task has expired and is no longer available for acceptance."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
              Customer Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Customer
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {getCustomerName()}
                  </p>
                </div>
              </div>
              {getCustomerEmail() && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {getCustomerEmail()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
              Task Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-linear-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <div className="text-gray-900 dark:text-gray-100">
                    {task.customerLocation.ghanaPostGPS && (
                      <span className="block font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mb-1">
                        {task.customerLocation.ghanaPostGPS}
                      </span>
                    )}
                    <p>
                      {task.customerLocation.locality && (
                        <span>{task.customerLocation.locality}, </span>
                      )}
                      {task.customerLocation.city && (
                        <span>{task.customerLocation.city}, </span>
                      )}
                      {task.customerLocation.region}
                    </p>
                  </div>
                </div>
              </div>

              {task.schedule?.preferredDate && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Preferred Date
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {formatDate(task.schedule.preferredDate)}
                    </p>
                  </div>
                </div>
              )}

              {task.schedule?.timeSlot && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Preferred Time
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {task.schedule.timeSlot.start} -{" "}
                      {task.schedule.timeSlot.end}
                    </p>
                  </div>
                </div>
              )}

              {task.schedule?.priority && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Priority
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                      {task.schedule.priority}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {task.requestedProvider?.clientMessage && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
                Customer's Message
              </h2>
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                  "{task.requestedProvider.clientMessage}"
                </p>
              </div>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✅ UPDATED: Conditional action buttons based on task status */}
        {canRespond && !showResponseForm ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setResponseAction("accept");
                setShowResponseForm(true);
                setMessage(
                  "I accept this task and will contact you soon to confirm the details.",
                );
              }}
              className="flex-1 bg-linear-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Accept Request
            </button>
            <button
              onClick={() => {
                setResponseAction("reject");
                setShowResponseForm(true);
                setMessage("");
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Decline Request
            </button>
          </div>
        ) : canRespond && showResponseForm ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              {responseAction === "accept" ? (
                <>
                  <div className="w-10 h-10 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Accept Request
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-linear-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  Decline Request
                </>
              )}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Message to Customer{" "}
                {responseAction === "reject" && (
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    (Optional)
                  </span>
                )}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder={
                  responseAction === "accept"
                    ? "Let the customer know you accept..."
                    : "Optionally explain why you cannot accept this task..."
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmitResponse}
                disabled={submitting}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  responseAction === "accept"
                    ? "bg-linear-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                    : "bg-linear-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 dark:from-red-500 dark:to-orange-500 dark:hover:from-red-600 dark:hover:to-orange-600 text-white shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Confirm {responseAction === "accept" ? "Accept" : "Decline"}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowResponseForm(false)}
                disabled={submitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isConverted && task.convertedToBookingId ? (
          <button
            onClick={() =>
              router.push(
                `/tasks/provider/bookings/${task.convertedToBookingId}`,
              )
            }
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            View Booking Details
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default RequestedTaskDetails;
