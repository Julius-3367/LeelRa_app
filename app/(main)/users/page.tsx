"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, X, Loader2, UserCog, Trash2, ToggleLeft, ToggleRight, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { redirect } from "next/navigation";

const ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF", "MEMBER"] as const;
type Role = typeof ROLES[number];

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  profilePhoto: string | null;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);

  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  useEffect(() => {
    if (status === "authenticated" && !isSuperAdmin) {
      window.location.href = "/dashboard";
    }
  }, [status, isSuperAdmin]);

  const fetchUsers = async (p = 1, q = "", role = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (q) params.set("search", q);
      if (role) params.set("role", role);
      const res = await fetch(`/api/v1/users?${params}`);
      const json = await res.json();
      setUsers(json.data ?? []);
      setMeta(json.pagination ?? null);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isSuperAdmin) fetchUsers(); }, [isSuperAdmin]);

  const toggleActive = async (user: UserRow) => {
    const res = await fetch(`/api/v1/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (res.ok) {
      toast({ title: `User ${user.isActive ? "deactivated" : "activated"}` });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/v1/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "User deleted" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Manage system users and roles</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); fetchUsers(1, search, roleFilter); } }}
            placeholder="Search by name or email..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); fetchUsers(1, search, e.target.value); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
        </select>
        {(search || roleFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setRoleFilter(""); fetchUsers(1, "", ""); }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditUser(user)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActive(user)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title={user.isActive ? "Deactivate" : "Activate"}>
                          {user.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        {session?.user.id !== user.id && (
                          <button onClick={() => deleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); fetchUsers(np, search, roleFilter); }}>Previous</Button>
          <span className="flex items-center text-sm text-gray-600 px-2">Page {meta.page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => { const np = page + 1; setPage(np); fetchUsers(np, search, roleFilter); }}>Next</Button>
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && <UserFormModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchUsers(1, search, roleFilter); toast({ title: "User created" }); }} />}

      {/* Edit User Modal */}
      {editUser && (
        <UserFormModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { setEditUser(null); fetchUsers(page, search, roleFilter); toast({ title: "User updated" }); }}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    SUPPORT_STAFF: "bg-yellow-100 text-yellow-700",
    MEMBER: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] ?? "bg-gray-100 text-gray-600"}`}>
      {role.replace(/_/g, " ")}
    </span>
  );
}

function UserFormModal({ user, onClose, onSuccess }: { user?: UserRow; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "MEMBER" as Role, password: "", isActive: user?.isActive ?? true });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: any = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
      if (!user && form.password) body.password = form.password;
      const res = await fetch(user ? `/api/v1/users/${user.id}` : "/api/v1/users", {
        method: user ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) { onSuccess(); } else { toast({ title: "Error", description: json.error, variant: "destructive" }); }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{user ? "Edit User" : "Create User"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          {user && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : user ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}


