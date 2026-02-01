// types/frontend/task.types.ts
// Consolidated interface file for Tasks and Bookings

import { UserLocation } from "./base.types";
import { ProviderProfile } from "./profiles/provider-profile.types";

/**
 * =============================================================================
 * ENUMS
 * =============================================================================
 */

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskStatus {
  PENDING = "PENDING",
  MATCHED = "MATCHED",
  FLOATING = "FLOATING",
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  CONVERTED = "CONVERTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/**
 * =============================================================================
 * TASK RELATED INTERFACES
 * =============================================================================
 */

export interface TaskSchedule {
  priority: TaskPriority;
  preferredDate?: Date | string;
  flexibleDates?: boolean;
  timeSlot?: {
    start: string;
    end: string;
  };
}

export interface TaskBudget {
  min?: number;
  max?: number;
  currency: string;
}

export interface MatchingCriteria {
  useLocationOnly: boolean;
  searchTerms: string[];
  categoryMatch: boolean;
}

export interface InterestedProvider {
  providerId: string;
  expressedAt: Date | string;
  message?: string;
  provider?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    rating?: number;
  };
}

export interface RequestedProvider {
  providerId: string;
  requestedAt: Date | string;
  clientMessage?: string;
}

export interface AcceptedProvider {
  providerId: string;
  acceptedAt: Date | string;
  providerMessage?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  customerId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    contactDetails?: {
      primaryContact: string;
      secondaryContact?: string;
    };
  };
  customerLocation: UserLocation;
  schedule: TaskSchedule;
  status: TaskStatus;
  expiresAt?: Date | string;
  matchedProviders?: ProviderProfile[];
  matchingAttemptedAt?: Date | string;
  matchingCriteria?: MatchingCriteria;
  interestedProviders?: InterestedProvider[];
  requestedProvider?: RequestedProvider;
  acceptedProvider?: AcceptedProvider;
  convertedToBookingId?: string;
  convertedAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  cancelledBy?: string;
  viewCount: number;
  isDeleted: boolean;
  deletedAt?: Date | string;
  deletedBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * =============================================================================
 * BOOKING INTERFACES
 * =============================================================================
 */

export interface ServiceInfo {
  _id: string;
  title: string;
  isApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
}

export interface BookingStatusHistoryItem {
  status: BookingStatus;
  timestamp: Date | string;
  actor: string;
  actorRole: "customer" | "service_provider" | "admin";
  message?: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;

  // References - can be either strings (ObjectIds) or populated objects
  taskId: string | Task;
  clientId: string;
  providerId:
    | string
    | {
        _id: string;
        businessName?: string;
        locationData?: UserLocation;
        isActive?: boolean;
        hasVerifiedAddress?: boolean;
        firstName?: string;
        lastName?: string;
        profileImage?: string;
        rating?: number;
        contactDetails?: {
          businessContact?: string;
          businessEmail?: string;
        };
      };
  serviceId?: string | ServiceInfo;

  // Service details
  serviceLocation: UserLocation;
  scheduledDate?: Date | string;
  scheduledTimeSlot?: {
    start: string;
    end: string;
  };
  serviceDescription?: string;
  specialInstructions?: string;

  // Pricing
  depositPaid: boolean;
  depositAmount?: number;
  finalPrice?: number;
  estimatedPrice?: number;
  balanceRemaining?: number;
  depositRemaining?: number;
  currency: string;

  // Status
  status: BookingStatus;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  statusHistory: BookingStatusHistoryItem[];

  // Timestamps
  startedAt?: Date | string;
  completedAt?: Date | string;
  cancelledAt?: Date | string;
  confirmedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Cancellation
  cancellationReason?: string;
  cancelledBy?: string;

  // Computed fields (from virtuals)
  isActive?: boolean;
  isConfirmed?: boolean;
  isInProgress?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
  isUpcoming?: boolean;
  isPastDue?: boolean;
  durationInDays?: number | null;

  // Additional fields
  providerMessage?: string;
  isDeleted: boolean;

  // Legacy/compatibility fields
  task?: Task;
  customer?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    contactDetails?: {
      primaryContact: string;
      secondaryContact?: string;
    };
  };
  provider?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    rating?: number;
    contactDetails?: {
      businessContact?: string;
      businessEmail?: string;
    };
  };
}

/**
 * =============================================================================
 * REQUEST BODY TYPES (For Creating/Updating)
 * =============================================================================
 */

export interface CreateTaskRequestBody {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  customerLocation: UserLocation;
  schedule: TaskSchedule;
  estimatedBudget?: TaskBudget;
  matchingStrategy?: "intelligent" | "location-only";
}

export interface UpdateTaskRequestBody {
  title?: string;
  description?: string;
  customerLocation?: Partial<UserLocation>;
  schedule?: Partial<TaskSchedule>;
  estimatedBudget?: Partial<TaskBudget>;
}

export interface RequestProviderRequestBody {
  providerId: string;
  message?: string;
}

export interface ExpressInterestRequestBody {
  message?: string;
}

export interface ProviderResponseRequestBody {
  action: "accept" | "reject";
  message?: string;
}

export interface CancelRequest {
  reason?: string;
}

export interface RematchRequest {
  strategy?: "intelligent" | "location-only";
}

export interface CompleteBookingRequest {
  finalPrice?: number;
}

/**
 * =============================================================================
 * QUERY PARAMETER TYPES
 * =============================================================================
 */

export interface BaseQueryParams extends Record<
  string,
  string | number | boolean | undefined
> {
  page?: number;
  limit?: number;
}

export interface TaskQueryParams extends BaseQueryParams {
  status?: TaskStatus;
  includeDeleted?: boolean;
  includeConverted?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "matchScore";
  sortOrder?: "asc" | "desc";
}

export interface BookingQueryParams extends BaseQueryParams {
  status?: BookingStatus;
  sortBy?: "createdAt" | "startedAt" | "completedAt";
  sortOrder?: "asc" | "desc";
}

/**
 * =============================================================================
 * API RESPONSE TYPES
 * =============================================================================
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface MatchingSummary {
  strategy: "intelligent" | "location-only";
  totalMatches: number;
  averageMatchScore: number;
  searchTermsUsed: string[];
  executionTime?: number;
  fallbackUsed?: boolean;
}

export interface TaskResponse {
  message: string;
  task?: Task;
  booking?: Booking;
  error?: string;
}

export interface TaskWithProvidersResponse {
  message: string;
  task?: Task;
  matchedProviders?: ProviderProfile[];
  matchingSummary?: MatchingSummary;
  error?: string;
}

export interface BookingResponse {
  message: string;
  booking?: Booking;
  task?: Task;
  error?: string;
}

export interface PaginatedResponse<T> {
  message?: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export type PaginatedTaskResponse = PaginatedResponse<Task>;
export type PaginatedBookingResponse = PaginatedResponse<Booking>;

/**
 * =============================================================================
 * DASHBOARD & STATISTICS INTERFACES
 * =============================================================================
 */

export interface RecentActivity {
  type: "task" | "booking";
  id: string;
  title: string;
  status: string;
  date: Date | string;
  action?: string;
  priority?: TaskPriority;
}

export interface CustomerDashboard {
  totalTasks: number;
  activeBookings: number;
  completedBookings: number;
  pendingTasks: number;
  recentActivity: RecentActivity[];
  upcomingBookings?: Booking[];
  taskBreakdown?: {
    pending: number;
    matched: number;
    floating: number;
    requested: number;
    converted: number;
  };
  spendingSummary?: {
    totalSpent: number;
    averageBookingCost: number;
    lastMonthSpending: number;
  };
}

export interface ProviderDashboard {
  activeBookings: number;
  completedBookings: number;
  totalEarnings: number;
  matchedTasks: number;
  recentActivity: RecentActivity[];
  upcomingBookings?: Booking[];
  taskOpportunities?: {
    matched: number;
    floating: number;
    newThisWeek: number;
  };
  performanceMetrics?: {
    acceptanceRate: number;
    completionRate: number;
    averageRating: number;
    responseTime: string;
  };
}

export interface CustomerHistory {
  tasks: Task[];
  bookings: Booking[];
  statistics: {
    totalSpent: number;
    totalTasks: number;
    totalBookings: number;
    completionRate: number;
    averageTaskDuration: number;
    mostUsedCategories: Array<{
      category: string;
      count: number;
    }>;
  };
}

export interface ProviderHistory {
  bookings: Booking[];
  tasks: Task[];
  statistics: {
    totalEarnings: number;
    totalBookings: number;
    completionRate: number;
    averageRating: number;
    totalReviews: number;
    mostServicedCategories: Array<{
      category: string;
      count: number;
    }>;
  };
}

export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  conversionRate: number;
  averageMatchScore: number;
  totalExpired: number;
  totalCancelled: number;
  averageTimeToConversion: number;
  peakCreationHours: Array<{
    hour: number;
    count: number;
  }>;
}

export interface BookingStatistics {
  total: number;
  byStatus: Record<BookingStatus, number>;
  totalRevenue: number;
  averageBookingValue: number;
  completionRate: number;
  cancellationRate: number;
  averageCompletionTime: number;
  topPerformingProviders: Array<{
    providerId: string;
    providerName: string;
    completedBookings: number;
    totalEarnings: number;
  }>;
}

export interface PlatformStatistics {
  tasks: TaskStatistics;
  bookings: BookingStatistics;
  overall: {
    totalUsers: number;
    totalCustomers: number;
    totalProviders: number;
    taskToBookingConversion: number;
    platformGrowth: number;
    activeUsers: number;
    monthlyGrowthRate: number;
  };
  timeSeriesData?: Array<{
    date: string;
    tasks: number;
    bookings: number;
    revenue: number;
  }>;
}

export interface FunnelAnalysis {
  stages: {
    created: number;
    matched: number;
    floating: number;
    requested: number;
    accepted: number;
    converted: number;
  };
  conversionRates: {
    createdToMatched: number;
    matchedToRequested: number;
    requestedToAccepted: number;
    acceptedToConverted: number;
    overallConversion: number;
  };
  dropOffPoints: Array<{
    stage: string;
    dropOffCount: number;
    dropOffPercentage: number;
    reasons?: string[];
  }>;
  averageTimeInStage?: Record<string, number>;
}

/**
 * =============================================================================
 * UI STATE INTERFACES
 * =============================================================================
 */

export interface BaseFilterState {
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
  sortOrder: "asc" | "desc";
}

export interface TaskFilterState extends BaseFilterState {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  sortBy: "createdAt" | "updatedAt" | "priority";
}

export interface BookingFilterState extends BaseFilterState {
  status: BookingStatus | "all";
  sortBy: "createdAt" | "startedAt" | "completedAt";
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface BaseUIState<T, F> {
  isLoading: boolean;
  error: string | null;
  selected: T | null;
  items: T[];
  filters: F;
  pagination: PaginationState;
}

export type TaskUIState = BaseUIState<Task, TaskFilterState>;
export type BookingUIState = BaseUIState<Booking, BookingFilterState>;

/**
 * =============================================================================
 * NOTIFICATION INTERFACES
 * =============================================================================
 */

export interface BaseNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
}

/**
 * Booking with Task Response (from unified endpoint)
 */
export interface BookingWithTask {
  booking: Booking;
  task?: Task; // Task is populated in the booking
}

/**
 * Standard Booking Response
 */
export interface BookingResponse {
  success?: boolean;
  message: string;
  data?: {
    booking: Booking;
  };
  booking?: Booking; // For backward compatibility
  task?: Task;
  error?: string;
}

export interface TaskNotification extends BaseNotification {
  type:
    | "task_matched"
    | "provider_interested"
    | "task_accepted"
    | "task_cancelled"
    | "task_expired";
  taskId: string;
  data?: {
    providerId?: string;
    providerName?: string;
    matchScore?: number;
  };
}

export interface BookingNotification extends BaseNotification {
  type:
    | "booking_confirmed"
    | "booking_started"
    | "booking_completed"
    | "booking_cancelled";
  bookingId: string;
  data?: {
    providerId?: string;
    providerName?: string;
    customerId?: string;
    customerName?: string;
  };
}

/**
 * =============================================================================
 * VALIDATION INTERFACES
 * =============================================================================
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
  touched: Record<string, boolean>;
}

/**
 * =============================================================================
 * COMPOSITE TYPES
 * =============================================================================
 */

export type TaskWithBooking = Task & {
  booking?: Booking;
};

// export type BookingWithTask = Booking & {
//   task: Task;
// };

export type TaskWithProviders = Task & {
  matchedProviders: ProviderProfile[];
  matchingSummary: MatchingSummary;
};

export type DashboardData = CustomerDashboard | ProviderDashboard;
export type HistoryData = CustomerHistory | ProviderHistory;
export type Notification = TaskNotification | BookingNotification;

/**
 * =============================================================================
 * TYPE GUARDS
 * =============================================================================
 */

/**
 * Check if taskId is populated with full Task object
 */
export function isTaskPopulated(
  booking: Booking,
): booking is Booking & { taskId: Task } {
  return (
    typeof booking.taskId === "object" &&
    booking.taskId !== null &&
    "_id" in booking.taskId
  );
}

/**
 * Check if providerId is populated with full provider object
 */
export function isProviderPopulated(booking: Booking): booking is Booking & {
  providerId: NonNullable<Extract<Booking["providerId"], object>>;
} {
  return (
    typeof booking.providerId === "object" &&
    booking.providerId !== null &&
    "_id" in booking.providerId
  );
}

/**
 * Check if serviceId is populated with full ServiceInfo object
 */
export function isServicePopulated(
  booking: Booking,
): booking is Booking & { serviceId: ServiceInfo } {
  return (
    typeof booking.serviceId === "object" &&
    booking.serviceId !== null &&
    "_id" in booking.serviceId
  );
}

/**
 * =============================================================================
 * HELPER FUNCTIONS
 * =============================================================================
 */

/**
 * Safely get task from booking (handles both populated and unpopulated)
 */
export function getBookingTask(booking: Booking): Task | null {
  if (isTaskPopulated(booking)) {
    return booking.taskId;
  }
  if (booking.task) {
    return booking.task;
  }
  return null;
}

/**
 * Safely get provider from booking (handles both populated and unpopulated)
 */
export function getBookingProvider(booking: Booking) {
  if (isProviderPopulated(booking)) {
    return booking.providerId;
  }
  if (booking.provider) {
    return booking.provider;
  }
  return null;
}

/**
 * Safely get service from booking (handles both populated and unpopulated)
 */
export function getBookingService(booking: Booking): ServiceInfo | null {
  if (isServicePopulated(booking)) {
    return booking.serviceId;
  }
  return null;
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(booking: Booking): string {
  const provider = getBookingProvider(booking);
  if (!provider) return "Service Provider";

  if ("businessName" in provider && provider.businessName) {
    return provider.businessName;
  }

  const firstName = "firstName" in provider ? provider.firstName : "";
  const lastName = "lastName" in provider ? provider.lastName : "";
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return fullName || "Service Provider";
}

/**
 * Get customer display name
 */
export function getCustomerDisplayName(booking: Booking): string {
  if (!booking.customer) return "Customer";

  const fullName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
  return fullName || "Customer";
}

/**
 * Format location string from UserLocation
 */
export function formatLocationString(
  location: UserLocation | undefined,
): string {
  if (!location) return "Location not specified";

  const parts: string[] = [];
  if (location.nearbyLandmark) parts.push(location.nearbyLandmark);
  if (location.locality) parts.push(location.locality);
  if (location.district) parts.push(location.district);
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);

  return parts.length > 0 ? parts.join(", ") : "Location not specified";
}

/**
 * Check if booking can be cancelled
 */
export function canCancelBooking(booking: Booking): boolean {
  return (
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.IN_PROGRESS
  );
}

/**
 * Check if booking can be started
 */
export function canStartBooking(booking: Booking): boolean {
  return booking.status === BookingStatus.CONFIRMED;
}

/**
 * Check if booking can be completed
 */
export function canCompleteBooking(booking: Booking): boolean {
  return booking.status === BookingStatus.IN_PROGRESS;
}

/**
 * =============================================================================
 * CONSTANTS & HELPERS
 * =============================================================================
 */

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.MATCHED]: "Matched",
  [TaskStatus.FLOATING]: "Open to All",
  [TaskStatus.REQUESTED]: "Provider Requested",
  [TaskStatus.ACCEPTED]: "Accepted",
  [TaskStatus.CONVERTED]: "Scheduled",
  [TaskStatus.EXPIRED]: "Expired",
  [TaskStatus.CANCELLED]: "Cancelled",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.IN_PROGRESS]: "In Progress",
  [BookingStatus.COMPLETED]: "Completed",
  [BookingStatus.CANCELLED]: "Cancelled",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "Low Priority",
  [TaskPriority.MEDIUM]: "Medium Priority",
  [TaskPriority.HIGH]: "High Priority",
  [TaskPriority.URGENT]: "Urgent",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "gray",
  [TaskStatus.MATCHED]: "blue",
  [TaskStatus.FLOATING]: "purple",
  [TaskStatus.REQUESTED]: "yellow",
  [TaskStatus.ACCEPTED]: "green",
  [TaskStatus.CONVERTED]: "teal",
  [TaskStatus.EXPIRED]: "red",
  [TaskStatus.CANCELLED]: "red",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: "blue",
  [BookingStatus.IN_PROGRESS]: "yellow",
  [BookingStatus.COMPLETED]: "green",
  [BookingStatus.CANCELLED]: "red",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "gray",
  [TaskPriority.MEDIUM]: "blue",
  [TaskPriority.HIGH]: "orange",
  [TaskPriority.URGENT]: "red",
};
