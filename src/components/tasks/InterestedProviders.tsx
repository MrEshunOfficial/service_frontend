"use client";
import { TaskDTO } from "@/types/task.types";
import { ProviderProfile } from "@/types/provider.types";
import { X, User, Loader2, CheckCircle, Star, MapPin } from "lucide-react";

interface InterestedProvidersPopoverProps {
  task: TaskDTO;
  onClose: () => void;
  onRequestProvider: (providerId: string) => void;
  isRequesting: boolean;
  requestingProviderId: string | null;
}

export function InterestedProvidersPopover({
  task,
  onClose,
  onRequestProvider,
  isRequesting,
  requestingProviderId,
}: InterestedProvidersPopoverProps) {
  const interestedProviders = task.interestedProviders || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interested Providers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {interestedProviders.length} provider
              {interestedProviders.length !== 1 ? "s" : ""} expressed interest
              in this task
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6">
          {interestedProviders.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No providers have expressed interest yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interestedProviders.map((provider) => (
                <ProviderCard
                  key={provider._id}
                  provider={provider}
                  onRequestProvider={onRequestProvider}
                  isRequesting={
                    isRequesting && requestingProviderId === provider._id
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Click on a provider card to view their full profile before
            requesting
          </p>
        </div>
      </div>
    </div>
  );
}

// Provider Card Component
interface ProviderCardProps {
  provider: ProviderProfile;
  onRequestProvider: (providerId: string) => void;
  isRequesting: boolean;
}

function ProviderCard({
  provider,
  onRequestProvider,
  isRequesting,
}: ProviderCardProps) {
  // Get profile picture from user profile
  const profileImage = provider.profile?.profilePictureId?.url;
  const businessGalleryImage = provider.BusinessGalleryImages?.[0];
  const displayImage = profileImage || businessGalleryImage;

  // Get display name
  const displayName = provider.businessName || "Provider";

  // Get location from locationData
  const location =
    provider.locationData?.locality ||
    provider.locationData?.city ||
    provider.locationData?.district ||
    "Location not specified";

  // TODO: Add rating and completed tasks to ProviderProfile interface
  const rating = 0; // Placeholder until rating system is added
  const completedTasks = 0; // Placeholder until task completion tracking is added

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Provider Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              {provider.isCompanyTrained && (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Company Trained</span>
                </div>
              )}
            </div>
          </div>

          {/* Provider Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-15">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{location}</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2 mt-2 ml-15">
            {completedTasks > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {completedTasks} completed tasks
              </span>
            )}
            {provider.isAlwaysAvailable && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                Always Available
              </span>
            )}
            {provider.requireInitialDeposit && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                Deposit Required{" "}
                {provider.percentageDeposit
                  ? `(${provider.percentageDeposit}%)`
                  : ""}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              window.open(`/providers/${provider._id}`, "_blank");
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            View Profile
          </button>
          <button
            onClick={() => onRequestProvider(provider._id)}
            disabled={isRequesting}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isRequesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Requesting...
              </>
            ) : (
              "Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
