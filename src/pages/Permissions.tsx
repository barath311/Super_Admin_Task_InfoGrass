import React, { useState, useEffect } from "react";
import { Permission } from "../types";
import { permissionApi } from "../services/api";
import { Shield } from "lucide-react";

export const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "";
    setRole(storedRole);
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionApi.getAll();
      setPermissions(data);
    } catch (err) {
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    roleName: string,
    field: keyof Permission,
    value: boolean
  ) => {
    if (role !== "CEO") {
      setError("Only CEO can modify permissions");
      return;
    }

    const existing = permissions.find((p) => p.role === roleName);
    if (!existing) return;

    const updated = { ...existing, [field]: value };

    setSaving(true);
    try {
      await permissionApi.update(roleName, updated);
      setPermissions((prev) =>
        prev.map((p) => (p.role === roleName ? updated : p))
      );
      setError("");
    } catch {
      setError("Failed to update permission");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading permissions...</div>
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-slate-900" />
        <h1 className="text-3xl font-bold text-slate-900">
          Permission Management
        </h1>
      </div>

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
        {permissions.map((perm) => (
          <div key={perm.role} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{perm.role}</h2>
            </div>

            {/* Permission switches */}
            <div className="space-y-4">
              {[
                { key: "canView", label: "GET - View Employees" },
                { key: "canUpdate", label: "POST/PUT - Add or Update Employees" },
                { key: "canDelete", label: "DELETE - Remove Employees" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <span className="font-semibold text-slate-900">{label}</span>
                  <button
                    onClick={() =>
                      handleToggle(
                        perm.role,
                        key as keyof Permission,
                        !perm[key as keyof Permission]
                      )
                    }
                    disabled={saving || role !== "CEO"}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      perm[key as keyof Permission]
                        ? "bg-slate-900"
                        : "bg-slate-300"
                    } ${
                      role !== "CEO"
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        perm[key as keyof Permission]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
