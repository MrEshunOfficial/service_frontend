// pages/admin/users/AdminUsersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { User } from "@/types/user.types";
import {
  Search,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { UserDetailsModal } from "./UserDeatilsModal";
import { FilterPanel } from "./FilterPannel";
import { UserTable } from "./UserTable";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface FilterState {
  search: string;
  status: string;
  role: string;
}

export function AdminUsersPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    role: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: pageSize,
    };

    if (filters.search) params.search = filters.search;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.role !== "all") params.role = filters.role;

    return params;
  }, [currentPage, pageSize, filters]);

  const { users, pagination, loading, error, refetch } = useAdminUsers(
    apiParams,
    {
      autoLoad: true,
    }
  );

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
  };

  const handleUserUpdate = () => {
    refetch();
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <UserPlus className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No users found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {filters.search || filters.status !== "all" || filters.role !== "all"
          ? "Try adjusting your filters to see more results"
          : "There are no users in the system yet"}
      </p>
      {(filters.search ||
        filters.status !== "all" ||
        filters.role !== "all") && (
        <button
          onClick={() => {
            setFilters({ search: "", status: "all", role: "all" });
            setCurrentPage(1);
          }}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Failed to load users
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {error?.message || "An error occurred while loading users"}
      </p>
      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages } = pagination;
    const showingStart = (page - 1) * pageSize + 1;
    const showingEnd = Math.min(page * pageSize, pagination.total);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{showingStart}</span> to{" "}
          <span className="font-medium">{showingEnd}</span> of{" "}
          <span className="font-medium">{pagination.total}</span> users
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              let pageNum: number;
              if (pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pages - 2) {
                pageNum = pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-2 gap-2">
        <div className="flex-1 flex flex-col items-start justify-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex-1 relative flex items-center justify-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex-1 flex items-center justify-end gap-2">
          <Button
            onClick={() => refetch()}
            disabled={loading}
            size={"icon"}
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4" />
                {(filters.status !== "all" || filters.role !== "all") && (
                  <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border-none">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  setFilters({
                    search: filters.search,
                    status: "all",
                    role: "all",
                  });
                  setCurrentPage(1);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content */}
      <div className="w-full mt-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl">
          {loading && !users ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            renderErrorState()
          ) : !users || users.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Users Table */}
              <UserTable users={users} onUserClick={handleUserClick} />

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleModalClose}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}
