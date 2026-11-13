import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_TASKS } from '../data/mockTasks';
import { mockStorage } from '../services/mockStorage';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    return mockStorage.get('tasks', MOCK_TASKS);
  });

  useEffect(() => {
    mockStorage.set('tasks', tasks);
  }, [tasks]);

  const addTask = (taskData) => {
    const id = `TSK-${tasks.length + 101}`;
    const newTask = {
      id,
      status: 'Not Started',
      completedAt: null,
      reminder: '1 day prior',
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null,
        };
      }
      return t;
    }));
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};

