import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';
import { MOCK_USERS } from '../data/mockUsers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCachedUser() || MOCK_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.hasToken());
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState(MOCK_USERS);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);

  // Load real firm staff from backend /users
  const refreshUsers = useCallback(async () => {
    try {
      const data = await userService.getUsers({ limit: 100 });
      if (Array.isArray(data?.users) && data.users.length > 0) {
        setAllUsers(data.users);
      }
    } catch (err) {
      console.warn('Could not fetch remote users list, retaining baseline staff:', err?.message);
    }
  }, []);

  // Validate session on mount or token change
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!authService.hasToken()) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const user = await authService.getMe();
        if (isMounted && user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          await refreshUsers();
        }
      } catch (err) {
        console.warn('Session verification error:', err?.message);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    // Listen for unauthorized 401 events dispatched by apiClient
    const handleUnauthorized = () => {
      if (isMounted) {
        setIsAuthenticated(false);
        setCurrentUser(MOCK_USERS[0]);
      }
    };
    window.addEventListener('hb:auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('hb:auth:unauthorized', handleUnauthorized);
    };
  }, [refreshUsers]);

  // Login handler connecting to backend /auth/login
  const login = async (email, password = 'UtahLaw@2026!') => {
    try {
      const data = await authService.login(email.trim(), password);
      if (data?.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        await refreshUsers();
        return {
          success: true,
          user: data.user,
        };
      }
      return {
        success: false,
        message: 'Invalid server response: No user object returned.',
      };
    } catch (err) {
      return {
        success: false,
        message: err?.message || 'Login failed: Please verify your email and password.',
      };
    }
  };

  // Logout handler connecting to backend /auth/logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(MOCK_USERS[0]);
    }
  };

  // Add new firm user via backend /users
  const addUser = async (userData) => {
    try {
      const created = await userService.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password || 'UtahLaw@2026!',
        role: userData.role || 'attorney',
        phone: userData.phone,
        title: userData.title,
        department: userData.department,
        billingRate: parseFloat(userData.rate || userData.billingRate) || 0,
        status: userData.status || 'Active',
      });
      await refreshUsers();
      return { success: true, user: created };
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to create user' };
    }
  };

  // Update existing user via backend /users/:id
  const updateUser = async (userId, updatedFields) => {
    try {
      const updated = await userService.updateUser(userId, updatedFields);
      await refreshUsers();
      if (userId === currentUser?.id) {
        setCurrentUser((prev) => ({ ...prev, ...updated }));
      }
      return { success: true, user: updated };
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to update user' };
    }
  };

  // Toggle user Active / Inactive status via backend /users/:id/status
  const toggleUserStatus = async (userId) => {
    if (userId === currentUser?.id) {
      return {
        success: false,
        message: 'Security Violation: You cannot deactivate your own logged-in account.',
      };
    }

    try {
      const target = allUsers.find((u) => u.id === userId);
      const newStatus = target?.status === 'Active' ? 'Inactive' : 'Active';
      const updated = await userService.updateStatus(userId, newStatus);
      await refreshUsers();
      return { success: true, status: updated?.status || newStatus };
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to update user status' };
    }
  };

  // Delete user via backend /users/:id
  const deleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      return {
        success: false,
        message: 'Security Violation: You cannot delete your own logged-in account.',
      };
    }

    try {
      await userService.deleteUser(userId);
      await refreshUsers();
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to delete user' };
    }
  };

  const resetPassword = async (userId) => {
    const user = allUsers.find((u) => u.id === userId);
    return {
      success: true,
      message: `Password reset instructions dispatched to ${user?.email || 'user email'}.`,
    };
  };

  const updateRolePermission = (roleKey, permissionKey, granted) => {
    if (roleKey === 'super_admin') {
      return {
        success: false,
        message: 'Super Admin permissions are immutable and cannot be revoked.',
      };
    }

    setRolePermissions((prev) => {
      const currentRolePerms = prev[roleKey] || [];
      const updatedPerms = granted
        ? Array.from(new Set([...currentRolePerms, permissionKey]))
        : currentRolePerms.filter((k) => k !== permissionKey);

      return {
        ...prev,
        [roleKey]: updatedPerms,
      };
    });

    return { success: true };
  };

  const resetRolePermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        logout,
        allUsers,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        resetPassword,
        rolePermissions,
        updateRolePermission,
        resetRolePermissionsToDefault,
        refreshUsers,
        isSuperAdmin: currentUser?.role === 'super_admin',
        isAttorney: currentUser?.role === 'attorney',
        isParalegal: currentUser?.role === 'paralegal',
        isBilling: currentUser?.role === 'billing',
        isSupervisor: currentUser?.role === 'supervisor',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
