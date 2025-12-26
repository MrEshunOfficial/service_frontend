"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-react";
import { SystemRole, UserRole } from "@/types/base.types";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  useCompleteProfile,
  useProfileStats,
} from "@/hooks/profiles/userProfile.hook";
import { ImageUploadPopover } from "@/components/filemanager/EntityImageUpload";
import { NavigationLink } from "@/helpers/ProfNavigationLinksTypes";
import { getNavigationByRole } from "@/helpers/ProfileNavConfiguration";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "../ui/button";

interface UserProfileNavProps {
  onPostTask?: () => void;
  onBrowseTasks?: () => void;
}

export default function UserProfileNav({
  onPostTask,
  onBrowseTasks,
}: UserProfileNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [showPopover, setShowPopover] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Use authentication and profile hooks
  const { user, logout, isLoading: authLoading } = useAuth();
  const { completeProfile, loading: profileLoading } = useCompleteProfile({
    autoLoad: true,
  });
  const { stats, loading: statsLoading } = useProfileStats({
    autoLoad: true,
  });

  // Local state for current avatar URL
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(
    completeProfile?.profilePicture?.url
  );

  const navigateToAdmin = () => {
    // Navigate to specific admin page based on role
    if (user?.systemRole === SystemRole.SUPER_ADMIN) {
      router.push("/admin/super/dashboard");
    } else if (user?.systemRole === SystemRole.ADMIN) {
      router.push("/admin/dashboard");
    } else {
      // Fallback - shouldn't happen if the button is only shown to admins
      router.push("/admin/dashboard");
    }
  };

  // Update local state when profile picture changes
  useEffect(() => {
    if (completeProfile?.profilePicture?.url) {
      setCurrentAvatarUrl(completeProfile.profilePicture.url);
    }
  }, [completeProfile?.profilePicture?.url]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopover]);

  const handleNavClick = (link: NavigationLink) => {
    const hasChildren = link.children && link.children.length > 0;

    if (hasChildren) {
      // Toggle expansion
      setExpandedLinks((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(link.id)) {
          newSet.delete(link.id);
        } else {
          newSet.add(link.id);
        }
        return newSet;
      });
    } else if (link.href) {
      // Navigate using Next.js router
      router.push(link.href);
    }
  };

  const handleLogout = async () => {
    try {
      router.push("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfilePictureUpdate = (url: string) => {
    setCurrentAvatarUrl(url);
  };

  // Check if a link is active based on current pathname
  const isLinkActive = (link: NavigationLink): boolean => {
    if (!link.href) return false;

    // Exact match only for precise active state
    return pathname === link.href;
  };

  // Loading state
  const isLoading = authLoading || profileLoading;

  // Extract user information
  const profile = completeProfile?.profile;
  const displayName = user?.name?.split("@")[0] || "User";
  const displayEmail = user?.email || profile?.userId || "user@email.com";
  const userRole =
    profile?.role === UserRole.PROVIDER ? "Service Provider" : "Customer";
  const isProvider = profile?.role === UserRole.PROVIDER;

  // Get navigation links based on user role
  const navigationLinks = profile?.role
    ? getNavigationByRole(profile.role)
    : getNavigationByRole(UserRole.CUSTOMER);

  // Render navigation item
  const renderNavigationItem = (
    link: NavigationLink,
    depth: number = 0
  ): React.ReactNode => {
    const Icon = link.icon;
    const isActive = isLinkActive(link);
    const isExpanded = expandedLinks.has(link.id);
    const hasChildren = link.children && link.children.length > 0;

    return (
      <div key={link.id}>
        <button
          onClick={() => handleNavClick(link)}
          disabled={isLoading}
          className={`w-9/10 flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            depth > 0 ? "ml-3" : ""
          } ${
            isActive
              ? "bg-linear-to-r from-red-500 to-blue-600 text-white shadow-md"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm">{link.label}</span>
          </div>
          {hasChildren ? (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          ) : (
            <ChevronRight
              className={`w-4 h-4 transition-opacity ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </button>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {link.children!.map((child) =>
              renderNavigationItem(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Handle CTA action based on role
  const handleCTAAction = () => {
    if (isProvider) {
      onBrowseTasks?.();
    } else {
      onPostTask?.();
    }
  };

  const ctaLabel = isProvider ? "Browse Tasks" : "Post New Task";
  const ctaDescription = isProvider
    ? "Find work opportunities"
    : "Need help with something?";

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Profile Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 relative">
        <button
          ref={triggerRef}
          onClick={() => setShowPopover(!showPopover)}
          className="w-full h-48 bg-linear-to-br from-red-400 to-blue-500 relative overflow-hidden hover:opacity-95 transition-opacity cursor-pointer"
        >
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
            </div>
          ) : currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}

          {/* Minimal Overlaid User Info at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/60 to-transparent p-4 text-start">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse"></div>
                <div className="h-4 w-40 bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-white/20 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-white capitalize truncate drop-shadow-lg">
                  {displayName}
                </h3>
                <p className="text-xs text-white/90 truncate drop-shadow">
                  {displayEmail}
                </p>
                <span className="inline-block text-xs text-blue-300 font-medium bg-blue-500/30 px-2 py-0.5 rounded mt-1">
                  {userRole}
                </span>
              </>
            )}
          </div>
        </button>

        {/* Floating Popover */}
        {showPopover && (
          <div
            ref={popoverRef}
            className="absolute left-full top-0 ml-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-left-2 duration-200"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPopover(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Enlarged Profile Picture with Upload */}
            <div className="relative h-48 bg-linear-to-br from-red-400 to-blue-500 rounded-t-xl overflow-hidden">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                </div>
              )}

              {/* Upload Button - positioned bottom right */}
              <div className="absolute bottom-3 right-3 z-10">
                <ImageUploadPopover
                  type="profile"
                  currentImageUrl={currentAvatarUrl}
                  onUploadSuccess={handleProfilePictureUpdate}
                  trigger={
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 rounded-lg shadow-lg transition-colors text-sm cursor-pointer">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Change
                      </span>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-base font-bold text-gray-900 dark:text-white capitalize mt-0.5">
                  {displayName}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-all">
                  {displayEmail}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Role
                </label>
                <div className="mt-0.5">
                  <span className="inline-block text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                    {userRole}
                  </span>
                </div>
              </div>

              {profile?.bio && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Bio
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats?.activeProfiles || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {isProvider ? "Active Jobs" : "Active Tasks"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats?.profilesWithPictures || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Section - Dynamic with Expand/Collapse */}
      <ScrollArea className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-2 hide-scrollbar">
        {navigationLinks.map((link) => renderNavigationItem(link))}
      </ScrollArea>

      {(user?.systemRole === SystemRole.ADMIN ||
        user?.systemRole === SystemRole.SUPER_ADMIN) && (
        <div className="w-full flex items-center justify-center mb-2">
          {/* CTA Section - Role Based */}
          <Button
            className="w-3/4 py-3 bg-linear-to-r from-red-500 to-blue-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={navigateToAdmin}
          >
            <Shield size={14} />
            Admin Console
          </Button>
        </div>
      )}

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <button
          onClick={handleCTAAction}
          disabled={isLoading}
          className={`w-full py-3 bg-linear-to-r from-red-500 to-blue-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex flex-col items-center">
            <span>{ctaLabel}</span>
            <span className="text-xs font-normal opacity-90">
              {ctaDescription}
            </span>
          </div>
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{isLoading ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}
