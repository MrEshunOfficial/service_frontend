"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Shield, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/profiles/userProfile.hook";
import { useCustomerTasks } from "@/hooks/useTasksAndBookings";
import { UserRole } from "@/types/base.types";
import { TaskWithProvidersResponse, TaskStatus } from "@/types/task.types";
import HowItWorks from "@/helpers/HowItWorks";
import RightContentWrapper from "@/components/homepage/RightContentWrapper";
import TaskResultDialog from "@/components/tasks/TaskResultDialog";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile({
    autoLoad: isAuthenticated,
  });

  // ✅ FIX: Create stable params object using useMemo
  const taskParams = useMemo(
    () => ({ status: TaskStatus.FLOATING }),
    [], // Empty dependency array - created only once
  );

  const { tasks } = useCustomerTasks(
    taskParams,
    isAuthenticated && profile?.role === UserRole.CUSTOMER,
  );

  const [showTaskResultDialog, setShowTaskResultDialog] = useState(false);
  const [taskResult, setTaskResult] =
    useState<TaskWithProvidersResponse | null>(null);

  // Determine user role from profile
  const userRole = profile?.role;
  const isProvider = userRole === UserRole.PROVIDER;
  const isClient = userRole === UserRole.CUSTOMER;

  // Get floating tasks for the dialog
  const floatingTasks = tasks.filter(
    (task) => task.status === TaskStatus.FLOATING,
  );

  const handleBrowseServices = () => {
    router.push("/services");
  };

  const handleViewMyTasks = () => {
    router.push("/tasks/posted");
  };

  const handleTaskCreated = (response: TaskWithProvidersResponse) => {
    setTaskResult(response);
    setShowTaskResultDialog(true);
  };

  const handleCloseDialog = () => {
    setShowTaskResultDialog(false);
    setTaskResult(null);
  };

  return (
    <>
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
                    className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors group">
                    View my tasks
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Right content - Dynamic based on user role */}
            <RightContentWrapper
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              profileLoading={profileLoading}
              userRole={userRole}
              onBrowseServices={handleBrowseServices}
              onTaskCreated={handleTaskCreated}
            />
          </div>
        </div>
        <HowItWorks
          userRole={
            !isAuthenticated ? "visitor" : isProvider ? "provider" : "client"
          }
        />
      </div>

      {/* Task Result Dialog */}
      <TaskResultDialog
        isOpen={showTaskResultDialog}
        onClose={handleCloseDialog}
        taskResult={taskResult}
        floatingTasks={floatingTasks}
      />
    </>
  );
}
