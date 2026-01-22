"use client";
import React from "react";

interface ProviderDashboard {
  completedBookings?: number;
  activeBookings?: number;
  matchedTasks?: number;
  totalEarnings?: number;
}

interface ProviderStatsProps {
  dashboard: ProviderDashboard | null | undefined;
  loading: boolean;
}

const ProviderStats: React.FC<ProviderStatsProps> = ({
  dashboard,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl animate-pulse h-20"></div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl animate-pulse h-20"></div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl animate-pulse h-20"></div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl animate-pulse h-20"></div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {dashboard.completedBookings || 0}
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Completed Tasks
        </div>
      </div>
      <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
          {dashboard.activeBookings || 0}
        </div>
        <div className="text-sm text-green-700 dark:text-green-300">
          Active Bookings
        </div>
      </div>
      <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
          {dashboard.matchedTasks || 0}
        </div>
        <div className="text-sm text-purple-700 dark:text-purple-300">
          Matched Tasks
        </div>
      </div>
      <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
          GHS {dashboard.totalEarnings?.toFixed(2) || "0.00"}
        </div>
        <div className="text-sm text-amber-700 dark:text-amber-300">
          Total Earnings
        </div>
      </div>
    </div>
  );
};

export default ProviderStats;
