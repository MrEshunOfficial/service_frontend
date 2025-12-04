// hooks/useTask.ts

import { APIError } from "@/lib/api/base/api-client";
import { taskAPI } from "@/lib/api/task/task.api";
import {
  TaskDTO,
  CreateTaskRequestBody,
  UpdateTaskRequestBody,
  RequestProviderRequestBody,
  ExpressInterestRequestBody,
  TaskWithMatchesResponse,
  CustomerStatsResponse,
  ProviderStatsResponse,
} from "@/types/task.types";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook state interface
 */
interface UseTaskState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook options
 */
interface UseTaskOptions {
  autoLoad?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: APIError) => void;
}

// ==================== CUSTOMER HOOKS ====================

/**
 * Hook for creating a new task
 */
export function useCreateTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const createTask = useCallback(
    async (data: CreateTaskRequestBody) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await taskAPI.createTask(data);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState({ data: null, loading: false, error });
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    createTask,
  };
}

/**
 * Hook for publishing a task (triggers auto-matching)
 */
export function usePublishTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskWithMatchesResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const publishTask = useCallback(
    async (taskId: string) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await taskAPI.publishTask(taskId);
        setState({ data: response, loading: false, error: null });
        onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err as APIError;
        setState({ data: null, loading: false, error });
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    publishResult: state.data,
    loading: state.loading,
    error: state.error,
    publishTask,
  };
}

/**
 * Hook for customer's tasks
 * Auto-loads on mount by default
 */
export function useMyTasks(options: UseTaskOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadMyTasks = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getMyTasks();
      const tasks = response.tasks || [];
      if (isMountedRef.current) {
        setState({ data: tasks, loading: false, error: null });
        onSuccessRef.current?.(tasks);
      }
      return tasks;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadMyTasks();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadMyTasks]);

  return {
    tasks: state.data,
    loading: state.loading,
    error: state.error,
    loadMyTasks,
    refetch: loadMyTasks,
  };
}

/**
 * Hook for customer statistics
 */
export function useCustomerStats(options: UseTaskOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<
    UseTaskState<CustomerStatsResponse["stats"]>
  >({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getCustomerStats();
      const stats = response.stats || null;
      if (isMountedRef.current) {
        setState({ data: stats, loading: false, error: null });
        onSuccessRef.current?.(stats);
      }
      return stats;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadStats();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadStats]);

  return {
    stats: state.data,
    loading: state.loading,
    error: state.error,
    loadStats,
    refetch: loadStats,
  };
}

/**
 * Hook for requesting a provider for a task
 */
export function useRequestProvider(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const requestProvider = useCallback(
    async (data: RequestProviderRequestBody) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.requestProvider(data);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    requestProvider,
  };
}

/**
 * Hook for updating a task
 */
export function useUpdateTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateTask = useCallback(
    async (taskId: string, data: UpdateTaskRequestBody) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.updateTask(taskId, data);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    updateTask,
  };
}

/**
 * Hook for deleting a task
 */
export function useDeleteTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<boolean>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteTask = useCallback(
    async (taskId: string) => {
      setState({ data: null, loading: true, error: null });
      try {
        await taskAPI.deleteTask(taskId);
        setState({ data: true, loading: false, error: null });
        onSuccess?.(true);
        return true;
      } catch (err) {
        const error = err as APIError;
        setState({ data: null, loading: false, error });
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    success: state.data,
    loading: state.loading,
    error: state.error,
    deleteTask,
  };
}

// ==================== PROVIDER HOOKS ====================

/**
 * Hook for floating tasks (tasks with no matches)
 * Auto-loads on mount by default
 */
export function useFloatingTasks(options: UseTaskOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadFloatingTasks = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getFloatingTasks();
      const tasks = response.tasks || [];
      if (isMountedRef.current) {
        setState({ data: tasks, loading: false, error: null });
        onSuccessRef.current?.(tasks);
      }
      return tasks;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadFloatingTasks();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadFloatingTasks]);

  return {
    tasks: state.data,
    loading: state.loading,
    error: state.error,
    loadFloatingTasks,
    refetch: loadFloatingTasks,
  };
}

/**
 * Hook for matched tasks (provider's matched tasks)
 * Auto-loads on mount by default
 */
export function useMatchedTasks(options: UseTaskOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadMatchedTasks = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getMatchedTasks();
      const tasks = response.tasks || [];
      if (isMountedRef.current) {
        setState({ data: tasks, loading: false, error: null });
        onSuccessRef.current?.(tasks);
      }
      return tasks;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadMatchedTasks();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadMatchedTasks]);

  return {
    tasks: state.data,
    loading: state.loading,
    error: state.error,
    loadMatchedTasks,
    refetch: loadMatchedTasks,
  };
}

/**
 * Hook for provider statistics
 */
export function useProviderStats(options: UseTaskOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<
    UseTaskState<ProviderStatsResponse["stats"]>
  >({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getProviderStats();
      const stats = response.stats || null;
      if (isMountedRef.current) {
        setState({ data: stats, loading: false, error: null });
        onSuccessRef.current?.(stats);
      }
      return stats;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad) {
      loadStats();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadStats]);

  return {
    stats: state.data,
    loading: state.loading,
    error: state.error,
    loadStats,
    refetch: loadStats,
  };
}

/**
 * Hook for expressing interest in a floating task
 */
export function useExpressInterest(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const expressInterest = useCallback(
    async (data: ExpressInterestRequestBody) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.expressInterest(data);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    expressInterest,
  };
}

/**
 * Hook for accepting a customer's request
 */
export function useAcceptRequest(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const acceptRequest = useCallback(
    async (taskId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.acceptRequest(taskId);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    acceptRequest,
  };
}

/**
 * Hook for declining a customer's request
 */
export function useDeclineRequest(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const declineRequest = useCallback(
    async (taskId: string, reason?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.declineRequest(taskId, reason);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    declineRequest,
  };
}

/**
 * Hook for starting a task
 */
export function useStartTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const startTask = useCallback(
    async (taskId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.startTask(taskId);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    startTask,
  };
}

/**
 * Hook for completing a task
 */
export function useCompleteTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const completeTask = useCallback(
    async (taskId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.completeTask(taskId);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    completeTask,
  };
}

// ==================== SHARED HOOKS ====================

/**
 * Hook for getting a specific task by ID
 */
export function useTask(taskId?: string, options: UseTaskOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const taskIdRef = useRef(taskId);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    taskIdRef.current = taskId;
  }, [onSuccess, onError, taskId]);

  const loadTask = useCallback(async (id?: string) => {
    const targetId = id || taskIdRef.current;
    if (!targetId) {
      throw new Error("Task ID is required");
    }

    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await taskAPI.getTask(targetId);
      const task = response.task || null;
      if (isMountedRef.current) {
        setState({ data: task, loading: false, error: null });
        onSuccessRef.current?.(task);
      }
      return task;
    } catch (err) {
      const error = err as APIError;
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error, loading: false }));
        onErrorRef.current?.(error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoLoad && taskId) {
      loadTask();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, taskId, loadTask]);

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    loadTask,
    refetch: loadTask,
  };
}

/**
 * Hook for cancelling a task
 */
export function useCancelTask(options: UseTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseTaskState<TaskDTO>>({
    data: null,
    loading: false,
    error: null,
  });

  const cancelTask = useCallback(
    async (taskId: string, reason?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await taskAPI.cancelTask(taskId, reason);
        const task = response.task || null;
        setState({ data: task, loading: false, error: null });
        onSuccess?.(task);
        return task;
      } catch (err) {
        const error = err as APIError;
        setState((prev) => ({ ...prev, error, loading: false }));
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return {
    task: state.data,
    loading: state.loading,
    error: state.error,
    cancelTask,
  };
}

/**
 * Hook for searching tasks
 */
export function useSearchTasks() {
  const [state, setState] = useState<UseTaskState<TaskDTO[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchTasks = useCallback(async (query: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await taskAPI.searchTasks(query);
      const tasks = (response.tasks || []) as TaskDTO[];
      setState({ data: tasks, loading: false, error: null });
      return { tasks, total: response.total };
    } catch (err) {
      const error = err as APIError;
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return {
    tasks: state.data,
    loading: state.loading,
    error: state.error,
    searchTasks,
  };
}
