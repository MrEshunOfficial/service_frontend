"use client";

import { useState } from "react";
import {
  Home,
  Shield,
  Briefcase,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  Eye,
  Edit,
  Filter,
  Search,
  X,
} from "lucide-react";
import type { Service } from "@/types/service.types";
import {
  useAllServices,
  useApproveService,
  useRejectService,
  useDeleteService,
  useRestoreService,
} from "@/hooks/services/service.hook";
import { ThemeModeToggle } from "@/components/headerUi/ThemeModeToggle";

type ActionType = "approve" | "reject" | "delete" | "restore" | null;

export default function AdminServicesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as "asc" | "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const { services, loading, error, refetch, total, totalPages } =
    useAllServices(filters);
  const { approveService, loading: approving } = useApproveService();
  const { rejectService, loading: rejecting } = useRejectService();
  const { deleteService, loading: deleting } = useDeleteService();
  const { restoreService, loading: restoring } = useRestoreService();

  console.log(services);

  const handleApprove = async () => {
    if (!selectedService) return;
    try {
      await approveService(selectedService._id);
      refetch();
      closeDialog();
    } catch (err) {
      console.error("Failed to approve service:", err);
    }
  };

  const handleReject = async () => {
    if (!selectedService || !rejectionReason.trim()) return;
    try {
      await rejectService(selectedService._id, { reason: rejectionReason });
      refetch();
      closeDialog();
    } catch (err) {
      console.error("Failed to reject service:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      await deleteService(selectedService._id);
      refetch();
      closeDialog();
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const handleRestore = async () => {
    if (!selectedService) return;
    try {
      await restoreService(selectedService._id);
      refetch();
      closeDialog();
    } catch (err) {
      console.error("Failed to restore service:", err);
    }
  };

  const openDialog = (service: Service, action: ActionType) => {
    setSelectedService(service);
    setActionType(action);
    setActiveDropdown(null);
  };

  const closeDialog = () => {
    setSelectedService(null);
    setActionType(null);
    setRejectionReason("");
  };

  const getCategoryName = (service: Service): string => {
    if (typeof service.categoryId === "string") {
      return "Category";
    }
    return service.categoryId.catName || "Uncategorized";
  };

  const getStatusBadge = (service: Service) => {
    if (service.deletedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Deleted
        </span>
      );
    }
    if (service.rejectedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          Rejected
        </span>
      );
    }
    if (service.approvedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        Pending
      </span>
    );
  };

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isProcessing = approving || rejecting || deleting || restoring;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-900 dark:text-white font-medium">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">
            Failed to load services.
          </p>
          <button
            onClick={refetch}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="w-full p-4 border-b shadow-sm">
        <div className="w-full flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm">
            <a
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <span className="text-gray-500 dark:text-white/60">/</span>
            <a
              href="/admin"
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </a>
            <span className="text-gray-500 dark:text-white/60">/</span>
            <a
              href="/admin/service"
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Services</span>
            </a>
            <span className="text-gray-500 dark:text-white/60">/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Service List
            </span>
          </nav>
          <ThemeModeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 max-w-7xl mx-auto w-full">
        <div className=" rounded-lg shadow-lg overflow-hidden">
          {/* Header with Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  All Services
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage and monitor all services ({total} total)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterPopover(!showFilterPopover)}
                    className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  {showFilterPopover && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Filter Options
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Sort By
                            </label>
                            <select
                              value={filters.sortBy}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  sortBy: e.target.value as any,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="createdAt">Date Created</option>
                              <option value="title">Title</option>
                              <option value="updatedAt">Last Updated</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Order
                            </label>
                            <select
                              value={filters.sortOrder}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  sortOrder: e.target.value as "asc" | "desc",
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="desc">Descending</option>
                              <option value="asc">Ascending</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Items Per Page
                            </label>
                            <select
                              value={filters.limit}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  limit: Number(e.target.value),
                                  page: 1,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="5">5</option>
                              <option value="10">10</option>
                              <option value="20">20</option>
                              <option value="50">50</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[600px]">
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {searchTerm
                    ? "No services found matching your search."
                    : "No services available."}
                </p>
              </div>
            ) : (
              <table className="w-full border rounded-md">
                <thead className="bg-red-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 space-y-3">
                  {filteredServices.map((service) => (
                    <tr
                      key={service._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded mt-2"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {service.coverImage?.thumbnailUrl && (
                            <img
                              src={service.coverImage.thumbnailUrl}
                              alt={service.title}
                              className="w-10 h-10 rounded object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {service.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {service.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                          {getCategoryName(service)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(service)}</td>
                      <td className="px-6 py-4">
                        {service.servicePricing ? (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.servicePricing.currency}{" "}
                            {service.servicePricing.serviceBasePrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === service._id
                                  ? null
                                  : service._id
                              )
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          {activeDropdown === service._id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                  Actions
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                <button
                                  onClick={() => {
                                    window.open(
                                      `/services/${service.slug}`,
                                      "_blank"
                                    );
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Service
                                </button>
                                <button
                                  onClick={() => {
                                    window.open(
                                      `/admin/service/${service._id}/edit`,
                                      "_blank"
                                    );
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Service
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                {!service.approvedAt && !service.deletedAt && (
                                  <button
                                    onClick={() =>
                                      openDialog(service, "approve")
                                    }
                                    className="w-full flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>
                                )}
                                {!service.rejectedAt && !service.deletedAt && (
                                  <button
                                    onClick={() =>
                                      openDialog(service, "reject")
                                    }
                                    className="w-full flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                )}
                                {service.deletedAt ? (
                                  <button
                                    onClick={() =>
                                      openDialog(service, "restore")
                                    }
                                    className="w-full flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restore
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      openDialog(service, "delete")
                                    }
                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {filters.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialogs */}
      {actionType === "approve" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Approve Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to approve "{selectedService?.title}"? This
              will make it visible to all users.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {approving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionType === "reject" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Reject Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting "{selectedService?.title}".
            </p>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionType === "delete" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Delete Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{selectedService?.title}"? This
              action can be reversed later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionType === "restore" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Restore Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to restore "{selectedService?.title}"? This
              will make it available again.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={isProcessing}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {restoring ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Close filter popover when clicking outside */}
      {showFilterPopover && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowFilterPopover(false)}
        />
      )}
    </main>
  );
}
