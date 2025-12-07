"use client";
import React from "react";
import { Shield, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/tasks/task.form";

export default function HomePage() {
  const router = useRouter();

  const handleBrowseServices = (): void => {
    router.push("/services");
  };

  const handleViewMyTasks = (): void => {
    router.push("/tasks/posted");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-950 dark:to-gray-900 relative">
      {/* Blurred logo background */}
      <div className="absolute inset-0 opacity-25 dark:opacity-35 pointer-events-none">
        <img
          src="/errand-logo.jpg"
          alt=""
          className="w-full h-full object-cover blur-3xl scale-150"
        />
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left content */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Post a task and find
              <span className="block bg-gradient-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                the right helper instantly
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Post what you need and receive fast responses from trusted
              providers ready to help—whether it's daily errands, home services,
              or specialized tasks.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    Verified Providers
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

            {/* Quick action link */}
            <div className="pt-2">
              <button
                onClick={handleViewMyTasks}
                className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors group"
              >
                View my tasks
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right content - Task Form Card */}
          <TaskForm onBrowseServices={handleBrowseServices} />
        </div>
      </div>

      {/* How it works section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Get It Done
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your provider and get your task completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
