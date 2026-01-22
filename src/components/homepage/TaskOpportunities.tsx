"use client";
import React from "react";

interface TaskOpportunitiesData {
  matched?: number;
  floating?: number;
  newThisWeek?: number;
}

interface TaskOpportunitiesProps {
  opportunities: TaskOpportunitiesData;
}

const TaskOpportunities: React.FC<TaskOpportunitiesProps> = ({
  opportunities,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Task Opportunities
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {opportunities.matched || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Matched
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {opportunities.floating || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Floating
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {opportunities.newThisWeek || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            New This Week
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOpportunities;
