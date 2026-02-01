// api/tasks/task-api.ts - UPDATED WITH VALIDATION

import { Task, Booking, CreateTaskRequestBody, TaskWithProvidersResponse, TaskQueryParams, TaskResponse, UpdateTaskRequestBody, RequestProviderRequestBody, CancelRequest, RematchRequest, BookingQueryParams, BookingResponse, CustomerDashboard, CustomerHistory, ExpressInterestRequestBody, ProviderResponseRequestBody, CompleteBookingRequest, ProviderDashboard, PaginatedTaskResponse, TaskStatistics, PaginatedBookingResponse, BookingStatistics, PlatformStatistics, FunnelAnalysis } from "@/types/task.types";
import { APIClient } from "../base/api-client";

/**
 * =============================================================================
 * SIMPLE RESPONSE WRAPPERS
 * =============================================================================
 */

interface SimpleTaskResponse {
  message?: string;
  tasks: Task[];
  error?: string;
}

interface SimpleBookingResponse {
  message?: string;
  bookings: Booking[];
  error?: string;
}

interface TaskWithBooking {
  task: Task;
  booking?: Booking;
}

interface BookingWithTask {
  booking: Booking;
  task: Task;
}

// ✅ NEW: Response type for respondToRequest
interface RespondToRequestResponse {
  message?: string;
  task: Task;
  booking?: Booking; // ✅ Included when action is "accept"
  error?: string;
}

// ✅ NEW: Request body for validating booking completion
interface ValidateBookingRequest {
  approved: boolean;
  rating?: number;       // 1-5 stars (optional but recommended if approved)
  review?: string;       // Customer review/feedback
  disputeReason?: string; // Required if approved = false
}

/**
 * =============================================================================
 * MAIN API CLIENT
 * =============================================================================
 */
export class TaskAPI extends APIClient {
  private readonly tasksEndpoint = "/api/tasks";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * ============================================================================
   * CUSTOMER TASK OPERATIONS (Discovery Phase)
   * ============================================================================
   */

  /**
   * Create a new task with optional automatic provider matching
   */
  async createTask(data: CreateTaskRequestBody): Promise<TaskWithProvidersResponse> {
    return this.post<TaskWithProvidersResponse>(this.tasksEndpoint, data);
  }

  /**
   * Get all tasks created by the current customer
   */
  async getMyTasks(params?: TaskQueryParams): Promise<SimpleTaskResponse> {
    return this.get<SimpleTaskResponse>(`${this.tasksEndpoint}/my-tasks`, params);
  }

  /**
   * Get a specific task by ID
   */
  async getTaskById(taskId: string): Promise<TaskResponse> {
    return this.get<TaskResponse>(`${this.tasksEndpoint}/${taskId}`);
  }

  /**
   * Update task details (only allowed for PENDING or FLOATING tasks)
   */
  async updateTask(taskId: string, data: UpdateTaskRequestBody): Promise<TaskResponse> {
    return this.patch<TaskResponse>(`${this.tasksEndpoint}/${taskId}`, data);
  }

  /**
   * Request a specific provider for a task
   */
  async requestProvider(taskId: string, data: RequestProviderRequestBody): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.tasksEndpoint}/${taskId}/request-provider`, data);
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, data?: CancelRequest): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.tasksEndpoint}/${taskId}/cancel`, data);
  }

  /**
   * Soft delete a task
   */
  async deleteTask(taskId: string): Promise<TaskResponse> {
    return this.delete<TaskResponse>(`${this.tasksEndpoint}/${taskId}`);
  }

  /**
   * Trigger a new provider matching attempt for a task
   */
  async rematchTask(taskId: string, data?: RematchRequest): Promise<TaskWithProvidersResponse> {
    return this.post<TaskWithProvidersResponse>(`${this.tasksEndpoint}/${taskId}/rematch`, data);
  }

  /**
   * Get a task with its associated booking (if converted)
   */
  async getTaskWithBooking(taskId: string): Promise<TaskWithBooking> {
    return this.get<TaskWithBooking>(`${this.tasksEndpoint}/${taskId}/with-booking`);
  }

  /**
   * ============================================================================
   * CUSTOMER BOOKING OPERATIONS (Execution Phase)
   * ============================================================================
   */

  /**
   * Get all bookings for the current customer
   */
  async getMyBookings(params?: BookingQueryParams): Promise<SimpleBookingResponse> {
    return this.get<SimpleBookingResponse>(`${this.tasksEndpoint}/bookings/my-bookings`, params);
  }

  /**
   * Get details of a specific booking
   */
  async getBookingById(bookingId: string): Promise<BookingResponse> {
    return this.get<BookingResponse>(`${this.tasksEndpoint}/bookings/${bookingId}`);
  }

  /**
   * Cancel a booking as a customer
   */
  async cancelBooking(bookingId: string, data: CancelRequest): Promise<BookingResponse> {
    return this.post<BookingResponse>(`${this.tasksEndpoint}/bookings/${bookingId}/cancel`, data);
  }

  /**
   * ✅ NEW: Validate booking completion (Customer only)
   * Called after provider marks booking as complete
   * 
   * @example Approve completion
   * ```typescript
   * await taskAPI.validateBooking(bookingId, {
   *   approved: true,
   *   rating: 5,
   *   review: "Excellent service!"
   * });
   * ```
   * 
   * @example Dispute completion
   * ```typescript
   * await taskAPI.validateBooking(bookingId, {
   *   approved: false,
   *   disputeReason: "Service was not completed as requested"
   * });
   * ```
   */
  async validateBooking(
    bookingId: string, 
    data: ValidateBookingRequest
  ): Promise<BookingResponse> {
    return this.post<BookingResponse>(
      `${this.tasksEndpoint}/bookings/${bookingId}/validate`, 
      data
    );
  }

  /**
   * Get customer dashboard with overview statistics
   */
  async getCustomerDashboard(): Promise<CustomerDashboard> {
    return this.get<CustomerDashboard>(`${this.tasksEndpoint}/customer/dashboard`);
  }

  /**
   * Get customer history with tasks, bookings, and statistics
   */
  async getCustomerHistory(): Promise<CustomerHistory> {
    return this.get<CustomerHistory>(`${this.tasksEndpoint}/customer/history`);
  }

  /**
   * ============================================================================
   * PROVIDER TASK OPERATIONS (Discovery Phase)
   * ============================================================================
   */

  /**
   * Get tasks that were matched to the current provider
   */
  async getMatchedTasks(params?: TaskQueryParams): Promise<SimpleTaskResponse> {
    return this.get<SimpleTaskResponse>(`${this.tasksEndpoint}/provider/matched`, params);
  }

  /**
   * Get floating tasks (open to all providers)
   */
  async getFloatingTasks(params?: TaskQueryParams): Promise<SimpleTaskResponse> {
    return this.get<SimpleTaskResponse>(`${this.tasksEndpoint}/provider/floating`, params);
  }

  /**
   * Get tasks where customer specifically requested the provider
   */
  async getRequestedTasks(params?: TaskQueryParams): Promise<SimpleTaskResponse> {
    return this.get<SimpleTaskResponse>(`${this.tasksEndpoint}/provider/requested`, params);
  }

  /**
   * Get task details as a provider
   */
  async getTaskDetails(taskId: string): Promise<TaskResponse> {
    return this.get<TaskResponse>(`${this.tasksEndpoint}/provider/${taskId}`);
  }

  /**
   * Express interest in a floating task
   */
  async expressInterest(taskId: string, data?: ExpressInterestRequestBody): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.tasksEndpoint}/${taskId}/express-interest`, data);
  }

  /**
   * ✅ FIXED: Respond to a customer's provider request (accept or reject)
   * When accepting, returns both task and booking
   * When rejecting, returns only task
   */
  async respondToRequest(
    taskId: string, 
    data: ProviderResponseRequestBody
  ): Promise<RespondToRequestResponse> {
    return this.post<RespondToRequestResponse>(
      `${this.tasksEndpoint}/${taskId}/respond`, 
      data
    );
  }

  /**
   * Cancel a task as a provider (only for accepted tasks)
   */
  async providerCancelTask(taskId: string, data?: CancelRequest): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.tasksEndpoint}/${taskId}/provider-cancel`, data);
  }

  /**
   * ============================================================================
   * PROVIDER BOOKING OPERATIONS (Execution Phase)
   * ============================================================================
   */

  /**
   * Get all active bookings for the current provider
   */
  async getActiveBookings(params?: BookingQueryParams): Promise<SimpleBookingResponse> {
    return this.get<SimpleBookingResponse>(`${this.tasksEndpoint}/provider/active`, params);
  }

  /**
   * Start a confirmed booking
   */
  async startBooking(bookingId: string): Promise<BookingResponse> {
    return this.post<BookingResponse>(`${this.tasksEndpoint}/bookings/${bookingId}/start`);
  }

  /**
   * Complete a booking with optional final price
   * ✅ NOTE: This now moves booking to AWAITING_VALIDATION status
   */
  async completeBooking(bookingId: string, data?: CompleteBookingRequest): Promise<BookingResponse> {
    return this.post<BookingResponse>(`${this.tasksEndpoint}/bookings/${bookingId}/complete`, data);
  }

  /**
   * Cancel a booking as a provider
   */
  async providerCancelBooking(bookingId: string, data: CancelRequest): Promise<BookingResponse> {
    return this.post<BookingResponse>(`${this.tasksEndpoint}/bookings/${bookingId}/cancel`, data);
  }

  /**
   * Get booking details with associated task information
   */
  async getBookingDetails(bookingId: string): Promise<BookingWithTask> {
    return this.get<BookingWithTask>(`${this.tasksEndpoint}/bookings/${bookingId}`);
  }

  /**
   * Get provider dashboard with overview statistics
   */
  async getProviderDashboard(): Promise<ProviderDashboard> {
    return this.get<ProviderDashboard>(`${this.tasksEndpoint}/provider/dashboard`);
  }

  /**
   * Get provider history with bookings, tasks, and statistics
   */
  async getProviderHistory(): Promise<CustomerHistory> {
    return this.get<CustomerHistory>(`${this.tasksEndpoint}/provider/history`);
  }

  /**
   * ============================================================================
   * ADMIN OPERATIONS
   * ============================================================================
   */

  /**
   * Get all tasks in the system (admin only) with pagination
   */
  async getAllTasks(params?: TaskQueryParams): Promise<PaginatedTaskResponse> {
    return this.get<PaginatedTaskResponse>(`${this.tasksEndpoint}/admin/all`, params);
  }

  /**
   * Get comprehensive task statistics (admin only)
   */
  async getTaskStatistics(): Promise<TaskStatistics> {
    return this.get<TaskStatistics>(`${this.tasksEndpoint}/admin/statistics`);
  }

  /**
   * Get all bookings in the system (admin only) with pagination
   */
  async getAllBookings(params?: BookingQueryParams): Promise<PaginatedBookingResponse> {
    return this.get<PaginatedBookingResponse>(`${this.tasksEndpoint}/bookings/admin/all`, params);
  }

  /**
   * Get comprehensive booking statistics (admin only)
   */
  async getBookingStatistics(): Promise<BookingStatistics> {
    return this.get<BookingStatistics>(`${this.tasksEndpoint}/bookings/admin/statistics`);
  }

  /**
   * Get platform-wide statistics (admin only)
   */
  async getPlatformStatistics(): Promise<PlatformStatistics> {
    return this.get<PlatformStatistics>(`${this.tasksEndpoint}/admin/platform-statistics`);
  }

  /**
   * Get funnel analysis showing conversion rates (admin only)
   */
  async getFunnelAnalysis(): Promise<FunnelAnalysis> {
    return this.get<FunnelAnalysis>(`${this.tasksEndpoint}/admin/funnel-analysis`);
  }
}

/**
 * =============================================================================
 * SINGLETON INSTANCE
 * =============================================================================
 */
export const taskAPI = new TaskAPI();