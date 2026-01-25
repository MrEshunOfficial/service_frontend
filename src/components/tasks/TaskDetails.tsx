import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  Star,
  Navigation,
  Eye,
  Trash2,
  Loader2,
  ExternalLink,
  User,
} from "lucide-react";
import {
  Task,
  TaskStatus,
  TaskPriority,
  UpdateTaskRequestBody,
  RequestProviderRequestBody,
  CancelRequest,
  ProviderResponseRequestBody,
  RematchRequest,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/types/task.types";
import { UserRole } from "@/types/base.types";
import { ProviderProfile } from "@/types/profiles/provider-profile.types";

interface TaskDetailsProps {
  taskId: string;
  userRole?: UserRole.CUSTOMER | UserRole.PROVIDER;
  onUpdate?: () => void;
  onRequestProvider?: () => void;
  onCancel?: () => void;
  onDelete?: (taskId: string) => Promise<void>;
  onRematch?: (taskId: string, data?: RematchRequest) => Promise<void>;
  onExpressInterest?: (taskId: string, message?: string) => Promise<void>;
  onRespondToRequest?: (
    taskId: string,
    data: ProviderResponseRequestBody,
  ) => Promise<void>;
  useTaskHook: (
    taskId: string,
    autoLoad?: boolean,
  ) => {
    task: Task | null;
    loading: boolean;
    error: any;
    isInitialized: boolean;
    updateTask: (data: UpdateTaskRequestBody) => Promise<void>;
    requestProvider: (data: RequestProviderRequestBody) => Promise<void>;
    cancelTask: (data?: CancelRequest) => Promise<void>;
    fetchTask: () => Promise<void>;
    refreshTask: () => Promise<void>;
  };
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  taskId,
  userRole = UserRole.CUSTOMER,
  onRequestProvider,
  onCancel,
  onDelete,
  onRematch,
  onExpressInterest,
  onRespondToRequest,
  useTaskHook,
}) => {
  const { task, loading, error, requestProvider, cancelTask, refreshTask } =
    useTaskHook(taskId);

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Status badge styling
  const getStatusColor = (status: TaskStatus): string => {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      [TaskStatus.MATCHED]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      [TaskStatus.FLOATING]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      [TaskStatus.REQUESTED]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      [TaskStatus.ACCEPTED]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      [TaskStatus.CONVERTED]:
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      [TaskStatus.EXPIRED]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      [TaskStatus.CANCELLED]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    );
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    const colors: Record<TaskPriority, string> = {
      [TaskPriority.LOW]:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      [TaskPriority.MEDIUM]:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      [TaskPriority.HIGH]:
        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      [TaskPriority.URGENT]:
        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return (
      colors[priority] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  // Generate Google Maps URL
  const getGoogleMapsUrl = (latitude: number, longitude: number): string => {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  };

  // Get provider info from matched providers
  const getProviderInfo = (
    providerId: string | { _id: string },
  ): ProviderProfile | null => {
    const id = typeof providerId === "string" ? providerId : providerId._id;
    if (!task?.matchedProviders) return null;

    const match = task.matchedProviders.find(
      (m) =>
        (typeof m === "object" && "_id" in m ? m._id : m).toString() === id,
    );

    return match && typeof match === "object"
      ? (match as ProviderProfile)
      : null;
  };

  // Handle request provider
  const handleRequestProvider = async (providerId: string) => {
    try {
      setActiveAction("requesting");
      await requestProvider({
        providerId,
        message: actionMessage,
      });
      setShowProviderModal(false);
      setActionMessage("");
      setSelectedProviderId(null);
      await refreshTask(); // ✅ Refresh to show updated status
      if (onRequestProvider) onRequestProvider();
    } catch (err) {
      console.error("Error requesting provider:", err);
    } finally {
      setActiveAction(null);
    }
  };

  // Handle cancel task
  const handleCancelTask = async () => {
    try {
      setActiveAction("cancelling");
      await cancelTask({ reason: cancelReason });
      setCancelReason("");
      await refreshTask(); // ✅ Refresh to show updated status
      if (onCancel) onCancel();
    } catch (err) {
      console.error("Error cancelling task:", err);
    } finally {
      setActiveAction(null);
    }
  };

  // Handle rematch
  const handleRematch = async (strategy: "intelligent" | "location-only") => {
    try {
      setActiveAction("rematching");
      if (onRematch) {
        await onRematch(taskId, { strategy });
      }
      await refreshTask();
    } catch (err) {
      console.error("Error rematching task:", err);
    } finally {
      setActiveAction(null);
    }
  };

  // Handle express interest (provider)
  const handleExpressInterest = async () => {
    try {
      setActiveAction("expressing");
      if (onExpressInterest) {
        await onExpressInterest(taskId, actionMessage);
      }
      setActionMessage("");
      await refreshTask(); // ✅ Refresh to show updated status
    } catch (err) {
      console.error("Error expressing interest:", err);
    } finally {
      setActiveAction(null);
    }
  };

  // Handle provider response
  const handleProviderResponse = async (action: "accept" | "reject") => {
    try {
      setActiveAction(action);
      if (onRespondToRequest) {
        await onRespondToRequest(taskId, {
          action,
          message: actionMessage,
        });
      }
      setActionMessage("");
      await refreshTask(); // ✅ Refresh to show updated status
    } catch (err) {
      console.error("Error responding to request:", err);
    } finally {
      setActiveAction(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Error Loading Task
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error.message || "Failed to load task details"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center w-full h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Task not found</p>
      </div>
    );
  }

  const isCustomer = userRole === UserRole.CUSTOMER;
  const isProvider = userRole === UserRole.PROVIDER;
  const canCancel = [
    TaskStatus.PENDING,
    TaskStatus.MATCHED,
    TaskStatus.FLOATING,
    TaskStatus.REQUESTED,
  ].includes(task.status);
  const canRematch = task.status === TaskStatus.MATCHED;
  const canRequestProvider =
    task.status === TaskStatus.MATCHED &&
    task.matchedProviders &&
    task.matchedProviders.length > 0;
  const canExpressInterest = isProvider && task.status === TaskStatus.FLOATING;
  const canRespondToRequest =
    isProvider && task.status === TaskStatus.REQUESTED;

  const hasCoordinates =
    task.customerLocation.gpsCoordinates?.latitude &&
    task.customerLocation.gpsCoordinates?.longitude;
  const googleMapsUrl = hasCoordinates
    ? getGoogleMapsUrl(
        task.customerLocation.gpsCoordinates!.latitude,
        task.customerLocation.gpsCoordinates!.longitude,
      )
    : null;

  // Get customer info
  const customer = typeof task.customerId === "object" ? task.customerId : null;

  return (
    <div className={`w-full space-y-3`}>
      {/* Header Section */}
      <div className="shadow-lg rounded border p-6  bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  task.status,
                )}`}
              >
                {TASK_STATUS_LABELS[task.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                  task.schedule.priority,
                )}`}
              >
                {PRIORITY_LABELS[task.schedule.priority]}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {task.viewCount} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info (for providers) */}
        {isProvider && customer && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.name}
                </p>
                {customer.email && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {customer.email}
                  </p>
                )}
                {customer.contactDetails?.primaryContact && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {customer.contactDetails.primaryContact}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        {/* Category */}
        {task.category && (
          <div className="mb-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Category:
            </span>
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
              {task.category}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Location Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Location Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Ghana Post GPS
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {task.customerLocation.ghanaPostGPS}
              </p>
            </div>
            {task.customerLocation.nearbyLandmark && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nearby Landmark
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.customerLocation.nearbyLandmark}
                </p>
              </div>
            )}
            {task.customerLocation.region && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Region
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.customerLocation.region}
                </p>
              </div>
            )}
            {task.customerLocation.city && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  City
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.customerLocation.city}
                </p>
              </div>
            )}
            {task.customerLocation.district && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  District
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.customerLocation.district}
                </p>
              </div>
            )}
            {task.customerLocation.locality && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Locality
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.customerLocation.locality}
                </p>
              </div>
            )}
            {task.customerLocation.isAddressVerified && (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xs">
                <CheckCircle className="w-4 h-4" />
                Verified Address
              </div>
            )}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors mt-2"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Schedule & Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Schedule & Budget
          </h3>
          <div className="space-y-3">
            {task.schedule.preferredDate && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Preferred Date
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(task.schedule.preferredDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            )}
            {task.schedule.timeSlot && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Time Slot
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.schedule.timeSlot.start} - {task.schedule.timeSlot.end}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Flexible Dates
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {task.schedule.flexibleDates ? "Yes" : "No"}
              </p>
            </div>
            {task.expiresAt && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Expires At
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(task.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Map */}
      {hasCoordinates && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Location on Map
          </h3>
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${
                task.customerLocation.gpsCoordinates!.latitude
              },${
                task.customerLocation.gpsCoordinates!.longitude
              }&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Matched Providers Section (Customer view) */}
      {isCustomer &&
        task.matchedProviders &&
        task.matchedProviders.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Matched Providers ({task.matchedProviders.length})
            </h3>
            <div className="space-y-4">
              {task.matchedProviders.map((matchItem: any, index: number) => {
                // Extract provider info - handle both populated and unpopulated cases
                const provider =
                  typeof matchItem === "object" && matchItem.providerId
                    ? typeof matchItem.providerId === "object"
                      ? matchItem.providerId
                      : null
                    : typeof matchItem === "object" && "_id" in matchItem
                      ? matchItem
                      : null;

                const providerId =
                  provider?._id?.toString() ||
                  (typeof matchItem.providerId === "string"
                    ? matchItem.providerId
                    : matchItem._id?.toString());

                const matchScore = matchItem.matchScore || 0;
                const matchReasons = matchItem.matchReasons || [];
                const matchedServices = matchItem.matchedServices || [];

                return (
                  <div
                    key={providerId || index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {provider?.profileImage && (
                            <img
                              src={provider.profileImage}
                              alt="Provider"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {provider?.businessName ||
                                  (provider?.firstName && provider?.lastName
                                    ? `${provider.firstName} ${provider.lastName}`
                                    : "Service Provider")}
                              </h4>
                              {matchScore > 0 && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                  {matchScore}% match
                                </span>
                              )}
                            </div>

                            {provider?.locationData?.city && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {provider.locationData.city}
                                {provider.locationData.region &&
                                  `, ${provider.locationData.region}`}
                              </p>
                            )}

                            {provider?.rating !== undefined && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{provider.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {matchReasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {matchReasons.map((reason: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs border border-green-200 dark:border-green-800"
                              >
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        )}

                        {matchedServices.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Matched Services:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {matchedServices.map(
                                (service: any, idx: number) => {
                                  const serviceName =
                                    typeof service === "object" && service.title
                                      ? service.title
                                      : "Service";
                                  return (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs"
                                    >
                                      {serviceName}
                                    </span>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}

                        {provider?.contactDetails?.businessContact && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Contact: {provider.contactDetails.businessContact}
                          </p>
                        )}
                      </div>

                      {canRequestProvider && (
                        <button
                          onClick={() => {
                            setSelectedProviderId(providerId);
                            setShowProviderModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Interested Providers Section */}
      {task.interestedProviders && task.interestedProviders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Interested Providers ({task.interestedProviders.length})
          </h3>
          <div className="space-y-4">
            {task.interestedProviders.map((interested) => (
              <div
                key={interested.providerId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {interested.message && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 italic">
                        "{interested.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expressed interest{" "}
                      {new Date(interested.expressedAt).toLocaleString()}
                    </p>
                  </div>
                  {isCustomer && (
                    <button
                      onClick={() =>
                        handleRequestProvider(interested.providerId)
                      }
                      disabled={activeAction === "requesting"}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {activeAction === "requesting"
                        ? "Requesting..."
                        : "Request"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Status Section - Only show ONE based on current status */}
      {task.status === TaskStatus.CONVERTED && task.convertedToBookingId && (
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Converted to Booking
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This task has been successfully converted to a booking.
            </p>
            {task.convertedAt && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Converted on: {new Date(task.convertedAt).toLocaleString()}
              </p>
            )}
            <button
              onClick={() => {
                const role =
                  userRole === UserRole.CUSTOMER ? "customer" : "provider";
                window.location.href = `/${role}/bookings/${task.convertedToBookingId}`;
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Booking
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {task.status === TaskStatus.ACCEPTED && task.acceptedProvider && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Provider Accepted
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Accepted on:{" "}
              {new Date(task.acceptedProvider.acceptedAt).toLocaleString()}
            </p>
            {task.acceptedProvider.providerMessage && (
              <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Provider's message:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{task.acceptedProvider.providerMessage}"
                </p>
              </div>
            )}
            <p className="text-sm text-green-700 dark:text-green-400 font-medium mt-3">
              This task will be converted to a booking shortly.
            </p>
          </div>
        </div>
      )}

      {task.status === TaskStatus.REQUESTED && task.requestedProvider && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Awaiting Provider Response
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Requested on:{" "}
              {new Date(task.requestedProvider.requestedAt).toLocaleString()}
            </p>
            {task.requestedProvider.clientMessage && (
              <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Your message:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{task.requestedProvider.clientMessage}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {task.status === TaskStatus.CANCELLED && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            Task Cancelled
          </h3>
          <div className="space-y-2">
            {task.cancelledAt && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cancelled on: {new Date(task.cancelledAt).toLocaleString()}
              </p>
            )}
            {task.cancellationReason && (
              <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Reason:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.cancellationReason}
                </p>
              </div>
            )}
            {task.cancelledBy && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Cancelled by: {task.cancelledBy}
              </p>
            )}
          </div>
        </div>
      )}

      {task.status === TaskStatus.EXPIRED && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            Task Expired
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This task has expired and is no longer active.
            </p>
            {task.expiresAt && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Expired on: {new Date(task.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Customer */}
      {isCustomer && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {canRematch && <div>re-match actions</div>}
            <>
              <button
                onClick={() => handleRematch("intelligent")}
                disabled={activeAction === "rematching"}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    activeAction === "rematching" ? "animate-spin" : ""
                  }`}
                />
                {activeAction === "rematching"
                  ? "Rematching..."
                  : "Rematch (Intelligent)"}
              </button>
              <button
                onClick={() => handleRematch("location-only")}
                disabled={activeAction === "rematching"}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Rematch (Location Only)
              </button>
            </>
            {canCancel && (
              <div className="flex-1 min-w-full">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Cancellation reason (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg mb-2 text-sm"
                  rows={2}
                />
                <button
                  onClick={handleCancelTask}
                  disabled={activeAction === "cancelling"}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {activeAction === "cancelling"
                    ? "Cancelling..."
                    : "Cancel Task"}
                </button>
              </div>
            )}
            {task.status === TaskStatus.CANCELLED && onDelete && (
              <button
                onClick={() => onDelete(taskId)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Provider */}
      {isProvider && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {canExpressInterest && (
            <div className="space-y-3">
              <textarea
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                placeholder="Add a message to the customer (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                rows={3}
              />
              <button
                onClick={handleExpressInterest}
                disabled={activeAction === "expressing"}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {activeAction === "expressing"
                  ? "Sending..."
                  : "Express Interest"}
              </button>
            </div>
          )}
          {canRespondToRequest && (
            <div className="space-y-3">
              <textarea
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                placeholder="Add a message (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleProviderResponse("accept")}
                  disabled={activeAction !== null}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {activeAction === "accept"
                    ? "Accepting..."
                    : "Accept Request"}
                </button>
                <button
                  onClick={() => handleProviderResponse("reject")}
                  disabled={activeAction !== null}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {activeAction === "reject"
                    ? "Rejecting..."
                    : "Reject Request"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Provider Modal */}
      {showProviderModal && selectedProviderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Request Provider
            </h3>
            <textarea
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              placeholder="Add a message to the provider (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleRequestProvider(selectedProviderId)}
                disabled={activeAction === "requesting"}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {activeAction === "requesting"
                  ? "Requesting..."
                  : "Send Request"}
              </button>
              <button
                onClick={() => {
                  setShowProviderModal(false);
                  setActionMessage("");
                  setSelectedProviderId(null);
                }}
                disabled={activeAction === "requesting"}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
