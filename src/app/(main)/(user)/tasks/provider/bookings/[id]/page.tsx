"use client";

import React, { useState } from "react";
import { useBooking } from "@/hooks/useTasksAndBookings";
import { useProviderActiveBookings } from "@/hooks/useTasksAndBookings";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Ban,
  Play,
  Tag,
  RefreshCw,
  Navigation,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { BookingStatus } from "@/types/task.types";

const ProviderBookingDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const { booking, loading, error, refreshBooking } = useBooking(
    bookingId,
    !!bookingId,
  );
  const {
    startBooking,
    completeBooking,
    cancelBooking: providerCancelBooking,
  } = useProviderActiveBookings(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [processing, setProcessing] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCustomerName = () => {
    if (!booking?.customer) return "Customer";
    return `${booking.customer.firstName} ${booking.customer.lastName}`;
  };

  const getCustomerPhone = () => {
    return (
      booking?.customer?.contactDetails?.primaryContact ||
      booking?.customer?.contactDetails?.secondaryContact
    );
  };

  const getCustomerEmail = () => {
    if (!booking?.customer) return null;
    if (typeof booking.customer === "object" && "email" in booking.customer) {
      return (booking.customer as any).email;
    }
    return null;
  };

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      [BookingStatus.CONFIRMED]:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
      [BookingStatus.IN_PROGRESS]:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
      [BookingStatus.COMPLETED]:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
      [BookingStatus.CANCELLED]:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    );
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.COMPLETED:
        return <CheckCircle className="w-6 h-6" />;
      case BookingStatus.CANCELLED:
        return <XCircle className="w-6 h-6" />;
      case BookingStatus.IN_PROGRESS:
        return <Clock className="w-6 h-6" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  const handleStartBooking = async () => {
    setProcessing(true);
    try {
      await startBooking(bookingId);
      await refreshBooking();
      alert("Booking started successfully!");
    } catch (err) {
      console.error("Failed to start booking:", err);
      alert("Failed to start booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteBooking = async () => {
    setProcessing(true);
    try {
      const data: any = {};
      if (completionNotes.trim()) data.notes = completionNotes;
      if (finalPrice && !isNaN(parseFloat(finalPrice))) {
        data.finalPrice = parseFloat(finalPrice);
      }

      await completeBooking(bookingId, data);
      setShowCompleteModal(false);
      await refreshBooking();
      alert("Booking completed successfully!");
    } catch (err) {
      console.error("Failed to complete booking:", err);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    setProcessing(true);
    try {
      await providerCancelBooking(bookingId, { reason: cancellationReason });
      setShowCancelModal(false);
      setCancellationReason("");
      await refreshBooking();
      alert("Booking cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const openDirections = () => {
    if (booking?.task?.customerLocation) {
      const loc = booking.task.customerLocation;
      let query = "";

      if (loc.ghanaPostGPS) {
        query = loc.ghanaPostGPS;
      } else {
        const parts = [
          loc.nearbyLandmark,
          loc.locality,
          loc.city || loc.district,
          loc.region,
          "Ghana",
        ].filter(Boolean);
        query = parts.join(", ");
      }

      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, "_blank");
    }
  };

  // Check for invalid booking ID
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-red-900 dark:text-red-100 font-bold text-lg text-center mb-2">
            Invalid Booking
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm text-center mb-4">
            No booking ID provided
          </p>
          <button
            onClick={() => router.push("/tasks/provider/bookings")}
            className="w-full inline-flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-red-900 dark:text-red-100 font-bold text-lg text-center mb-2">
            Error Loading Booking
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm text-center mb-4">
            {error?.message || "Booking not found"}
          </p>
          <button
            onClick={() => router.push("/tasks/provider/bookings")}
            className="w-full inline-flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  const canStart = booking.status === BookingStatus.CONFIRMED;
  const canComplete = booking.status === BookingStatus.IN_PROGRESS;
  const canCancel =
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.IN_PROGRESS;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/tasks/provider/bookings")}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to bookings
          </button>
          <button
            onClick={refreshBooking}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 mb-6 ${getStatusColor(
            booking.status,
          )}`}
        >
          {getStatusIcon(booking.status)}
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              {booking.status.replace("_", " ")}
            </h2>
            <p className="text-sm opacity-90">
              {booking.status === BookingStatus.CONFIRMED &&
                "Ready to start this booking"}
              {booking.status === BookingStatus.IN_PROGRESS &&
                "Currently working on this task"}
              {booking.status === BookingStatus.COMPLETED &&
                "This booking has been completed"}
              {booking.status === BookingStatus.CANCELLED &&
                "This booking has been cancelled"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6 shadow-lg">
          {/* Task Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {booking.task?.title || "Untitled Task"}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {booking.task?.description || "No description available"}
            </p>
          </div>

          {/* Customer Information */}
          {booking.customer && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
                Customer Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {getCustomerName()}
                    </p>
                  </div>
                </div>

                {getCustomerPhone() && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Phone
                      </p>
                      <a
                        href={`tel:${getCustomerPhone()}`}
                        className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {getCustomerPhone()}
                      </a>
                    </div>
                  </div>
                )}

                {getCustomerEmail() && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${getCustomerEmail()}`}
                        className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {getCustomerEmail()}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
              Booking Information
            </h2>
            <div className="space-y-4">
              {/* Location */}
              {booking.task?.customerLocation && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <div className="text-gray-900 dark:text-gray-100">
                      {booking.task.customerLocation.ghanaPostGPS && (
                        <span className="block font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mb-1 w-fit">
                          {booking.task.customerLocation.ghanaPostGPS}
                        </span>
                      )}
                      <p>
                        {booking.task.customerLocation.nearbyLandmark && (
                          <span>
                            {booking.task.customerLocation.nearbyLandmark},{" "}
                          </span>
                        )}
                        {booking.task.customerLocation.locality && (
                          <span>
                            {booking.task.customerLocation.locality},{" "}
                          </span>
                        )}
                        {booking.task.customerLocation.city ||
                          booking.task.customerLocation.district}
                        {booking.task.customerLocation.region &&
                          `, ${booking.task.customerLocation.region}`}
                      </p>
                    </div>
                    <button
                      onClick={openDirections}
                      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {booking.finalPrice ? "Final Price" : "Estimated Price"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {booking.finalPrice || booking.estimatedPrice
                      ? `GH₵ ${(booking.finalPrice || booking.estimatedPrice)?.toLocaleString()}`
                      : "Not set"}
                  </p>
                </div>
              </div>

              {/* Booking Date */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatDate(booking.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(booking.createdAt)}
                  </p>
                </div>
              </div>

              {/* Start Time */}
              {booking.startedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Started
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {formatDate(booking.startedAt)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(booking.startedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Completion Time */}
              {booking.completedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Completed
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {formatDate(booking.completedAt)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(booking.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Tags */}
          {booking.task?.tags && booking.task.tags.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {booking.task.tags.map((tag, index) => (
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

          {/* Completion Notes */}
          {/* {booking.completionNotes && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
                Completion Notes
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {booking.completionNotes}
              </p>
            </div>
          )} */}

          {/* Cancellation Info */}
          {booking.status === BookingStatus.CANCELLED && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 dark:text-red-300 mb-1">
                      Booking Cancelled
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                    {booking.cancelledAt && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        Cancelled on {formatDate(booking.cancelledAt)} at{" "}
                        {formatTime(booking.cancelledAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canStart && (
            <button
              onClick={handleStartBooking}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Booking
                </>
              )}
            </button>
          )}

          {canComplete && (
            <button
              onClick={() => {
                setShowCompleteModal(true);
                setFinalPrice(booking.estimatedPrice?.toString() || "");
              }}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Booking
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban className="w-5 h-5" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Complete Booking
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Final Price (GH₵)
                </label>
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="Enter final price"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Completion Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the completed work..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCompleteBooking}
                disabled={processing}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompletionNotes("");
                  setFinalPrice("");
                }}
                disabled={processing}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Cancel Booking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for cancelling this booking. This will be
              shared with the customer.
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
                disabled={!cancellationReason.trim() || processing}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
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
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
                disabled={processing}
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

export default ProviderBookingDetailsPage;
