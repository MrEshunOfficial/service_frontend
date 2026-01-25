"use client";

import { useState, useMemo } from "react";
import { useCustomerBookings } from "@/hooks/useTasksAndBookings";
import { Booking, BookingStatus } from "@/types/task.types";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Phone,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";

type FilterStatus = "all" | BookingStatus;
type SortBy = "date" | "status" | "created";

export default function CustomerBookingsPage() {
  const { bookings, loading, error, refreshBookings } = useCustomerBookings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [showFilters, setShowFilters] = useState(false);

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
          getProviderName(b).toLowerCase().includes(query),
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

  const getProviderName = (booking: Booking): string => {
    const provider =
      typeof booking.providerId === "object" ? booking.providerId : null;
    if (!provider) return "Service Provider";

    if ("businessName" in provider && provider.businessName) {
      return provider.businessName;
    }

    const firstName = "firstName" in provider ? provider.firstName : "";
    const lastName = "lastName" in provider ? provider.lastName : "";
    return `${firstName} ${lastName}`.trim() || "Service Provider";
  };

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/70";
      case BookingStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800/70";
      case BookingStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/70";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/70";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4" />;
      case BookingStatus.IN_PROGRESS:
        return <Loader className="w-4 h-4 animate-spin" />;
      case BookingStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case BookingStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot?: { start: string; end: string }): string => {
    if (!timeSlot) return "Time not set";
    return `${timeSlot.start} - ${timeSlot.end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Bookings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message}
          </p>
          <button
            onClick={refreshBookings}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Bookings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track your service bookings
              </p>
            </div>
            <button
              onClick={refreshBookings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition shadow-sm"
            >
              Refresh
            </button>
          </div>

          {/* Stats Cards - only colored elements */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-lg border border-blue-200 dark:border-blue-800/70 shadow-sm">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Confirmed
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {stats.confirmed}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/60 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/70 shadow-sm">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                In Progress
              </p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {stats.inProgress}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/60 p-4 rounded-lg border border-green-200 dark:border-green-800/70 shadow-sm">
              <p className="text-sm text-green-600 dark:text-green-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                {stats.completed}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/60 p-4 rounded-lg border border-red-200 dark:border-red-800/70 shadow-sm">
              <p className="text-sm text-red-600 dark:text-red-400">
                Cancelled
              </p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                {stats.cancelled}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters & Search */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking number, service, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
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
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
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
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters or search query"
                : "You haven't made any bookings yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="border rounded-lg hover:shadow-md transition border-gray-200 dark:border-gray-800"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-5 flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {booking.bookingNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {booking.serviceDescription}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Provider
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getProviderName(booking)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Scheduled Date
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {booking.scheduledDate
                            ? formatDate(booking.scheduledDate)
                            : "Not scheduled"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Time Slot
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatTime(booking.scheduledTimeSlot)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Price
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {booking.finalPrice
                            ? `${booking.currency} ${booking.finalPrice.toFixed(2)}`
                            : booking.estimatedPrice
                              ? `${booking.currency} ${booking.estimatedPrice.toFixed(2)} (est.)`
                              : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.serviceLocation && (
                    <div className="mb-6 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Service Location
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {booking.serviceLocation.nearbyLandmark && (
                              <span className="font-medium">
                                {booking.serviceLocation.nearbyLandmark},{" "}
                              </span>
                            )}
                            {booking.serviceLocation.locality &&
                              `${booking.serviceLocation.locality}, `}
                            {booking.serviceLocation.city &&
                              `${booking.serviceLocation.city}, `}
                            {booking.serviceLocation.region}
                          </p>
                          {booking.serviceLocation.ghanaPostGPS && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              GPS: {booking.serviceLocation.ghanaPostGPS}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-5 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() =>
                        (window.location.href = `/customer/bookings/${booking._id}`)
                      }
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium shadow-sm"
                    >
                      View Details
                    </button>

                    {booking.status === BookingStatus.CONFIRMED && (
                      <button className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium shadow-sm">
                        Reschedule
                      </button>
                    )}

                    {(booking.status === BookingStatus.CONFIRMED ||
                      booking.status === BookingStatus.IN_PROGRESS) && (
                      <button className="px-5 py-2.5 border border-red-300 dark:border-red-700/70 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition text-sm font-medium shadow-sm">
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
