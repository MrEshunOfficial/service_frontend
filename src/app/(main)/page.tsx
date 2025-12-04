"use client";
import React, { useState } from "react";
import { Search, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [serviceQuery, setServiceQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handlePostService = (): void => {
    if (serviceQuery.trim()) {
      // Navigate to task creation page with pre-filled title
      const encodedTitle = encodeURIComponent(serviceQuery);
      router.push(`/task/create?title=${encodedTitle}`);
    }
  };

  const handleBrowseServices = (): void => {
    router.push("/services");
  };

  const handleViewMyTasks = (): void => {
    router.push("/task");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handlePostService();
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-red-50 to-white dark:from-gray-950 dark:to-gray-900 relative">
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
        <div className="grid md:grid-cols-2 gap-12 items-center">
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
              {/* Verified Providers */}
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

              {/* Best Rates */}
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
            <div className="pt-6">
              <button
                onClick={handleViewMyTasks}
                className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors group">
                View my tasks
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right content - Search card */}
          <div className="relative z-10">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-blue-500 rounded-3xl transform rotate-3 opacity-10"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                What do you need help with?
              </h2>

              {/* Search input */}
              <div className="space-y-4">
                <div
                  className={`relative transition-all duration-300 ${
                    isFocused ? "ring-2 ring-red-500 rounded-2xl" : ""
                  }`}>
                  <input
                    type="text"
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="e.g. Pick up a child, deliveries, home chores..."
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none dark:text-white placeholder-gray-400 text-base"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-red-600 rounded-xl">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Helper text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  Describe your task briefly. You'll add more details on the
                  next page.
                </p>

                {/* Action buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handlePostService}
                    disabled={!serviceQuery.trim()}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-blue-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2">
                    Create Task
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <span className="relative px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                      or
                    </span>
                  </div>

                  <button
                    onClick={handleBrowseServices}
                    className="w-full py-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    Browse All Services
                  </button>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    <span>Secure payments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Step 1 */}
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

          {/* Step 2 */}
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

          {/* Step 3 */}
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
