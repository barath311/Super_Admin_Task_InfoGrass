import React, { useState, useEffect } from 'react';
import { Permission } from '../types';
import { permissionApi } from '../services/api';
import { Shield } from 'lucide-react';

type PermissionMatrix = {
  [role: string]: {
    GET: boolean;
    POST: boolean;
    PUT: boolean;
    DELETE: boolean;
  };
};

export const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionMatrix>({
    ADMIN: { GET: true, POST: true, PUT: false, DELETE: false },
    USER: { GET: true, POST: true, PUT: false, DELETE: false },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionApi.getAll();

      const matrix: PermissionMatrix = {
        ADMIN: { GET: true, POST: true, PUT: false, DELETE: false },
        USER: { GET: true, POST: true, PUT: false, DELETE: false },
      };

      data.forEach((perm) => {
        if (perm.role === 'ADMIN' || perm.role === 'USER') {
          matrix[perm.role][perm.method as keyof typeof matrix.ADMIN] = true;
        }
      });

      setPermissions(matrix);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (role: string, method: string) => {
    const currentValue = permissions[role][method as keyof typeof permissions.ADMIN];
    const newValue = !currentValue;

    setSaving(true);
    try {
      if (newValue) {
        await permissionApi.create({ role, method });
      } else {
        await permissionApi.delete(role, method);
      }

      setPermissions({
        ...permissions,
        [role]: {
          ...permissions[role],
          [method]: newValue,
        },
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permission');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading permissions...</div>
      </div>
    );
  }

  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const roles = ['ADMIN', 'USER'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-slate-900" />
        <h1 className="text-3xl font-bold text-slate-900">Permission Management</h1>
      </div>

      <p className="text-slate-600 mb-6">
        Control what actions Admin and User roles can perform on employee data.
        Toggle permissions on or off for each role.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {saving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          Saving changes...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{role}</h2>
            </div>

            <div className="space-y-4">
              {methods.map((method) => {
                const isEnabled = permissions[role][method as keyof typeof permissions.ADMIN];
                const isDefault = method === 'GET' || method === 'POST';

                return (
                  <div
                    key={method}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{method}</span>
                        {isDefault && (
                          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {method === 'GET' && 'View employee data'}
                        {method === 'POST' && 'Create new employees'}
                        {method === 'PUT' && 'Update employee information'}
                        {method === 'DELETE' && 'Remove employees'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggle(role, method)}
                      disabled={saving || isDefault}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-slate-900' : 'bg-slate-300'
                      } ${isDefault ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> GET and POST permissions are enabled by default and cannot be disabled.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
