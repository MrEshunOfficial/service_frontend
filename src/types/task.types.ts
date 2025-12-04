// types/task.types.shared.ts
// Frontend-safe types (no Mongoose dependencies)

/**
 * Task Priority Levels (Urgency)
 */
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * Task Status
 */
export enum TaskStatus {
  DRAFT = "draft",
  OPEN = "open",
  FLOATING = "floating",
  REQUESTED = "requested",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

/**
 * Task Location
 */
export interface TaskLocation {
  clientLocality: string;
  clientGPSAddress: string;
  providerLocality: string;
}

/**
 * Task Schedule
 */
export interface TaskSchedule {
  urgency: TaskPriority;
  preferredDate?: string; // ISO date string
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
}

/**
 * Task DTO (Data Transfer Object)
 * Clean type without Mongoose references - safe for frontend
 */
export interface TaskDTO {
  _id: string;
  title: string;
  customerId: string;
  location: TaskLocation;
  schedule: TaskSchedule;
  status: TaskStatus;
  expiresAt?: string;
  matchedProviders?: string[];
  hasMatches: boolean;
  interestedProviders?: string[];
  requestedProviderId?: string;
  requestedAt?: string;
  assignedProviderId?: string;
  assignedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted?: boolean;
}

/**
 * Provider Match Result DTO
 */
export interface ProviderMatchDTO {
  provider: any; // Replace with ProviderProfileDTO
  matchScore: number;
  matchReasons: string[];
  distance?: number;
  availability: boolean;
  relevantServices: any[]; // Replace with ServiceDTO[]
  providerRating?: number;
  completedTasksCount?: number;
  responseTime?: number;
}

/**
 * Request Bodies (used by both frontend and backend)
 */
export interface CreateTaskRequestBody {
  title: string;
  location: TaskLocation;
  schedule: TaskSchedule;
}

export interface UpdateTaskRequestBody {
  title?: string;
  location?: TaskLocation;
  schedule?: TaskSchedule;
  status?: TaskStatus;
}

export interface ExpressInterestRequestBody {
  taskId: string;
  message?: string;
}

export interface RequestProviderRequestBody {
  taskId: string;
  providerId: string;
  message?: string;
}

/**
 * API Response Types
 */
export interface TaskResponse {
  message: string;
  task?: TaskDTO;
  error?: string;
}

export interface TaskListResponse {
  message: string;
  tasks?: TaskDTO[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

export interface TaskWithMatchesResponse {
  message: string;
  task?: TaskDTO;
  matches?: ProviderMatchDTO[];
  totalMatches?: number;
  error?: string;
}

export interface TaskSearchResponse {
  message: string;
  tasks?: TaskDTO[];
  total?: number;
  error?: string;
}

export interface CustomerStatsResponse {
  message: string;
  stats?: {
    totalTasks: number;
    draftTasks: number;
    openTasks: number;
    floatingTasks: number;
    assignedTasks: number;
    completedTasks: number;
    cancelledTasks: number;
  };
  error?: string;
}

export interface ProviderStatsResponse {
  message: string;
  stats?: {
    totalMatches: number;
    acceptedTasks: number;
    completedTasks: number;
    declinedTasks: number;
    inProgressTasks: number;
    averageRating?: number;
    completionRate?: number;
  };
  error?: string;
}

/**
 * Type guards for runtime checking
 */
export function isTaskDTO(obj: any): obj is TaskDTO {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj._id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.status === "string" &&
    Object.values(TaskStatus).includes(obj.status)
  );
}

export function isTaskResponse(obj: any): obj is TaskResponse {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.message === "string" &&
    (obj.task === undefined || isTaskDTO(obj.task))
  );
}

/**
 * Utility types for frontend forms
 */
export type CreateTaskFormData = CreateTaskRequestBody;
export type UpdateTaskFormData = UpdateTaskRequestBody;

/**
 * Client-side computed properties
 */
export interface TaskWithComputed extends TaskDTO {
  isExpired: boolean;
  isActive: boolean;
  isFloating: boolean;
  hasAssignedProvider: boolean;
  daysUntilExpiry: number | null;
  matchCount: number;
  interestCount: number;
}

/**
 * Helper function to add computed properties
 */
export function enrichTaskWithComputed(task: TaskDTO): TaskWithComputed {
  const now = new Date();
  const expiresAt = task.expiresAt ? new Date(task.expiresAt) : null;

  return {
    ...task,
    isExpired: expiresAt ? expiresAt < now : false,
    isActive: [
      TaskStatus.OPEN,
      TaskStatus.FLOATING,
      TaskStatus.REQUESTED,
      TaskStatus.ASSIGNED,
      TaskStatus.IN_PROGRESS,
    ].includes(task.status),
    isFloating: task.status === TaskStatus.FLOATING,
    hasAssignedProvider: !!task.assignedProviderId,
    daysUntilExpiry: expiresAt
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null,
    matchCount: task.matchedProviders?.length || 0,
    interestCount: task.interestedProviders?.length || 0,
  };
}
