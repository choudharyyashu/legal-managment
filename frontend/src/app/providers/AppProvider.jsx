import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { ClientProvider } from '../../context/ClientContext';
import { MatterProvider } from '../../context/MatterContext';
import { TaskProvider } from '../../context/TaskContext';
import { TimeProvider } from '../../context/TimeContext';
import { ToastProvider } from '../../components/ui/Toast';

export function AppProvider({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ClientProvider>
          <MatterProvider>
            <TaskProvider>
              <TimeProvider>
                {children}
              </TimeProvider>
            </TaskProvider>
          </MatterProvider>
        </ClientProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

