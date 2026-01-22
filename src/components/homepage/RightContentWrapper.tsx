"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types/base.types";
import { TaskWithProvidersResponse } from "@/types/task.types";
import TaskForm from "@/components/tasks/task.form";
import ProviderDashboard from "./ProviderDashboard";
import VisitorView from "./VisitorView";

interface RightContentWrapperProps {
  isAuthenticated: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  userRole: UserRole | undefined;
  onBrowseServices: () => void;
  onTaskCreated?: (response: TaskWithProvidersResponse) => void;
}

const RightContentWrapper: React.FC<RightContentWrapperProps> = ({
  isAuthenticated,
  authLoading,
  profileLoading,
  userRole,
  onBrowseServices,
  onTaskCreated,
}) => {
  // Show loading state
  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show visitor view if not authenticated
  if (!isAuthenticated) {
    return <VisitorView />;
  }

  // Show provider dashboard for providers
  if (userRole === UserRole.PROVIDER) {
    return <ProviderDashboard />;
  }

  // Default to client view (TaskForm) for clients
  return (
    <TaskForm onBrowseServices={onBrowseServices} onSuccess={onTaskCreated} />
  );
};

export default RightContentWrapper;
