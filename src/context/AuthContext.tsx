import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { authApi, permissionApi, setAuthHeader, clearAuthHeader } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAuthHeader(parsedUser.username, parsedUser.password);
      loadPermissions(parsedUser.role);
    }
  }, []);

  const loadPermissions = async (role: string) => {
    if (role === 'CEO') {
      setPermissions(['GET', 'POST', 'PUT', 'DELETE']);
      return;
    }

    try {
      const perms = await permissionApi.getAll();
      const userPerms = perms
        .filter(p => p.role === role)
        .map(p => p.method);
      setPermissions(userPerms.length > 0 ? userPerms : ['GET', 'POST']);
    } catch (error) {
      setPermissions(['GET', 'POST']);
    }
  };

  const login = async (username: string, password: string) => {
    const { role } = await authApi.login(username, password);
    const userData: User = {
      username,
      password,
      role: role as 'CEO' | 'ADMIN' | 'USER',
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    await loadPermissions(role);
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('user');
    clearAuthHeader();
  };

  const hasPermission = (method: string): boolean => {
    if (!user) return false;
    if (user.role === 'CEO') return true;
    return permissions.includes(method);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
