// src/api/api.ts
import { Employee, Permission } from '../types';

const API_BASE_URL = 'http://localhost:8080';

// Used only for login (Basic Auth)
let authHeader = '';

/* ---------------- UTILS ---------------- */
export const setAuthHeader = (username: string, password: string) => {
  authHeader = 'Basic ' + btoa(`${username}:${password}`);
};

export const clearAuthHeader = () => {
  authHeader = '';
};

const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth && authHeader) {
    headers['Authorization'] = authHeader;
  }
  return headers;
};

// ✅ Always include credentials to send/receive cookies (JSESSIONID)
const fetchWithAuth = (url: string, options: RequestInit = {}) =>
  fetch(url, { ...options, headers: getHeaders(false), credentials: 'include' });

/* ---------------- AUTH API ---------------- */
export const authApi = {
  login: async (username: string, password: string): Promise<{ username: string; role: string }> => {
    setAuthHeader(username, password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ username, password }),
      credentials: 'include', // 🔥 Ensures session cookie is stored
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();

    // ✅ Clear Basic Auth (we now rely on the JSESSIONID cookie)
    clearAuthHeader();

    // ✅ Optional: store role locally to control UI access
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('username', data.username);

    return data;
  },

  logout: async (): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  },
};

/* ---------------- EMPLOYEE API ---------------- */
export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  },

  create: async (employee: Employee): Promise<Employee> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees`, {
      method: 'POST',
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  },

  update: async (id: number, employee: Employee): Promise<Employee> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete employee');
  },
};

/* ---------------- PERMISSION API ---------------- */
export const permissionApi = {
// ✅ Get all permissions
getAll: async (): Promise<Permission[]> => {
const response = await fetchWithAuth(`${API_BASE_URL}/permissions`);
if (!response.ok) throw new Error('Failed to load permissions');
return response.json();
},

// ✅ Create new permission (POST)
create: async (permission: Permission): Promise<Permission> => {
const response = await fetchWithAuth(`${API_BASE_URL}/permissions`, {
method: 'POST',
body: JSON.stringify(permission),
});
if (!response.ok) throw new Error('Failed to create permission');
return response.json();
},

// ✅ Update existing permission (PUT)
update: async (role: string, updatedPermission: Permission): Promise<Permission> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/permissions/${role}`, {
      method: 'PUT',
      body: JSON.stringify(updatedPermission),
    });
    if (!response.ok) throw new Error('Failed to update permission');
    return response.json();
  },

// ✅ Delete permission (optional)
delete: async (role: string): Promise<void> => {
const response = await fetchWithAuth(`${API_BASE_URL}/permissions/${role}`, {
method: 'DELETE',
});
if (!response.ok) throw new Error('Failed to delete permission');
},
};

