import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS, getUserById } from '../data/mockUsers';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';
import { mockStorage } from '../services/mockStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Dynamic user list initialized from mockStorage or default MOCK_USERS
  const [allUsers, setAllUsers] = useState(() => {
    return mockStorage.get('firm_users_list', MOCK_USERS);
  });

  // Dynamic role permissions matrix initialized from mockStorage or DEFAULT_ROLE_PERMISSIONS
  const [rolePermissions, setRolePermissions] = useState(() => {
    return mockStorage.get('firm_role_permissions', DEFAULT_ROLE_PERMISSIONS);
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUserId = mockStorage.get('current_user_id', 'usr-1');
    const existingList = mockStorage.get('firm_users_list', MOCK_USERS);
    const found = existingList.find(u => u.id === savedUserId);
    return found || getUserById(savedUserId) || MOCK_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return mockStorage.get('is_authenticated', false);
  });

  // Login handler with Inactive Account restriction
  const login = (email) => {
    const currentList = mockStorage.get('firm_users_list', allUsers);
    const matchedUser = currentList.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase()) ||
      MOCK_USERS.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase()) ||
      currentList[0];

    // Check account status
    if (matchedUser.status === 'Inactive') {
      return {
        success: false,
        message: `Account for ${matchedUser.name} has been deactivated by the firm Super Admin. Workstation login is blocked.`,
      };
    }

    // Update last login
    const updatedUser = {
      ...matchedUser,
      lastLogin: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedList = currentList.map(u => u.id === updatedUser.id ? updatedUser : u);
    setAllUsers(updatedList);
    mockStorage.set('firm_users_list', updatedList);

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    mockStorage.set('current_user_id', updatedUser.id);
    mockStorage.set('is_authenticated', true);

    return {
      success: true,
      user: updatedUser,
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    mockStorage.set('is_authenticated', false);
  };

  // Add new firm user
  const addUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '(801) 555-0199',
      role: userData.role || 'attorney',
      title: userData.title || 'Staff Attorney',
      initials: userData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      department: userData.department || 'Litigation',
      rate: parseFloat(userData.rate) || 350,
      status: userData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      avatar: null,
    };

    setAllUsers(prev => {
      const next = [...prev, newUser];
      mockStorage.set('firm_users_list', next);
      return next;
    });

    return { success: true, user: newUser };
  };

  // Update existing user with self-modification safeguards
  const updateUser = (userId, updatedFields) => {
    // Self-modification protection: A user cannot modify their own active role or deactivate themselves
    if (userId === currentUser.id) {
      if (updatedFields.role && updatedFields.role !== currentUser.role) {
        return {
          success: false,
          message: 'Security Violation: You cannot alter your own active role or elevate privileges.',
        };
      }
      if (updatedFields.status === 'Inactive') {
        return {
          success: false,
          message: 'Security Violation: You cannot deactivate your own active session account.',
        };
      }
    }

    let updatedRecord = null;
    setAllUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId) {
          updatedRecord = { ...u, ...updatedFields };
          return updatedRecord;
        }
        return u;
      });
      mockStorage.set('firm_users_list', next);
      return next;
    });

    // If updating current user's profile info (e.g. phone/rate)
    if (userId === currentUser.id && updatedRecord) {
      setCurrentUser(updatedRecord);
      mockStorage.set('current_user_id', updatedRecord.id);
    }

    return { success: true, user: updatedRecord };
  };

  // Toggle user Active / Inactive status
  const toggleUserStatus = (userId) => {
    if (userId === currentUser.id) {
      return {
        success: false,
        message: 'Security Violation: You cannot deactivate your own logged-in account.',
      };
    }

    let newStatus = 'Active';
    setAllUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId) {
          newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      });
      mockStorage.set('firm_users_list', next);
      return next;
    });

    return { success: true, status: newStatus };
  };

  // Delete user (with protection against self-deletion)
  const deleteUser = (userId) => {
    if (userId === currentUser.id) {
      return {
        success: false,
        message: 'Security Violation: You cannot delete your own logged-in account.',
      };
    }

    setAllUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      mockStorage.set('firm_users_list', next);
      return next;
    });

    return { success: true };
  };

  // Reset password mock dispatcher
  const resetPassword = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return {
      success: true,
      message: `Password reset instructions and cryptographic token dispatched to ${user?.email || 'user email'}.`,
    };
  };

  // Role Permissions: Toggle or update specific permission for a role
  const updateRolePermission = (roleKey, permissionKey, granted) => {
    if (roleKey === 'super_admin') {
      return {
        success: false,
        message: 'Super Admin permissions are immutable and cannot be revoked.',
      };
    }

    setRolePermissions(prev => {
      const currentRolePerms = prev[roleKey] || [];
      const updatedPerms = granted
        ? Array.from(new Set([...currentRolePerms, permissionKey]))
        : currentRolePerms.filter(k => k !== permissionKey);

      const next = {
        ...prev,
        [roleKey]: updatedPerms,
      };

      mockStorage.set('firm_role_permissions', next);
      return next;
    });

    return { success: true };
  };

  // Reset all role permissions back to recommended default baseline
  const resetRolePermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    mockStorage.set('firm_role_permissions', DEFAULT_ROLE_PERMISSIONS);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
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
      isSuperAdmin: currentUser.role === 'super_admin',
      isAttorney: currentUser.role === 'attorney',
      isParalegal: currentUser.role === 'paralegal',
      isBilling: currentUser.role === 'billing',
      isSupervisor: currentUser.role === 'supervisor',
    }}>
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
