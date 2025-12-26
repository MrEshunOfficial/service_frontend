"use client";
import React from "react";
import {
  Shield,
  TrendingUp,
  ArrowRight,
  Users,
  Briefcase,
  UserPlus,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/profiles/userProfile.hook";
import { UserRole } from "@/types/base.types";
import TaskForm from "@/components/tasks/task.form";

// Component for authenticated providers
const ProviderDashboard: React.FC = () => {
  const router = useRouter();
  const { loading: statsLoading } = useProfile();

  return (
    <div className="space-y-6">
      {/* Provider Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Provider Dashboard
          </h2>
        </div>

        {!statsLoading ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Completed Tasks
              </div>
            </div>
            <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {"N/A"}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Average Rating
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl animate-pulse h-20"></div>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl animate-pulse h-20"></div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/tasks/available")}
            className="w-full py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Browse Available Tasks
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.push("/provider/tasks")}
            className="w-full py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            View My Tasks
          </button>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Opportunities Near You
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              onClick={() => router.push("/tasks/available")}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Task #{item}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    East Legon, Accra
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                  New
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for unauthenticated visitors
const VisitorView: React.FC = () => {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Get Started Today
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Join our platform to post tasks or offer your services
      </p>

      <div className="space-y-4">
        {/* Client Option */}
        <div className="p-5 bg-linear-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                I Need Help (Client)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Post tasks and connect with verified service providers
              </p>
              <button
                onClick={() => router.push("/signup?role=client")}
                className="px-4 py-2 bg-linear-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-700 transition-all text-sm flex items-center gap-2"
              >
                Sign up as Client
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Provider Option */}
        <div className="p-5 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                I Offer Services (Provider)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Find tasks, build your reputation, and earn money
              </p>
              <button
                onClick={() => router.push("/signup?role=provider")}
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm flex items-center gap-2"
              >
                Sign up as Provider
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="relative px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
            Already have an account?
          </span>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Sign In
        </button>
      </div>

      {/* Trust indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Verified users</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Secure platform</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile({
    autoLoad: isAuthenticated,
  });

  const handleBrowseServices = (): void => {
    router.push("/services");
  };

  const handleViewMyTasks = (): void => {
    router.push("/tasks/posted");
  };

  // Determine user role from profile or user object
  const userRole = profile?.role;
  const isProvider = profile?.role === UserRole.PROVIDER;
  const isClient = userRole === UserRole.CUSTOMER;

  // Determine which content to show
  const renderRightContent = () => {
    if (authLoading || (isAuthenticated && profileLoading)) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <VisitorView />;
    }

    if (isProvider) {
      return <ProviderDashboard />;
    }

    // Default to client view (TaskForm)
    return <TaskForm onBrowseServices={handleBrowseServices} />;
  };

  return (
    <div className="w-full h-full bg-linear-to-b from-red-50 to-white dark:from-gray-950 dark:to-gray-900 relative">
      {/* Blurred logo background */}
      <div className="absolute inset-0 opacity-25 dark:opacity-35 pointer-events-none">
        <div className="w-full h-full bg-linear-to-br from-red-100 via-pink-50 to-blue-100 dark:from-red-950 dark:via-pink-950 dark:to-blue-950 blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left content */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              {!isAuthenticated || isClient ? (
                <>
                  Post a task and find
                  <span className="block bg-linear-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                    the right helper instantly
                  </span>
                </>
              ) : (
                <>
                  Find tasks and
                  <span className="block bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    grow your business
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {!isAuthenticated || isClient
                ? "Post what you need and receive fast responses from trusted providers ready to help—whether it's daily errands, home services, or specialized tasks."
                : "Connect with clients who need your services. Browse available tasks, respond to opportunities, and build your reputation on our trusted platform."}
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {isProvider ? "Verified Clients" : "Verified Providers"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Background checked
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    Best Rates
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Competitive pricing
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action link - only show for authenticated clients */}
            {isAuthenticated && isClient && (
              <div className="pt-2">
                <button
                  onClick={handleViewMyTasks}
                  className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors group"
                >
                  View my tasks
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Right content - Dynamic based on user role */}
          {renderRightContent()}
        </div>
      </div>

      {/* How it works section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {!isAuthenticated || isClient ? (
            // Client flow
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-linear-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Post Your Task
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Describe what you need help with and when you need it
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-linear-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Get Matched
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive responses from verified providers in your area
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-linear-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Get It Done
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your provider and get your task completed
                </p>
              </div>
            </>
          ) : (
            // Provider flow
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-linear-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Browse Tasks
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Find tasks that match your skills and availability
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Submit Offer
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Respond to tasks with your best offer and timeline
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-linear-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Earn Money
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete tasks and build your reputation
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
