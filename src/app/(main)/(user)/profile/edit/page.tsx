"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/profiles/user.profile/user.profile.form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/profiles/userProfile.hook";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading, error } = useProfile({
    autoLoad: true,
  });

  // Track if initial load has completed
  const hasLoadedRef = useRef(false);

  // Redirect if no profile exists - but only after initial load completes
  useEffect(() => {
    // Wait for the initial load to complete
    if (loading) {
      hasLoadedRef.current = true;
      return;
    }

    // Only check after we've actually attempted to load
    if (hasLoadedRef.current && !profile && !error) {
      toast.error("No profile found. Please create one first.");
      router.push("/profile/create");
    }
  }, [loading, profile, error, router]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load profile: ${error.message}`);
    }
  }, [error]);

  const handleSuccess = () => {
    toast.success("Profile updated successfully!");
    router.push("/profile");
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
      {/* Breadcrumb */}
      <div className="w-full p-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/profile"
                  className="text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
                >
                  Profile
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                  Edit Profile
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-[url('/errand-logo.jpg')] bg-cover bg-center bg-no-repeat opacity-5 dark:opacity-[0.03]"
          aria-hidden="true"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-black/30 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Content Layer */}
        <div className="relative h-full overflow-auto hide-scrollbar flex items-center justify-center p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-gray-700 dark:text-white/90 font-medium">
                Loading your profile...
              </p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center border border-red-200 dark:border-red-500/20">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Failed to Load Profile
                </h2>
                <p className="text-gray-600 dark:text-white/70 mb-6">
                  {error.message}
                </p>
                <button
                  onClick={() => router.push("/profile")}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : profile ? (
            <ProfileForm
              mode="update"
              initialData={profile}
              showSuccessScreen={false}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
