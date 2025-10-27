import { Employee, Permission } from '../types';

const API_BASE_URL = 'http://localhost:8080';

let authHeader = '';

export const setAuthHeader = (username: string, password: string) => {
  authHeader = 'Basic ' + btoa(`${username}:${password}`);
};

export const clearAuthHeader = () => {
  authHeader = '';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': authHeader,
});

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  },

  create: async (employee: Employee): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  },

  update: async (id: number, employee: Employee): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete employee');
  },
};

export const permissionApi = {
  getAll: async (): Promise<Permission[]> => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch permissions');
    return response.json();
  },

  create: async (permission: Permission): Promise<Permission> => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(permission),
    });
    if (!response.ok) throw new Error('Failed to create permission');
    return response.json();
  },

  delete: async (role: string, method: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/permissions/${role}?method=${method}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete permission');
  },
};

export const authApi = {
  login: async (username: string, password: string): Promise<{ role: string }> => {
    setAuthHeader(username, password);
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: getHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      clearAuthHeader();
      throw new Error('Invalid credentials');
    }

    if (!response.ok) {
      clearAuthHeader();
      throw new Error('Login failed');
    }

    const roleHeader = response.headers.get('X-User-Role');
    return { role: roleHeader || 'USER' };
  },
};
