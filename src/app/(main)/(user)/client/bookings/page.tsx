"use client";

import React, { useState, useMemo } from "react";
import { useCustomerBookings } from "@/hooks/useTasksAndBookings";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  Ban,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  BookingStatus,
  Booking,
  getBookingTask,
  getProviderDisplayName,
  formatLocationString,
  canCancelBooking,
} from "@/types/task.types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FilterStatus = "all" | BookingStatus;

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

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState("");

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (filterStatus !== "all") {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookingNumber?.toLowerCase().includes(query) ||
          b.serviceDescription?.toLowerCase().includes(query) ||
          getProviderDisplayName(b).toLowerCase().includes(query),
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return filtered;
  }, [bookings, filterStatus, searchQuery]);

  const getStatusStyles = (status: BookingStatus): string => {
    const styles: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      [BookingStatus.IN_PROGRESS]:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
      [BookingStatus.COMPLETED]:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
      [BookingStatus.CANCELLED]:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
    };
    return styles[status];
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

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-800 dark:text-red-200 text-lg font-medium mb-2">
              Failed to load bookings
            </p>
            <p className="text-red-600 dark:text-red-300 mb-4">
              {error.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={refreshBookings}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={clearError}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
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
            My Bookings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
        <button
          onClick={refreshBookings}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
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
                  BookingStatus.CONFIRMED,
                  BookingStatus.IN_PROGRESS,
                  BookingStatus.COMPLETED,
                  BookingStatus.CANCELLED,
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
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-950/30 p-12 text-center border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || filterStatus !== "all"
              ? "No bookings match your filters"
              : "No bookings yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your search or filters."
              : "Your service bookings will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBookings.map((booking) => {
            const task = getBookingTask(booking);
            const providerName = getProviderDisplayName(booking);
            const canCancel = canCancelBooking(booking);

            return (
              <div
                key={booking._id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-950/50 transition-all border border-gray-200 dark:border-gray-800 p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Title and Booking Number */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {task?.title ||
                          booking.serviceDescription ||
                          "Service Booking"}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        #{booking.bookingNumber}
                      </span>
                    </div>
                  </div>

                  {/* Provider Name */}
                  <div className="hidden md:flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 shrink-0 max-w-[150px]">
                    <span className="truncate">{providerName}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 shrink-0">
                    <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <span className="hidden sm:inline truncate max-w-[120px]">
                      {formatLocationString(booking.serviceLocation)}
                    </span>
                  </div>

                  {/* Scheduled Date */}
                  {booking.scheduledDate && (
                    <div className="hidden lg:flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 shrink-0">
                      <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      <span>{formatDate(booking.scheduledDate)}</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusStyles(
                      booking.status,
                    )}`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>

                  {/* Cancel Button */}
                  {canCancel && (
                    <button
                      onClick={() => openCancelModal(booking._id)}
                      disabled={cancellingBookingId === booking._id}
                      className="flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded text-xs font-medium transition-colors shrink-0 disabled:opacity-50"
                    >
                      {cancellingBookingId === booking._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  )}

                  {/* External Link */}
                  <Link
                    href={`/client/bookings/${booking._id}`}
                    className="text-xs not-odd:text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0 flex items-center border rounded-md px-2 py-1"
                  >
                    <span className="hidden sm:inline">View</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Cancel Booking
              </h3>
              <button
                onClick={closeCancelModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for cancelling this booking. This will
                be shared with the service provider.
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={4}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent resize-none transition-colors"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCancelBooking}
                  disabled={
                    !cancellationReason.trim() || cancellingBookingId !== null
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookedTasksPage;
