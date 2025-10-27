export interface Employee {
  id?: number;
  name: string;
  email: string;
  department: string;
  salary: number;
}

export interface Permission {
  id?: number;
  role: string;
  method: string;
}

export interface User {
  username: string;
  password: string;
  role: 'CEO' | 'ADMIN' | 'USER';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (method: string) => boolean;
}
