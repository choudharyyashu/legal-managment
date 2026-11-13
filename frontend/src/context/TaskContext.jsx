import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeTask = (t) => ({
    ...t,
    id: t.id,
    title: t.title,
    matterId: t.matterId,
    matterName: t.matter?.title || t.matterName || 'Matter',
    assignedToId: t.assignedToUserId || t.assignedToId,
    assignedToUserId: t.assignedToUserId || t.assignedToId,
    assignedToName: t.assignedToUser?.name || t.assignedToName || 'Staff Member',
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
    priority: t.priority || 'Medium',
    status: t.status || 'Not Started',
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : null,
    urcpRuleReference: t.urcpRuleReference || null,
  });

  const refreshTasks = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks({ limit: 100, ...params });
      const rawTasks = Array.isArray(data?.tasks) ? data.tasks : [];
      setTasks(rawTasks.map(normalizeTask));
    } catch (err) {
      console.warn('Failed to load tasks from API:', err?.message);
      setError(err?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTasks();
    } else {
      setTasks([]);
    }
  }, [isAuthenticated, refreshTasks]);

  const addTask = async (taskData) => {
    try {
      const payload = {
        matterId: taskData.matterId,
        title: taskData.title,
        description: taskData.description || undefined,
        assignedToUserId: taskData.assignedToUserId || taskData.assignedToId,
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        priority: taskData.priority || 'Medium',
        reminderSetting: taskData.reminderSetting || taskData.reminder || '1 day prior',
        urcpRuleReference: taskData.urcpRuleReference || undefined,
      };

      const created = await taskService.createTask(payload);
      const normalized = normalizeTask(created);
      setTasks((prev) => [normalized, ...prev.filter((t) => t.id !== normalized.id)]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(id, newStatus);
      const normalized = normalizeTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === id ? normalized : t)));
      return normalized;
    } catch (err) {
      console.warn('Failed to update task status on API:', err?.message);
      // Optimistic fallback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: newStatus,
                completedAt: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null,
              }
            : t
        )
      );
    }
  };

  const updateTask = async (id, updatedFields) => {
    try {
      const updated = await taskService.updateTask(id, updatedFields);
      const normalized = normalizeTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === id ? normalized : t)));
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.warn('Failed to delete task on API:', err?.message);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        refreshTasks,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
