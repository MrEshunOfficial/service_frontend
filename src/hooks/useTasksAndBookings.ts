// hooks/useTasksAndBookings.ts

import { useState, useEffect, useCallback } from "react";
import { APIError } from "@/lib/api/base/api-client";
import { Task, Booking, TaskWithProvidersResponse, CustomerDashboard, CustomerHistory, ProviderDashboard, TaskStatistics, BookingStatistics, PlatformStatistics, FunnelAnalysis, CancelRequest, CompleteBookingRequest, CreateTaskRequestBody, ProviderResponseRequestBody, RematchRequest, RequestProviderRequestBody, TaskQueryParams, UpdateTaskRequestBody } from "@/types/task.types";
import { taskAPI } from "@/lib/api/task/task.api";

// ============================================================================
// HOOK STATE TYPES
// ============================================================================

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

interface UseTaskState {
  task: Task | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

interface UseBookingsState {
  bookings: Booking[];
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

interface UseBookingState {
  booking: Booking | null;
  loading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

// ============================================================================
// CUSTOMER TASK HOOKS
// ============================================================================

/**
 * Hook for managing customer tasks
 * Auto-loads tasks on mount
 */
export function useCustomerTasks(
  params?: TaskQueryParams,
  autoLoad: boolean = true
) {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getMyTasks(params);
      setState({
        tasks: response.tasks,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        tasks: [],
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [params]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchTasks();
    }
  }, [autoLoad, state.isInitialized, fetchTasks]);

  const createTask = useCallback(
    async (data: CreateTaskRequestBody): Promise<TaskWithProvidersResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.createTask(data);
        // Refresh task list after creation
        await fetchTasks();
        return response;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as APIError,
        }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (taskId: string, data: UpdateTaskRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.updateTask(taskId, data);
        await fetchTasks();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const requestProvider = useCallback(
    async (taskId: string, data: RequestProviderRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.requestProvider(taskId, data);
        await fetchTasks();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const cancelTask = useCallback(
    async (taskId: string, data?: CancelRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.cancelTask(taskId, data);
        await fetchTasks();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.deleteTask(taskId);
        await fetchTasks();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const rematchTask = useCallback(
    async (taskId: string, data?: RematchRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const response = await taskAPI.rematchTask(taskId, data);
        await fetchTasks();
        return response;
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchTasks,
    refreshTasks: fetchTasks,
    createTask,
    updateTask,
    requestProvider,
    cancelTask,
    deleteTask,
    rematchTask,
    clearError,
  };
}

/**
 * Hook for managing a single task
 * Auto-loads task on mount
 */
export function useTask(taskId: string, autoLoad: boolean = true) {
  const [state, setState] = useState<UseTaskState>({
    task: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getTaskById(taskId);
      setState({
        task: response.task || null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        task: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [taskId]);

  // Auto-load on mount or when taskId changes
  useEffect(() => {
    if (autoLoad && taskId && !state.isInitialized) {
      fetchTask();
    }
  }, [autoLoad, taskId, state.isInitialized, fetchTask]);

  const updateTask = useCallback(
    async (data: UpdateTaskRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.updateTask(taskId, data);
        await fetchTask();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [taskId, fetchTask]
  );

  const requestProvider = useCallback(
    async (data: RequestProviderRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.requestProvider(taskId, data);
        await fetchTask();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [taskId, fetchTask]
  );

  const cancelTask = useCallback(
    async (data?: CancelRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.cancelTask(taskId, data);
        await fetchTask();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [taskId, fetchTask]
  );

  return {
    ...state,
    fetchTask,
    refreshTask: fetchTask,
    updateTask,
    requestProvider,
    cancelTask,
  };
}

// ============================================================================
// CUSTOMER BOOKING HOOKS
// ============================================================================

/**
 * Hook for managing customer bookings
 * Auto-loads bookings on mount
 */
export function useCustomerBookings(autoLoad: boolean = true) {
  const [state, setState] = useState<UseBookingsState>({
    bookings: [],
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchBookings = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getMyBookings();
      setState({
        bookings: response.bookings,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        bookings: [],
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchBookings();
    }
  }, [autoLoad, state.isInitialized, fetchBookings]);

  const cancelBooking = useCallback(
    async (bookingId: string, data: CancelRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.cancelBooking(bookingId, data);
        await fetchBookings();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchBookings]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchBookings,
    refreshBookings: fetchBookings,
    cancelBooking,
    clearError,
  };
}

/**
 * Hook for managing a single booking (works for both customers and providers)
 * Auto-loads booking on mount
 */
export function useBooking(bookingId: string, autoLoad: boolean = true) {
  const [state, setState] = useState<UseBookingState>({
    booking: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // ✅ FIXED: Use unified endpoint
      const response = await taskAPI.getBookingById(bookingId);
      
      // ✅ Handle both response formats
      const bookingData = response.booking || response;
      
      setState({
        booking: (bookingData as Booking) || null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        booking: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [bookingId]);

  // Auto-load on mount or when bookingId changes
  useEffect(() => {
    if (autoLoad && bookingId && !state.isInitialized) {
      fetchBooking();
    }
  }, [autoLoad, bookingId, state.isInitialized, fetchBooking]);

  const cancelBooking = useCallback(
    async (data: CancelRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.cancelBooking(bookingId, data);
        await fetchBooking();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [bookingId, fetchBooking]
  );

  return {
    ...state,
    fetchBooking,
    refreshBooking: fetchBooking,
    cancelBooking,
  };
}

/**
 * ✅ UPDATE: Fix useProviderBooking to use the same unified endpoint
 */
export function useProviderBooking(bookingId: string, autoLoad: boolean = true) {
  const [state, setState] = useState<UseBookingState>({
    booking: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // ✅ FIXED: Use unified endpoint (same as customer)
      const response = await taskAPI.getBookingById(bookingId);
      const bookingData = response.booking || response;
      
      setState({
        booking: (bookingData as Booking) || null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        booking: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [bookingId]);

  useEffect(() => {
    if (autoLoad && bookingId && !state.isInitialized) {
      fetchBooking();
    }
  }, [autoLoad, bookingId, state.isInitialized, fetchBooking]);

  return {
    ...state,
    fetchBooking,
    refreshBooking: fetchBooking,
  };
}

// ============================================================================
// CUSTOMER DASHBOARD HOOKS
// ============================================================================

/**
 * Hook for customer dashboard data
 * Auto-loads on mount
 */
export function useCustomerDashboard(autoLoad: boolean = true) {
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getCustomerDashboard();
      setDashboard(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchDashboard();
    }
  }, [autoLoad, isInitialized, fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    isInitialized,
    fetchDashboard,
    refreshDashboard: fetchDashboard,
  };
}

/**
 * Hook for customer history
 * Auto-loads on mount
 */
export function useCustomerHistory(autoLoad: boolean = true) {
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getCustomerHistory();
      setHistory(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchHistory();
    }
  }, [autoLoad, isInitialized, fetchHistory]);

  return {
    history,
    loading,
    error,
    isInitialized,
    fetchHistory,
    refreshHistory: fetchHistory,
  };
}

// ============================================================================
// PROVIDER TASK HOOKS
// ============================================================================

/**
 * Hook for provider's matched tasks
 * Auto-loads on mount
 */
export function useProviderMatchedTasks(autoLoad: boolean = true) {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getMatchedTasks();
      setState({
        tasks: response.tasks,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        tasks: [],
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchTasks();
    }
  }, [autoLoad, state.isInitialized, fetchTasks]);

  const respondToRequest = useCallback(
    async (taskId: string, data: ProviderResponseRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const response = await taskAPI.respondToRequest(taskId, data);
        await fetchTasks();
        return response;
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  return {
    ...state,
    fetchTasks,
    refreshTasks: fetchTasks,
    respondToRequest,
  };
}

/**
 * Hook for provider's floating tasks
 * Auto-loads on mount
 */
export function useProviderFloatingTasks(autoLoad: boolean = true) {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getFloatingTasks();
      setState({
        tasks: response.tasks,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        tasks: [],
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchTasks();
    }
  }, [autoLoad, state.isInitialized, fetchTasks]);

  const expressInterest = useCallback(
    async (taskId: string, message?: string) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.expressInterest(taskId, { message });
        await fetchTasks();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  return {
    ...state,
    fetchTasks,
    refreshTasks: fetchTasks,
    expressInterest,
  };
}

// hooks/useTasksAndBookings.ts

/**
 * Hook for provider's requested tasks (tasks where customer specifically requested them)
 * Auto-loads on mount
 */
export function useProviderRequestedTasks(autoLoad: boolean = true) {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getRequestedTasks();
      setState({
        tasks: response.tasks,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        tasks: [],
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchTasks();
    }
  }, [autoLoad, state.isInitialized, fetchTasks]);

  // ✅ UPDATED: Return type now includes booking
  const respondToRequest = useCallback(
    async (taskId: string, data: ProviderResponseRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const response = await taskAPI.respondToRequest(taskId, data);
        await fetchTasks(); // Refresh list after responding
        
        // ✅ Return the full response (includes booking if accepted)
        return response;
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchTasks]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchTasks,
    refreshTasks: fetchTasks,
    respondToRequest,
    clearError,
  };
}

// ✅ SAME FIX for useProviderRequestedTask
export function useProviderRequestedTask(taskId: string, autoLoad: boolean = true) {
  const [state, setState] = useState<UseTaskState>({
    task: null,
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getTaskDetails(taskId);
      setState({
        task: response.task || null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        task: null,
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, [taskId]);

  useEffect(() => {
    if (autoLoad && taskId && !state.isInitialized) {
      fetchTask();
    }
  }, [autoLoad, taskId, state.isInitialized, fetchTask]);

  // ✅ UPDATED: Return the full response
  const respondToRequest = useCallback(
    async (data: ProviderResponseRequestBody) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const response = await taskAPI.respondToRequest(taskId, data);
        await fetchTask(); // Refresh task after responding
        
        // ✅ Return full response (includes booking if accepted)
        return response;
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [taskId, fetchTask]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchTask,
    refreshTask: fetchTask,
    respondToRequest,
    clearError,
  };
}

// ============================================================================
// PROVIDER BOOKING HOOKS
// ============================================================================

/**
 * Hook for provider's active bookings
 * Auto-loads on mount
 */
export function useProviderActiveBookings(autoLoad: boolean = true) {
  const [state, setState] = useState<UseBookingsState>({
    bookings: [],
    loading: autoLoad,
    error: null,
    isInitialized: false,
  });

  const fetchBookings = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getActiveBookings();
      setState({
        bookings: response.bookings,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      setState({
        bookings: [],
        loading: false,
        error: error as APIError,
        isInitialized: true,
      });
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !state.isInitialized) {
      fetchBookings();
    }
  }, [autoLoad, state.isInitialized, fetchBookings]);

  const startBooking = useCallback(
    async (bookingId: string) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.startBooking(bookingId);
        await fetchBookings();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchBookings]
  );

  const completeBooking = useCallback(
    async (bookingId: string, data?: CompleteBookingRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.completeBooking(bookingId, data);
        await fetchBookings();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchBookings]
  );

  const cancelBooking = useCallback(
    async (bookingId: string, data: CancelRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await taskAPI.providerCancelBooking(bookingId, data);
        await fetchBookings();
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as APIError }));
        throw error;
      }
    },
    [fetchBookings]
  );

  return {
    ...state,
    fetchBookings,
    refreshBookings: fetchBookings,
    startBooking,
    completeBooking,
    cancelBooking,
  };
}

/**
 * Hook for provider dashboard
 * Auto-loads on mount
 */
export function useProviderDashboard(autoLoad: boolean = true) {
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getProviderDashboard();
      setDashboard(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchDashboard();
    }
  }, [autoLoad, isInitialized, fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    isInitialized,
    fetchDashboard,
    refreshDashboard: fetchDashboard,
  };
}

// ============================================================================
// ADMIN HOOKS
// ============================================================================

/**
 * Hook for admin task statistics
 * Auto-loads on mount
 */
export function useTaskStatistics(autoLoad: boolean = true) {
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getTaskStatistics();
      setStatistics(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchStatistics();
    }
  }, [autoLoad, isInitialized, fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    isInitialized,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
  };
}

/**
 * Hook for admin booking statistics
 * Auto-loads on mount
 */
export function useBookingStatistics(autoLoad: boolean = true) {
  const [statistics, setStatistics] = useState<BookingStatistics | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getBookingStatistics();
      setStatistics(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchStatistics();
    }
  }, [autoLoad, isInitialized, fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    isInitialized,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
  };
}

/**
 * Hook for platform statistics
 * Auto-loads on mount
 */
export function usePlatformStatistics(autoLoad: boolean = true) {
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getPlatformStatistics();
      setStatistics(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchStatistics();
    }
  }, [autoLoad, isInitialized, fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    isInitialized,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
  };
}

// export function useProviderBooking(bookingId: string, autoLoad: boolean = true) {
//   const [state, setState] = useState<UseBookingState>({
//     booking: null,
//     loading: autoLoad,
//     error: null,
//     isInitialized: false,
//   });

//   const fetchBooking = useCallback(async () => {
//     if (!bookingId) return;

//     setState((prev) => ({ ...prev, loading: true, error: null }));
//     try {
//       const response = await taskAPI.getBookingDetails(bookingId);
//       setState({
//         booking: response.booking || null,
//         loading: false,
//         error: null,
//         isInitialized: true,
//       });
//     } catch (error) {
//       setState({
//         booking: null,
//         loading: false,
//         error: error as APIError,
//         isInitialized: true,
//       });
//     }
//   }, [bookingId]);

//   useEffect(() => {
//     if (autoLoad && bookingId && !state.isInitialized) {
//       fetchBooking();
//     }
//   }, [autoLoad, bookingId, state.isInitialized, fetchBooking]);

//   return {
//     ...state,
//     fetchBooking,
//     refreshBooking: fetchBooking,
//   };
// }

/**
 * Hook for funnel analysis
 * Auto-loads on mount
 */
export function useFunnelAnalysis(autoLoad: boolean = true) {
  const [analysis, setAnalysis] = useState<FunnelAnalysis | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getFunnelAnalysis();
      setAnalysis(data);
      setIsInitialized(true);
    } catch (error) {
      setError(error as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !isInitialized) {
      fetchAnalysis();
    }
  }, [autoLoad, isInitialized, fetchAnalysis]);

  return {
    analysis,
    loading,
    error,
    isInitialized,
    fetchAnalysis,
    refreshAnalysis: fetchAnalysis,
  };
}