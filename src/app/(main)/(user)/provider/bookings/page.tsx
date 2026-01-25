"use client";

import { useState, useMemo } from "react";
import { useProviderActiveBookings } from "@/hooks/useTasksAndBookings";
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
  Navigation,
  Play,
  CheckSquare,
  TrendingUp,
  CalendarDays,
  Briefcase,
} from "lucide-react";

type FilterStatus = "all" | BookingStatus | "today" | "upcoming";
type SortBy = "date" | "status" | "earnings" | "created";

export default function ProviderBookingsPage() {
  const {
    bookings,
    loading,
    error,
    refreshBookings,
    startBooking,
    completeBooking,
  } = useProviderActiveBookings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [showFilters, setShowFilters] = useState(false);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (filterStatus === "today") {
      filtered = filtered.filter((b) => {
        const schedDate = new Date(b.scheduledDate || 0);
        return schedDate >= today.start && schedDate <= today.end;
      });
    } else if (filterStatus === "upcoming") {
      filtered = filtered.filter((b) => {
        const schedDate = new Date(b.scheduledDate || 0);
        return (
          schedDate > today.end &&
          (b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.IN_PROGRESS)
        );
      });
    } else if (filterStatus !== "all") {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookingNumber?.toLowerCase().includes(query) ||
          b.serviceDescription?.toLowerCase().includes(query) ||
          getCustomerName(b).toLowerCase().includes(query),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(a.scheduledDate || 0).getTime() -
            new Date(b.scheduledDate || 0).getTime()
          );
        case "status":
          return a.status.localeCompare(b.status);
        case "earnings":
          return (
            (b.finalPrice || b.estimatedPrice || 0) -
            (a.finalPrice || a.estimatedPrice || 0)
          );
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, filterStatus, searchQuery, sortBy, today]);

  const stats = useMemo(() => {
    const todaysBookings = bookings.filter((b) => {
      const schedDate = new Date(b.scheduledDate || 0);
      return schedDate >= today.start && schedDate <= today.end;
    });

    const upcomingBookings = bookings.filter((b) => {
      const schedDate = new Date(b.scheduledDate || 0);
      return (
        schedDate > today.end &&
        (b.status === BookingStatus.CONFIRMED ||
          b.status === BookingStatus.IN_PROGRESS)
      );
    });

    const completedBookings = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    );
    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0),
      0,
    );
    const pendingEarnings = bookings
      .filter(
        (b) =>
          b.status === BookingStatus.CONFIRMED ||
          b.status === BookingStatus.IN_PROGRESS,
      )
      .reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);

    return {
      total: bookings.length,
      today: todaysBookings.length,
      upcoming: upcomingBookings.length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
        .length,
      inProgress: bookings.filter((b) => b.status === BookingStatus.IN_PROGRESS)
        .length,
      completed: completedBookings.length,
      cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED)
        .length,
      totalEarnings,
      pendingEarnings,
      currency: bookings[0]?.currency || "GHS",
    };
  }, [bookings, today]);

  const getCustomerName = (booking: Booking): string => {
    if (!booking.customer) return "Customer";
    return (
      `${booking.customer.firstName} ${booking.customer.lastName}`.trim() ||
      "Customer"
    );
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

  const isToday = (date: Date | string): boolean => {
    const bookingDate = new Date(date);
    return bookingDate >= today.start && bookingDate <= today.end;
  };

  const handleStartBooking = async (bookingId: string) => {
    try {
      await startBooking(bookingId);
    } catch (error) {
      console.error("Error starting booking:", error);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await completeBooking(bookingId);
    } catch (error) {
      console.error("Error completing booking:", error);
    }
  };

  const getDirections = (booking: Booking) => {
    if (!booking.serviceLocation?.gpsCoordinates) return;
    const { latitude, longitude } = booking.serviceLocation.gpsCoordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      "_blank",
    );
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
                Manage your service schedule and earnings
              </p>
            </div>
            <button
              onClick={refreshBookings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition shadow-sm"
            >
              Refresh
            </button>
          </div>

          {/* Stats Cards - the only elements with solid backgrounds */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-orange-50 dark:bg-orange-950/60 p-4 rounded-lg border border-orange-200 dark:border-orange-800/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Today
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                {stats.today}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/60 p-4 rounded-lg border border-purple-200 dark:border-purple-800/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Upcoming
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                {stats.upcoming}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-lg border border-blue-200 dark:border-blue-800/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Confirmed
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {stats.confirmed}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/60 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  In Progress
                </p>
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {stats.inProgress}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/60 p-4 rounded-lg border border-green-200 dark:border-green-800/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Earnings
                </p>
              </div>
              <p className="text-xl font-bold text-green-900 dark:text-green-200">
                {stats.currency} {stats.totalEarnings.toFixed(0)}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  Pending
                </p>
              </div>
              <p className="text-xl font-bold text-indigo-900 dark:text-indigo-200">
                {stats.currency} {stats.pendingEarnings.toFixed(0)}
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
                placeholder="Search by booking number, service, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus("today")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  filterStatus === "today"
                    ? "bg-orange-600 text-white border-orange-600 dark:bg-orange-700 dark:border-orange-600"
                    : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Today ({stats.today})
              </button>
              <button
                onClick={() => setFilterStatus("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  filterStatus === "upcoming"
                    ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-700 dark:border-purple-600"
                    : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Upcoming ({stats.upcoming})
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
            >
              <Filter className="w-5 h-5" />
              More Filters
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
                  <option value="today">Today's Bookings</option>
                  <option value="upcoming">Upcoming Bookings</option>
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
                  <option value="date">Scheduled Date</option>
                  <option value="status">Status</option>
                  <option value="earnings">Earnings (High to Low)</option>
                  <option value="created">Date Created</option>
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
                : "You don't have any active bookings yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`border rounded-lg hover:shadow-md transition ${
                  isToday(booking.scheduledDate || "")
                    ? "border-orange-400 dark:border-orange-600"
                    : "border-gray-200 dark:border-gray-800"
                }`}
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
                        {isToday(booking.scheduledDate || "") && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700/70">
                            <CalendarDays className="w-3 h-3" />
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {booking.serviceDescription}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Earnings
                      </p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {booking.currency}{" "}
                        {(
                          booking.finalPrice ||
                          booking.estimatedPrice ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Customer
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getCustomerName(booking)}
                        </p>
                        {booking.customer?.contactDetails?.primaryContact && (
                          <a
                            href={`tel:${booking.customer.contactDetails.primaryContact}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                          >
                            <Phone className="w-3 h-3" />
                            {booking.customer.contactDetails.primaryContact}
                          </a>
                        )}
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
                      <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Location
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {booking.serviceLocation?.nearbyLandmark ||
                            booking.serviceLocation?.locality ||
                            "Location not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.specialInstructions && (
                    <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800/60 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1.5">
                        Special Instructions:
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-300">
                        {booking.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - solid backgrounds */}
                  <div className="flex flex-wrap gap-3 pt-5 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() =>
                        (window.location.href = `/provider/bookings/${booking._id}`)
                      }
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium shadow-sm"
                    >
                      View Details
                    </button>

                    {booking.serviceLocation?.gpsCoordinates && (
                      <button
                        onClick={() => getDirections(booking)}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg transition text-sm font-medium flex items-center gap-2 shadow-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </button>
                    )}

                    {booking.status === BookingStatus.CONFIRMED && (
                      <button
                        onClick={() => handleStartBooking(booking._id)}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition text-sm font-medium flex items-center gap-2 shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        Start Service
                      </button>
                    )}

                    {booking.status === BookingStatus.IN_PROGRESS && (
                      <button
                        onClick={() => handleCompleteBooking(booking._id)}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition text-sm font-medium flex items-center gap-2 shadow-sm"
                      >
                        <CheckSquare className="w-4 h-4" />
                        Complete Service
                      </button>
                    )}

                    {booking.customer?.contactDetails?.primaryContact && (
                      <a
                        href={`tel:${booking.customer.contactDetails.primaryContact}`}
                        className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium flex items-center gap-2 shadow-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Call Customer
                      </a>
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
