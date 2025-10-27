import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, LogOut, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
            </div>
          </div>
          <div className="mt-4 px-3 py-2 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-600">Logged in as</p>
            <p className="font-semibold text-slate-900">{user?.username}</p>
            <p className="text-xs text-slate-600 mt-1">
              Role: <span className="font-medium text-slate-900">{user?.role}</span>
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavLink to="/dashboard/employees" className={navLinkClass}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Employees</span>
          </NavLink>

          {user?.role === 'CEO' && (
            <NavLink to="/dashboard/permissions" className={navLinkClass}>
              <Shield className="w-5 h-5" />
              <span className="font-medium">Permissions</span>
            </NavLink>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
