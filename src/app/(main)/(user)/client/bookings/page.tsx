"use client";

import React, { JSX, useState, useMemo } from "react";
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
  Search,
  Filter,
  ChevronDown,
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
import { BackgroundOverlay } from "@/components/ui/LoadingOverlay";

type FilterStatus = "all" | BookingStatus;
type SortBy = "date" | "status" | "created";

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
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [showFilters, setShowFilters] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState("");

  // Statistics
  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
        .length,
      inProgress: bookings.filter((b) => b.status === BookingStatus.IN_PROGRESS)
        .length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED)
        .length,
      cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED)
        .length,
    }),
    [bookings],
  );

  // Filtering and sorting
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

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.scheduledDate || 0).getTime() -
            new Date(a.scheduledDate || 0).getTime()
          );
        case "status":
          return a.status.localeCompare(b.status);
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, filterStatus, searchQuery, sortBy]);

  const getStatusStyles = (status: BookingStatus): string => {
    const styles: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]:
        "bg-blue-600/15 text-blue-800 border-blue-500/30 dark:bg-blue-500/25 dark:text-blue-200 dark:border-blue-400/40",
      [BookingStatus.IN_PROGRESS]:
        "bg-amber-600/20 text-amber-800 border-amber-500/30 dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-400/40",
      [BookingStatus.COMPLETED]:
        "bg-emerald-600/15 text-emerald-800 border-emerald-500/30 dark:bg-emerald-500/25 dark:text-emerald-200 dark:border-emerald-400/40",
      [BookingStatus.CANCELLED]:
        "bg-rose-600/15 text-rose-800 border-rose-500/30 dark:bg-rose-500/25 dark:text-rose-200 dark:border-rose-400/40",
    };
    return styles[status];
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
      weekday: "short",
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
      <div className="relative min-h-screen flex items-center justify-center">
        <BackgroundOverlay />
        <div className="relative text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-10 border border-gray-200/40 dark:border-gray-700/40 shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-6" />
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Loading your booked tasks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <BackgroundOverlay />
        <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 max-w-lg shadow-2xl text-center">
          <div className="w-16 h-16 bg-rose-100/50 dark:bg-rose-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Error Loading Bookings
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {error.message || "Failed to load bookings"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={refreshBookings}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg">
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={clearError}
              className="px-6 py-3 bg-gray-200/80 dark:bg-gray-800/60 hover:bg-gray-300/90 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all border border-gray-300/50 dark:border-gray-600/50">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-12">
      <BackgroundOverlay />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
              My Bookings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and track all your service bookings
            </p>
          </div>
          <button
            onClick={refreshBookings}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/40 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </p>
          </div>

          <div className="backdrop-blur-md p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
              Confirmed
            </p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-200">
              {stats.confirmed}
            </p>
          </div>

          <div className="backdrop-blur-md p-5 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">
              In Progress
            </p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-200">
              {stats.inProgress}
            </p>
          </div>

          <div className="backdrop-blur-md p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
              Completed
            </p>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-200">
              {stats.completed}
            </p>
          </div>

          <div className="backdrop-blur-md p-5 rounded-2xl border border-rose-200/50 dark:border-rose-800/50 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-rose-700 dark:text-rose-300 mb-1">
              Cancelled
            </p>
            <p className="text-3xl font-bold text-rose-900 dark:text-rose-200">
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking number, service, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/60 dark:border-gray-700/60 rounded-xl bg-white/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none backdrop-blur-sm transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300/60 dark:border-gray-700/60 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all text-gray-700 dark:text-gray-300 backdrop-blur-sm">
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-800/50 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="w-full px-4 py-3 border border-gray-300/60 dark:border-gray-700/60 rounded-xl bg-white/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none backdrop-blur-sm transition-all">
                  <option value="all">All Statuses</option>
                  <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                  <option value={BookingStatus.IN_PROGRESS}>In Progress</option>
                  <option value={BookingStatus.COMPLETED}>Completed</option>
                  <option value={BookingStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-4 py-3 border border-gray-300/60 dark:border-gray-700/60 rounded-xl bg-white/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none backdrop-blur-sm transition-all">
                  <option value="date">Scheduled Date (newest first)</option>
                  <option value="status">Status</option>
                  <option value="created">Date Created (newest first)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/40 backdrop-blur-md p-12 text-center shadow-sm">
            <Calendar className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6 opacity-80" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              No Bookings Found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters or search query"
                : "You haven't made any bookings yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const task = getBookingTask(booking);
              const providerName = getProviderDisplayName(booking);
              const service = getBookingService(booking);

              return (
                <div
                  key={booking._id}
                  className="rounded-2xl border border-gray-200/50 dark:border-gray-700/40 
                             backdrop-blur-md 
                             p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-gray-300/70 
                             dark:hover:border-gray-600/60 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                          {task?.title ||
                            booking.serviceDescription ||
                            "Service Booking"}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800/50 px-2.5 py-1 rounded-full">
                          #{booking.bookingNumber}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                        {task?.description ||
                          booking.serviceDescription ||
                          "No description available"}
                      </p>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${getStatusStyles(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="font-medium text-sm capitalize">
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    {/* Provider */}
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {providerName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Service Provider
                        </p>
                      </div>
                    </div>

                    {/* Service */}
                    {service && (
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
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
                      <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Service Location
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatLocationString(booking.serviceLocation)}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    {(booking.scheduledDate || booking.scheduledTimeSlot) && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
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
                        <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Pricing
                          </p>
                          {booking.finalPrice && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Final: {booking.currency}{" "}
                              {booking.finalPrice.toLocaleString()}
                            </p>
                          )}
                          {!booking.finalPrice && booking.estimatedPrice && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Est: {booking.currency}{" "}
                              {booking.estimatedPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Booking Timeline
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Booked: {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-200/40 dark:border-gray-700/40">
                    <button
                      onClick={() => handleViewDetails(booking._id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => openCancelModal(booking._id)}
                        disabled={cancellingBookingId === booking._id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full p-7 border border-gray-200/60 dark:border-gray-700/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Cancel Booking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-5">
              Please provide a reason for cancelling this booking. This will be
              shared with the service provider.
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={4}
              className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/60 border border-gray-300/70 dark:border-gray-600/60 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none transition-all"
            />
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleCancelBooking}
                disabled={
                  !cancellationReason.trim() || cancellingBookingId !== null
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                {cancellingBookingId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Ban className="w-5 h-5" />
                    Confirm Cancel
                  </>
                )}
              </button>
              <button
                onClick={closeCancelModal}
                disabled={cancellingBookingId !== null}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200/80 dark:bg-gray-800/60 hover:bg-gray-300/90 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all border border-gray-300/50 dark:border-gray-600/50 disabled:opacity-60">
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
