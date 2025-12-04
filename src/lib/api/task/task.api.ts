// api/task-api-client.ts

import {
  CreateTaskRequestBody,
  TaskResponse,
  TaskWithMatchesResponse,
  TaskListResponse,
  RequestProviderRequestBody,
  UpdateTaskRequestBody,
  ExpressInterestRequestBody,
  TaskDTO,
} from "@/types/task.types";
import { APIClient } from "../base/api-client";

/**
 * Customer Statistics Response
 */
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

/**
 * Provider Statistics Response
 */
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
 * Task Search Response
 */
export interface TaskSearchResponse {
  message: string;
  tasks?: Partial<TaskDTO>[];
  total?: number;
  error?: string;
}

/**
 * Task API Client
 * Handles all task-related API requests
 */
export class TaskAPIClient extends APIClient {
  private readonly basePath = "/api/tasks";

  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ==================== Customer Methods ====================

  /**
   * Create a new task (Customer only)
   * POST /api/tasks
   */
  async createTask(data: CreateTaskRequestBody): Promise<TaskResponse> {
    return this.post<TaskResponse>(this.basePath, data);
  }

  /**
   * Publish a task - triggers auto-matching (Customer only)
   * POST /api/tasks/:taskId/publish
   */
  async publishTask(taskId: string): Promise<TaskWithMatchesResponse> {
    return this.post<TaskWithMatchesResponse>(
      `${this.basePath}/${taskId}/publish`
    );
  }

  /**
   * Get customer's tasks (Customer only)
   * GET /api/tasks/customer/my-tasks
   */
  async getMyTasks(): Promise<TaskListResponse> {
    return this.get<TaskListResponse>(`${this.basePath}/customer/my-tasks`);
  }

  /**
   * Get customer statistics (Customer only)
   * GET /api/tasks/customer/stats
   */
  async getCustomerStats(): Promise<CustomerStatsResponse> {
    return this.get<CustomerStatsResponse>(`${this.basePath}/customer/stats`);
  }

  /**
   * Request a provider for a task (Customer only)
   * POST /api/tasks/request-provider
   */
  async requestProvider(
    data: RequestProviderRequestBody
  ): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/request-provider`, data);
  }

  /**
   * Update task (Customer only)
   * PUT /api/tasks/:taskId
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskRequestBody
  ): Promise<TaskResponse> {
    return this.put<TaskResponse>(`${this.basePath}/${taskId}`, data);
  }

  /**
   * Delete task (Customer only)
   * DELETE /api/tasks/:taskId
   */
  async deleteTask(taskId: string): Promise<TaskResponse> {
    return this.delete<TaskResponse>(`${this.basePath}/${taskId}`);
  }

  // ==================== Provider Methods ====================

  /**
   * Get floating tasks - tasks with no matches (Provider only)
   * GET /api/tasks/floating
   */
  async getFloatingTasks(): Promise<TaskListResponse> {
    return this.get<TaskListResponse>(`${this.basePath}/floating`);
  }

  /**
   * Get tasks where provider was matched (Provider only)
   * GET /api/tasks/provider/matched
   */
  async getMatchedTasks(): Promise<TaskListResponse> {
    return this.get<TaskListResponse>(`${this.basePath}/provider/matched`);
  }

  /**
   * Get provider statistics (Provider only)
   * GET /api/tasks/provider/stats
   */
  async getProviderStats(): Promise<ProviderStatsResponse> {
    return this.get<ProviderStatsResponse>(`${this.basePath}/provider/stats`);
  }

  /**
   * Express interest in a floating task (Provider only)
   * POST /api/tasks/express-interest
   */
  async expressInterest(
    data: ExpressInterestRequestBody
  ): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/express-interest`, data);
  }

  /**
   * Accept customer's request (Provider only)
   * POST /api/tasks/:taskId/accept
   */
  async acceptRequest(taskId: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/${taskId}/accept`);
  }

  /**
   * Decline customer's request (Provider only)
   * POST /api/tasks/:taskId/decline
   */
  async declineRequest(taskId: string, reason?: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/${taskId}/decline`, {
      reason,
    });
  }

  /**
   * Start task (Provider only)
   * POST /api/tasks/:taskId/start
   */
  async startTask(taskId: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/${taskId}/start`);
  }

  /**
   * Complete task (Provider only)
   * POST /api/tasks/:taskId/complete
   */
  async completeTask(taskId: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/${taskId}/complete`);
  }

  // ==================== Shared Methods ====================

  /**
   * Get task by ID (Authenticated users)
   * GET /api/tasks/:taskId
   */
  async getTask(taskId: string): Promise<TaskResponse> {
    return this.get<TaskResponse>(`${this.basePath}/${taskId}`);
  }

  /**
   * Cancel task (Customer or assigned provider)
   * POST /api/tasks/:taskId/cancel
   */
  async cancelTask(taskId: string, reason?: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`${this.basePath}/${taskId}/cancel`, {
      reason,
    });
  }

  /**
   * Search tasks (Public or authenticated based on your requirements)
   * GET /api/tasks/search?q=query
   */
  async searchTasks(query: string): Promise<TaskSearchResponse> {
    return this.get<TaskSearchResponse>(`${this.basePath}/search`, {
      q: query,
    });
  }
}

// Export singleton instance
export const taskAPI = new TaskAPIClient();

// Export class for custom instances
export default TaskAPIClient;
