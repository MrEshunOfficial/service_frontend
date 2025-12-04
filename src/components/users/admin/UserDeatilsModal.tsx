// pages/admin/users/components/UserDetailsModal.tsx

import { useState } from "react";
import { User, UpdateUserRoleData } from "@/types/user.types";
import {
  useUpdateUserRole,
  useDeleteUser,
  useRestoreUser,
} from "@/hooks/useAdminUsers";
import {
  X,
  Mail,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Key,
  LogOut,
  UserCircle,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserDetailsModal({
  user,
  onClose,
  onUpdate,
}: UserDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.systemRole);

  // Hooks
  const { updateRole, loading: updateLoading } = useUpdateUserRole({
    onSuccess: () => {
      setShowRoleChange(false);
      onUpdate();
    },
    onError: (error) => {
      alert(`Failed to update role: ${error.message}`);
    },
  });

  const { deleteUser, loading: deleteLoading } = useDeleteUser({
    onSuccess: () => {
      onUpdate();
      onClose();
    },
    onError: (error) => {
      alert(`Failed to delete user: ${error.message}`);
    },
  });

  const { restoreUser, loading: restoreLoading } = useRestoreUser({
    onSuccess: () => {
      onUpdate();
    },
    onError: (error) => {
      alert(`Failed to restore user: ${error.message}`);
    },
  });

  const isLoading = updateLoading || deleteLoading || restoreLoading;

  // Handlers
  const handleRoleUpdate = async () => {
    if (selectedRole === user.systemRole) {
      setShowRoleChange(false);
      return;
    }

    const roleData: UpdateUserRoleData = { systemRole: selectedRole };
    const userId = user._id || user.id;

    if (!userId) {
      alert("User ID is missing. Cannot update role.");
      return;
    }

    await updateRole(userId, roleData);
  };

  const handleDelete = async () => {
    const userId = user._id || user.id;

    if (!userId) {
      alert("User ID is missing. Cannot delete user.");
      return;
    }

    await deleteUser(userId);
  };

  const handleRestore = async () => {
    const userId = user._id || user.id;

    if (!userId) {
      alert("User ID is missing. Cannot restore user.");
      return;
    }

    await restoreUser(userId);
  };

  // Render helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const roleOptions = [
    { value: "user", label: "User", icon: UserCircle },
    { value: "moderator", label: "Moderator", icon: Shield },
    { value: "admin", label: "Admin", icon: ShieldCheck },
    { value: "super_admin", label: "Super Admin", icon: ShieldCheck },
  ];

  const getStatusColor = () => {
    if (user.isDeleted) return "red";
    if (!user.isEmailVerified) return "yellow";
    return "green";
  };

  const statusColor = getStatusColor();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Gradient Header */}
          <div className="relative h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/20" />
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all disabled:opacity-50 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="relative px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-900 shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl border-4 border-white dark:border-gray-900 shadow-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Status indicator */}
                <div
                  className={`absolute bottom-2 right-2 w-6 h-6 bg-${statusColor}-500 border-4 border-white dark:border-gray-900 rounded-full`}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {user.isSuperAdmin && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                      Super Admin
                    </span>
                  )}
                  {user.isAdmin && !user.isSuperAdmin && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-lg">
                      <Shield className="w-4 h-4" />
                      Admin
                    </span>
                  )}
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-semibold rounded-lg">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                  {user.isDeleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold rounded-lg">
                      <XCircle className="w-4 h-4" />
                      Deleted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 pb-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 dark:bg-blue-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Last Active
                    </div>
                    <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      {formatRelativeTime(user.security.lastLogin)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600 dark:bg-purple-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      Member Since
                    </div>
                    <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                      {formatRelativeTime(user.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-600 dark:bg-pink-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-pink-700 dark:text-pink-300 font-medium">
                      System Role
                    </div>
                    <div className="text-sm font-bold text-pink-900 dark:text-pink-100 capitalize">
                      {user.systemRole.replace("_", " ")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Account Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Auth Provider
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {user.authProvider}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Created
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity Timeline
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Last Login
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(user.security.lastLogin)}
                    </span>
                  </div>

                  {user.security.lastLoggedOut && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" />
                        Last Logout
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(user.security.lastLoggedOut)}
                      </span>
                    </div>
                  )}

                  {user.security.passwordChangedAt && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Key className="w-3.5 h-3.5" />
                        Password Changed
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(user.security.passwordChangedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role Change Section */}
            {!user.isDeleted && (
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Change User Role
                </h4>
                {showRoleChange ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer text-gray-900 dark:text-white font-medium"
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleRoleUpdate}
                        disabled={isLoading || selectedRole === user.systemRole}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                      >
                        {updateLoading && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setShowRoleChange(false);
                          setSelectedRole(user.systemRole);
                        }}
                        disabled={isLoading}
                        className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRoleChange(true)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50"
                  >
                    Change Role
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            {user.isDeleted ? (
              <button
                onClick={handleRestore}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/30"
              >
                {restoreLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <RotateCcw className="w-4 h-4" />
                Restore User
              </button>
            ) : showDeleteConfirm ? (
              <div className="flex items-center gap-4 w-full">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Are you sure you want to delete this user?
                  </span>
                </div>
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/30"
                  >
                    {deleteLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
