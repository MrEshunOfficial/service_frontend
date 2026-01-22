import React, { useState } from "react";
import { TaskWithProvidersResponse, Task } from "@/types/task.types";
import {
  X,
  Users,
  TrendingUp,
  MapPin,
  CheckCircle,
  UserCheck,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useCustomerTasks } from "@/hooks/useTasksAndBookings";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";

interface TaskResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskResult: TaskWithProvidersResponse | null;
  floatingTasks?: Task[];
}

const TaskResultDialog: React.FC<TaskResultDialogProps> = ({
  isOpen,
  onClose,
  taskResult,
  floatingTasks = [],
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingProvider, setRequestingProvider] = useState(false);
  const { requestProvider } = useCustomerTasks(undefined, false);

  if (!isOpen) return null;

  const matchedProviders = taskResult?.matchedProviders || [];
  const hasMatches = matchedProviders.length > 0;
  const taskId = taskResult?.task?._id;

  const handleRequestProvider = async (providerId: string) => {
    if (!taskId) return;

    if (!requestMessage.trim()) {
      alert("Please provide a message to the provider");
      return;
    }

    setRequestingProvider(true);
    try {
      await requestProvider(taskId, {
        providerId,
        message: requestMessage,
      });
      setRequestMessage("");
      setSelectedProviderId(null);
      alert("Provider requested successfully! They will be notified.");
      onClose();
    } catch (err) {
      alert("Failed to request provider");
    } finally {
      setRequestingProvider(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderProviderCard = (provider: any) => {
    const providerProfile = provider.providerId as PopulatedProviderProfile;
    const isRequestingThisProvider =
      selectedProviderId === providerProfile._id.toString();

    return (
      <div
        key={providerProfile._id.toString()}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
            {providerProfile.profile?.profilePictureId?.url ? (
              <img
                src={providerProfile.profile.profilePictureId.url}
                alt={providerProfile.businessName || "Provider"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="w-7 h-7 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {providerProfile.businessName || "Provider"}
                </h4>
                {providerProfile.profile?.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {providerProfile.profile.bio}
                  </p>
                )}
              </div>
              {provider.matchScore && (
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  {provider.matchScore}%
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
              {provider.distance !== undefined && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{provider.distance.toFixed(1)} km away</span>
                </div>
              )}
              <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {providerProfile.locationData.ghanaPostGPS}
                </span>
              </div>
            </div>

            {provider.matchReasons && provider.matchReasons.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {provider.matchReasons.map((reason: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isRequestingThisProvider ? (
              <div className="mt-3 space-y-3">
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell the provider about your task and when you need it..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleRequestProvider(providerProfile._id.toString())
                    }
                    disabled={requestingProvider}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {requestingProvider ? "Sending..." : "Send Request"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProviderId(null);
                      setRequestMessage("");
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  setSelectedProviderId(providerProfile._id.toString())
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mt-2"
              >
                <UserCheck className="w-4 h-4" />
                Request This Provider
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFloatingTask = (task: Task) => {
    return (
      <div
        key={task._id}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {task.title}
          </h4>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
            Floating
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              {task.customerLocation.ghanaPostGPS}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {task.schedule.preferredDate
                ? formatDate(task.schedule.preferredDate)
                : "Flexible"}
            </span>
          </div>
        </div>

        {task.interestedProviders && task.interestedProviders.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Users className="w-3 h-3" />
            <span>
              {task.interestedProviders.length}{" "}
              {task.interestedProviders.length === 1 ? "provider" : "providers"}{" "}
              interested
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {hasMatches
                ? "Matched Providers Found!"
                : "Task Posted Successfully"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {hasMatches
                ? `We found ${matchedProviders.length} ${
                    matchedProviders.length === 1 ? "provider" : "providers"
                  } that match your task`
                : "Your task is now floating and visible to all providers"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {hasMatches ? (
            <div className="space-y-4">
              {/* Task Info Banner */}
              {taskResult?.task && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        {taskResult.task.title}
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {taskResult.task.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Providers */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Available Providers
                </h3>
                {matchedProviders.map((provider) =>
                  renderProviderCard(provider)
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* No matches message */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  No Immediate Matches Found
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 max-w-md mx-auto">
                  Don't worry! Your task is now visible to all service
                  providers. They can express interest, and you'll be notified
                  to request them.
                </p>
              </div>

              {/* Floating Tasks */}
              {floatingTasks.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      Your Other Floating Tasks
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      These tasks are waiting for providers to express interest
                    </p>
                  </div>
                  <div className="space-y-3">
                    {floatingTasks.map((task) => renderFloatingTask(task))}
                  </div>
                </div>
              )}

              {floatingTasks.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is your only floating task at the moment
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {hasMatches ? (
                <span>Select a provider above to send them a request</span>
              ) : (
                <span>You'll be notified when providers express interest</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskResultDialog;
