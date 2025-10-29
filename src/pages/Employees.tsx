import React, { useState, useEffect } from 'react';
import { employeeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Employee {
  id?: number;
  employeeName: string;
  employeeSalary: number;
  employeeLocation: string;
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Employee>({
    employeeName: '',
    employeeSalary: 0,
    employeeLocation: '',
  });

  const { hasPermission } = useAuth();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getAll();
      setEmployees(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee?.id) {
        if (!hasPermission('UPDATE'))
          return setError('You do not have permission to update employees');
        await employeeApi.update(editingEmployee.id, formData);
      } else {
        if (!hasPermission('UPDATE'))
          return setError('You do not have permission to add employees');
        await employeeApi.create(formData);
      }
      closeModal();
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!hasPermission('DELETE'))
      return setError('You do not have permission to delete employees');
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeApi.delete(id);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
    }
  };

  const handleEdit = (employee: Employee) => {
    if (!hasPermission('UPDATE'))
      return setError('You do not have permission to update employees');
    setEditingEmployee(employee);
    setFormData(employee);
    setShowModal(true);
    setError('');
  };

  const handleAdd = () => {
    if (!hasPermission('UPDATE'))
      return setError('You do not have permission to add employees');
    setEditingEmployee(null);
    setFormData({ employeeName: '', employeeSalary: 0, employeeLocation: '' });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({ employeeName: '', employeeSalary: 0, employeeLocation: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading employees...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
        {hasPermission('UPDATE') && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Salary</th>
              {(hasPermission('UPDATE') || hasPermission('DELETE')) && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900">{employee.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {employee.employeeName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {employee.employeeLocation}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  ${employee.employeeSalary.toLocaleString()}
                </td>
                {(hasPermission('UPDATE') || hasPermission('DELETE')) && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {hasPermission('UPDATE') && (
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('DELETE') && (
                        <button
                          onClick={() => employee.id && handleDelete(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            No employees found. Add your first employee to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.employeeLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeLocation: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Salary</label>
                <input
                  type="number"
                  value={formData.employeeSalary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeSalary: Number(e.target.value),
                    })
                  }
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
