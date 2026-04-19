"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Check, X, Shield, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchUsers();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh users list
      } else {
        setError("Failed to approve user");
      }
    } catch (error) {
      setError("An error occurred while approving user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh users list
      } else {
        setError("Failed to reject user");
      }
    } catch (error) {
      setError("An error occurred while rejecting user");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingUsers = users.filter(user => !user.isActive);
  const activeUsers = users.filter(user => user.isActive);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user registrations and approve new accounts
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Users */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-orange-500" />
              Pending Approval ({pendingUsers.length})
            </CardTitle>
            <CardDescription>
              Users awaiting admin approval to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending users</p>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-orange-50"
                  >
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{user.role}</Badge>
                      <Badge variant="outline" className="text-orange-600">
                        Pending
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectUser(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              Active Users ({activeUsers.length})
            </CardTitle>
            <CardDescription>
              Approved users with access to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active users</p>
            ) : (
              <div className="space-y-4">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
