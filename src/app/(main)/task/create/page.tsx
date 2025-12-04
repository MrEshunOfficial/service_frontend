"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Send,
  Save,
} from "lucide-react";
import { useCreateTask, usePublishTask } from "@/hooks/useTask";
import {
  TaskPriority,
  TaskDTO,
  TaskWithMatchesResponse,
} from "@/types/task.types";

interface TaskFormData {
  title: string;
  clientLocality: string;
  clientGPSAddress: string;
  providerLocality: string;
  urgency: TaskPriority;
  preferredDate: string;
  startTime: string;
  endTime: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const titleFromUrl = searchParams.get("title") || "";

  const [formData, setFormData] = useState<TaskFormData>({
    title: titleFromUrl,
    clientLocality: "",
    clientGPSAddress: "",
    providerLocality: "",
    urgency: TaskPriority.MEDIUM,
    preferredDate: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  const {
    task: createdTask,
    loading: creating,
    error: createError,
    createTask,
  } = useCreateTask({
    onSuccess: (data: unknown) => {
      const task = data as TaskDTO | null;
      if (task) {
        setCreatedTaskId(task._id);
      }
    },
  });

  console.log(createdTask);

  const {
    publishResult,
    loading: publishing,
    error: publishError,
    publishTask,
  } = usePublishTask({
    onSuccess: (data: unknown) => {
      const result = data as TaskWithMatchesResponse;
      // Navigate to task details page
      if (result?.task) {
        setTimeout(() => {
          router.push(`/tasks/${result.task!._id}`);
        }, 1500);
      }
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    if (!formData.clientLocality.trim()) {
      newErrors.clientLocality = "Your locality is required";
    }
    if (!formData.providerLocality.trim()) {
      newErrors.providerLocality = "Provider locality is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof TaskFormData,
    value: string | TaskPriority
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;

    try {
      await createTask({
        title: formData.title,
        location: {
          clientLocality: formData.clientLocality,
          clientGPSAddress:
            formData.clientGPSAddress || formData.clientLocality,
          providerLocality: formData.providerLocality,
        },
        schedule: {
          urgency: formData.urgency,
          preferredDate: formData.preferredDate || undefined,
          timeSlot:
            formData.startTime && formData.endTime
              ? {
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                }
              : undefined,
        },
      });

      // Show success message and navigate
      setTimeout(() => {
        router.push("/tasks/available");
      }, 1500);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const handlePublishTask = async () => {
    if (!validateForm()) return;

    try {
      // First create the task
      const task = await createTask({
        title: formData.title,
        location: {
          clientLocality: formData.clientLocality,
          clientGPSAddress:
            formData.clientGPSAddress || formData.clientLocality,
          providerLocality: formData.providerLocality,
        },
        schedule: {
          urgency: formData.urgency,
          preferredDate: formData.preferredDate || undefined,
          timeSlot:
            formData.startTime && formData.endTime
              ? {
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                }
              : undefined,
        },
      });

      // Then publish it
      if (task) {
        await publishTask(task._id);
      }
    } catch (err) {
      console.error("Failed to publish task:", err);
    }
  };

  const isLoading = creating || publishing;
  const showSuccess = createdTask && !publishing && !createError;
  const showPublishSuccess = publishResult && !publishError;

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create a New Task
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below to post your task and get matched with
            providers
          </p>
        </div>

        {/* Success Messages */}
        {showSuccess && !showPublishSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Task saved as draft!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Redirecting to your tasks...
              </p>
            </div>
          </div>
        )}

        {showPublishSuccess && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Task published successfully!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Found {publishResult.totalMatches || 0} matching providers.
                Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(createError || publishError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {createError?.message ||
                  publishError?.message ||
                  "Something went wrong"}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g. Pick up groceries from the store"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                  errors.title
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Location Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Your Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientLocality}
                  onChange={(e) =>
                    handleInputChange("clientLocality", e.target.value)
                  }
                  placeholder="e.g. East Legon, Accra"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                    errors.clientLocality
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white`}
                />
                {errors.clientLocality && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.clientLocality}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  GPS Address (Optional)
                </label>
                <input
                  type="text"
                  value={formData.clientGPSAddress}
                  onChange={(e) =>
                    handleInputChange("clientGPSAddress", e.target.value)
                  }
                  placeholder="e.g. GA-123-4567"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Helps providers find you more easily
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Provider Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.providerLocality}
                  onChange={(e) =>
                    handleInputChange("providerLocality", e.target.value)
                  }
                  placeholder="e.g. East Legon, Accra"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                    errors.providerLocality
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white`}
                />
                {errors.providerLocality && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.providerLocality}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Where should the provider be located?
                </p>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Schedule & Priority
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.values(TaskPriority).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => handleInputChange("urgency", priority)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.urgency === priority
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Preferred Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    handleInputChange("preferredDate", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveAsDraft}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2">
              {creating && !publishing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save as Draft
            </button>

            <button
              onClick={handlePublishTask}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-blue-600 text-white rounded-lg hover:from-red-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-lg">
              {publishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publish & Find Providers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Save as draft to complete later</li>
                <li>• Publish to instantly match with nearby providers</li>
                <li>
                  • You'll see all matched providers and can choose who to work
                  with
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
