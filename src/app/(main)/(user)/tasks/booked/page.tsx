"use client";

import React, { JSX, useState } from "react";
import { useCustomerBookings } from "@/hooks/useTasksAndBookings";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  Ban,
  Package,
} from "lucide-react";
import {
  BookingStatus,
  Booking,
  getBookingTask,
  getProviderDisplayName,
  getBookingService,
  formatLocationString,
  canCancelBooking,
} from "@/types/task.types";
import { useRouter } from "next/navigation";

const BookedTasksPage: React.FC = () => {
  const router = useRouter();
  const {
    bookings,
    loading,
    error,
    refreshBookings,
    cancelBooking,
    clearError,
  } = useCustomerBookings();

  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState("");

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  const getStatusColor = (status: BookingStatus): string => {
    const colors: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
      [BookingStatus.IN_PROGRESS]:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
      [BookingStatus.COMPLETED]:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
      [BookingStatus.CANCELLED]:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    };
    return colors[status];
  };

  const getStatusIcon = (status: BookingStatus): JSX.Element => {
    switch (status) {
      case BookingStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5" />;
      case BookingStatus.CANCELLED:
        return <XCircle className="w-5 h-5" />;
      case BookingStatus.IN_PROGRESS:
        return <Clock className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeSlot = (timeSlot?: {
    start: string;
    end: string;
  }): string => {
    if (!timeSlot) return "Not specified";
    return `${timeSlot.start} - ${timeSlot.end}`;
  };

  const handleCancelBooking = async (): Promise<void> => {
    if (!selectedBookingId || !cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    setCancellingBookingId(selectedBookingId);
    try {
      await cancelBooking(selectedBookingId, { reason: cancellationReason });
      setShowCancelModal(false);
      setSelectedBookingId(null);
      setCancellationReason("");
      alert("Booking cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const openCancelModal = (bookingId: string): void => {
    setSelectedBookingId(bookingId);
    setShowCancelModal(true);
    setCancellationReason("");
  };

  const closeCancelModal = (): void => {
    setShowCancelModal(false);
    setSelectedBookingId(null);
    setCancellationReason("");
  };

  const handleViewDetails = (bookingId: string): void => {
    router.push(`/bookings/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your booked tasks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2 text-center">
            Error Loading Bookings
          </h3>
          <p className="text-red-600 dark:text-red-400 text-center mb-4">
            {error.message || "Failed to load bookings"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={refreshBookings}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              My Booked Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all your confirmed service bookings
            </p>
          </div>
          <button
            onClick={refreshBookings}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All ({bookings.length})
            </button>
            {Object.values(BookingStatus).map((status) => {
              const count = bookings.filter((b) => b.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {status.replace("_", " ")} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Bookings Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "all"
                ? "You don't have any booked tasks yet."
                : `No bookings with status: ${filter.replace("_", " ")}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const task = getBookingTask(booking);
              const providerName = getProviderDisplayName(booking);
              const service = getBookingService(booking);
              const provider =
                typeof booking.providerId === "object"
                  ? booking.providerId
                  : null;

              return (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md dark:hover:shadow-gray-950/50 transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {task?.title ||
                            booking.serviceDescription ||
                            "Service Booking"}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{booking.bookingNumber}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task?.description ||
                          booking.serviceDescription ||
                          "No description available"}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(booking.status)}`}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="font-medium text-sm">
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Provider Info */}
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {providerName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Service Provider
                        </p>
                        {provider && provider.rating && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ★ {provider.rating.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Service Info */}
                    {service && (
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {service.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Service Type
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Service Location
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatLocationString(booking.serviceLocation)}
                        </p>
                        {booking.serviceLocation?.ghanaPostGPS && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            GPS: {booking.serviceLocation.ghanaPostGPS}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Schedule */}
                    {(booking.scheduledDate || booking.scheduledTimeSlot) && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Scheduled Time
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(booking.scheduledDate)}
                          </p>
                          {booking.scheduledTimeSlot && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTimeSlot(booking.scheduledTimeSlot)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    {(booking.finalPrice ||
                      booking.estimatedPrice ||
                      booking.depositAmount) && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Pricing
                          </p>
                          {booking.finalPrice && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Final: {booking.currency}{" "}
                              {booking.finalPrice.toLocaleString()}
                            </p>
                          )}
                          {!booking.finalPrice && booking.estimatedPrice && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Estimated: {booking.currency}{" "}
                              {booking.estimatedPrice.toLocaleString()}
                            </p>
                          )}
                          {booking.depositAmount && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Deposit: {booking.currency}{" "}
                              {booking.depositAmount.toLocaleString()}
                              {booking.depositPaid && " ✓"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Booking Timeline */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Booking Timeline
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Booked: {formatDate(booking.createdAt)}
                        </p>
                        {booking.confirmedAt && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Confirmed: {formatDate(booking.confirmedAt)}
                          </p>
                        )}
                        {booking.startedAt && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            Started: {formatDate(booking.startedAt)}
                          </p>
                        )}
                        {booking.completedAt && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Completed: {formatDate(booking.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {(booking.specialInstructions || booking.providerMessage) && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      {booking.specialInstructions && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Special Instructions
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {booking.specialInstructions}
                          </p>
                        </div>
                      )}
                      {booking.providerMessage && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                            Provider Message
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {booking.providerMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Task Tags */}
                  {task?.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cancellation Info */}
                  {booking.status === BookingStatus.CANCELLED &&
                    booking.cancellationReason && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                          Cancellation Reason
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {booking.cancellationReason}
                        </p>
                        {booking.cancelledAt && (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            Cancelled on: {formatDate(booking.cancelledAt)}
                          </p>
                        )}
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleViewDetails(booking._id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => openCancelModal(booking._id)}
                        disabled={cancellingBookingId === booking._id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingBookingId === booking._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4" />
                            Cancel Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Cancel Booking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for cancelling this booking. This will be
              shared with the service provider.
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent resize-none transition-colors"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelBooking}
                disabled={
                  !cancellationReason.trim() || cancellingBookingId !== null
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingBookingId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Confirm Cancel
                  </>
                )}
              </button>
              <button
                onClick={closeCancelModal}
                disabled={cancellingBookingId !== null}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookedTasksPage;
