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
  Phone,
  DollarSign,
  Navigation,
  MessageSquare,
  Info,
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

  // Helper function to safely extract booking ID from response
  const extractBookingId = (response: any): string | null => {
    try {
      if (!response) return null;
      const booking = response.booking || response.data?.booking;
      if (!booking) return null;
      if (typeof booking === "string") return booking;
      if (typeof booking === "object" && booking !== null) {
        const id = booking._id || booking.id;
        if (typeof id === "string") return id;
        if (id && typeof id.toString === "function") return id.toString();
      }
      return null;
    } catch (err) {
      console.error("Error extracting booking ID:", err);
      return null;
    }
  };

  // Helper to get booking ID from task.convertedToBookingId
  const getConvertedBookingId = (): string | null => {
    if (!task?.convertedToBookingId) return null;
    if (typeof task.convertedToBookingId === "string") {
      return task.convertedToBookingId;
    }
    if (typeof task.convertedToBookingId === "object") {
      const booking = task.convertedToBookingId as any;
      const id = booking._id || booking.id || booking.bookingNumber;
      if (typeof id === "string") return id;
      if (id && typeof id.toString === "function") return id.toString();
    }
    return null;
  };

  const handleSubmitResponse = async () => {
    setSubmitting(true);
    try {
      const responseData: ProviderResponseRequestBody = {
        action: responseAction,
        message: message || undefined,
      };
      const response = await respondToRequest(responseData);

      if (responseAction === "accept") {
        const bookingId = extractBookingId(response);
        if (bookingId) {
          router.push(`/provider/bookings/${bookingId}`);
          return;
        }
      }
      router.push("/provider/tasks/requested");
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

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  const getCustomerContact = () => {
    if (!task?.customerId) return null;
    if (typeof task.customerId === "object" && task.customerId !== null) {
      return task.customerId.contactDetails?.primaryContact || null;
    }
    return null;
  };

  // Calculate time until expiration
  const getTimeUntilExpiration = () => {
    if (!task?.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(task.expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return "Expired";
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} left`;
    return "Expires soon";
  };

  // Status checks
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

  // Consolidated Status Card Component
  const StatusCard = () => {
    if (isConverted) {
      return (
        <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-linear-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                  CONVERTED TO BOOKING
                </span>
              </div>
              <h3 className="font-bold text-green-900 dark:text-green-100 text-lg mb-1">
                Booking Created Successfully
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                This task has been converted to a booking. View the full booking
                details to manage the service.
              </p>
              {getConvertedBookingId() && (
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg px-4 py-2 font-mono text-sm mb-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Booking ID:{" "}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {getConvertedBookingId()}
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  const bookingId = getConvertedBookingId();
                  if (bookingId) router.push(`/provider/bookings/${bookingId}`);
                }}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                View Booking Details
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-green-200 dark:border-green-800 pt-4 space-y-3">
            {task.requestedProvider?.requestedAt && (
              <TimelineItem
                icon={<User className="w-4 h-4" />}
                label="Customer Requested"
                date={task.requestedProvider.requestedAt}
                theme="green"
              />
            )}
            {task.acceptedProvider?.acceptedAt && (
              <TimelineItem
                icon={<CheckCircle className="w-4 h-4" />}
                label="You Accepted"
                date={task.acceptedProvider.acceptedAt}
                message={task.acceptedProvider.providerMessage}
                theme="green"
              />
            )}
          </div>

          {/* Customer Message */}
          {task.requestedProvider?.clientMessage && (
            <div className="border-t border-green-200 dark:border-green-800 pt-4 mt-4">
              <p className="text-xs font-semibold text-green-900 dark:text-green-100 uppercase tracking-wide mb-2">
                Customer's Message
              </p>
              <p className="text-gray-900 dark:text-gray-100 italic bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
                "{task.requestedProvider.clientMessage}"
              </p>
            </div>
          )}
        </div>
      );
    }

    if (isAccepted) {
      return (
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-linear-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-800 dark:text-blue-200 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                  ACCEPTED
                </span>
              </div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-1">
                You've Accepted This Request
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The booking will be created shortly. You'll be able to manage it
                from your bookings dashboard.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-blue-200 dark:border-blue-800 pt-4 space-y-3">
            {task.requestedProvider?.requestedAt && (
              <TimelineItem
                icon={<User className="w-4 h-4" />}
                label="Customer Requested"
                date={task.requestedProvider.requestedAt}
                theme="blue"
              />
            )}
            {task.acceptedProvider?.acceptedAt && (
              <TimelineItem
                icon={<CheckCircle className="w-4 h-4" />}
                label="You Accepted"
                date={task.acceptedProvider.acceptedAt}
                message={task.acceptedProvider.providerMessage}
                theme="blue"
              />
            )}
          </div>

          {/* Customer Message */}
          {task.requestedProvider?.clientMessage && (
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4 mt-4">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-2">
                Customer's Message
              </p>
              <p className="text-gray-900 dark:text-gray-100 italic bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
                "{task.requestedProvider.clientMessage}"
              </p>
            </div>
          )}
        </div>
      );
    }

    if (isCancelled || isExpired) {
      const theme = isCancelled ? "red" : "gray";
      const icon = isCancelled ? (
        <XCircle className="w-6 h-6" />
      ) : (
        <Clock className="w-6 h-6" />
      );
      const title = isCancelled ? "Task Cancelled" : "Task Expired";
      const description = isCancelled
        ? "This task has been cancelled and is no longer available."
        : "This task has expired and is no longer available for acceptance.";

      return (
        <div
          className={`bg-linear-to-br ${theme === "red" ? "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800" : "from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/30 border-gray-200 dark:border-gray-700"} border rounded-xl p-6 mb-6 shadow-lg`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 ${theme === "red" ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400" : "bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"} rounded-xl flex items-center justify-center shrink-0`}
            >
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`${theme === "red" ? "bg-linear-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800" : "bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"} text-xs font-bold px-3 py-1.5 rounded-full border`}
                >
                  {isCancelled ? "CANCELLED" : "EXPIRED"}
                </span>
              </div>
              <h3
                className={`font-bold ${theme === "red" ? "text-red-900 dark:text-red-100" : "text-gray-900 dark:text-gray-100"} text-lg mb-1`}
              >
                {title}
              </h3>
              <p
                className={`text-sm ${theme === "red" ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Active request (can respond)
    return (
      <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-linear-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                REQUESTED
              </span>
            </div>
            <h3 className="font-bold text-orange-900 dark:text-orange-100 text-lg mb-1">
              ⏰ Time Sensitive Request
            </h3>
            {task.expiresAt && (
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Expires on{" "}
                <span className="font-semibold">
                  {formatDate(task.expiresAt)}
                </span>{" "}
                at{" "}
                <span className="font-semibold">
                  {formatTime(task.expiresAt)}
                </span>
                <span className="ml-2 inline-flex items-center gap-1 font-bold">
                  ({getTimeUntilExpiration()})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Timeline */}
        {task.requestedProvider?.requestedAt && (
          <div className="border-t border-orange-200 dark:border-orange-800 pt-4">
            <TimelineItem
              icon={<User className="w-4 h-4" />}
              label="Customer Requested You"
              date={task.requestedProvider.requestedAt}
              theme="orange"
            />
          </div>
        )}

        {/* Customer Message */}
        {task.requestedProvider?.clientMessage && (
          <div className="border-t border-orange-200 dark:border-orange-800 pt-4 mt-4">
            <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 uppercase tracking-wide mb-2">
              Customer's Message
            </p>
            <p className="text-gray-900 dark:text-gray-100 italic bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
              "{task.requestedProvider.clientMessage}"
            </p>
          </div>
        )}
      </div>
    );
  };

  // Timeline Item Component
  const TimelineItem = ({
    icon,
    label,
    date,
    message,
    theme = "gray",
  }: {
    icon: React.ReactNode;
    label: string;
    date: string | Date;
    message?: string;
    theme?: "green" | "blue" | "orange" | "gray";
  }) => {
    const themeColors = {
      green: "text-green-700 dark:text-green-300",
      blue: "text-blue-700 dark:text-blue-300",
      orange: "text-orange-700 dark:text-orange-300",
      gray: "text-gray-700 dark:text-gray-300",
    };

    return (
      <div className="flex items-start gap-3">
        <div className={`${themeColors[theme]} mt-0.5`}>{icon}</div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${themeColors[theme]}`}>
            {label}
          </p>
          <p className={`text-xs ${themeColors[theme]} opacity-80`}>
            {formatDate(date)} at {formatTime(date)}
          </p>
          {message && (
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 italic bg-white/30 dark:bg-gray-900/30 p-2 rounded">
              "{message}"
            </p>
          )}
        </div>
      </div>
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

        {/* Consolidated Status Card */}
        <StatusCard />

        {/* Main Task Details */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6 shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {task.title}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {getCustomerContact() && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Contact Number
                    </p>
                    <a
                      href={`tel:${getCustomerContact()}`}
                      className="text-gray-900 dark:text-gray-100 font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      {getCustomerContact()}
                    </a>
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
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Service Location
                  </p>
                  <div className="text-gray-900 dark:text-gray-100">
                    {task.customerLocation.ghanaPostGPS && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                          📍 {task.customerLocation.ghanaPostGPS}
                        </span>
                      </div>
                    )}
                    {task.customerLocation.nearbyLandmark && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Navigation className="w-3 h-3 inline mr-1" />
                        {task.customerLocation.nearbyLandmark}
                      </p>
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

              {task.category && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                      {task.category}
                    </p>
                  </div>
                </div>
              )}

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
                    {task.schedule.flexibleDates && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Info className="w-3 h-3 inline mr-1" />
                        Flexible with dates
                      </p>
                    )}
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

              {(task as any).estimatedBudget && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Estimated Budget
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {(task as any).estimatedBudget.currency}{" "}
                      {(task as any).estimatedBudget.min} -{" "}
                      {(task as any).estimatedBudget.max}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Estimated range set by customer
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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

        {/* Action Buttons */}
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
        ) : null}
      </div>
    </div>
  );
};

export default RequestedTaskDetails;
