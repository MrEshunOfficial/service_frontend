"use client";
import React from "react";
import { Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProviderProfile } from "@/hooks/profiles/useProviderProfile";
import { useProviderDashboard } from "@/hooks/useTasksAndBookings";
import ProviderSetupPrompt from "./ProviderSetupPrompt";
import ProviderStats from "./ProviderStats";
import TaskOpportunities from "./TaskOpportunities";
import { Button } from "../ui/button";

const ProviderDashboard = () => {
  const router = useRouter();
  const { profile: providerProfile } = useProviderProfile(true);
  const {
    dashboard,
    loading: statsLoading,
    error: dashboardError,
  } = useProviderDashboard(!providerProfile);

  // Show setup message if no provider profile exists
  if (!providerProfile && !statsLoading) {
    return <ProviderSetupPrompt />;
  }

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

        {dashboardError ? (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Complete your provider profile to start receiving tasks
            </p>
            <button
              onClick={() => router.push("/provider/setup")}
              className="mt-3 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors text-sm">
              Complete Profile Setup
            </button>
          </div>
        ) : (
          <ProviderStats dashboard={dashboard} loading={statsLoading} />
        )}

        <div className="space-y-3">
          {!dashboardError && (
            <>
              <Button
                size={"sm"}
                onClick={() => router.push("/provider/tasks/available")}
                className="w-full bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm">
                Browse Available Tasks
                <ArrowRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Task Opportunities */}
      {dashboard?.taskOpportunities && !dashboardError && (
        <TaskOpportunities opportunities={dashboard.taskOpportunities} />
      )}
    </div>
  );
};

export default ProviderDashboard;
