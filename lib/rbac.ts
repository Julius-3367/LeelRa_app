import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  SUPPORT_STAFF: 2,
  MEMBER: 1,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasAnyRole(userRole: UserRole, roles: UserRole[]): boolean {
  return roles.includes(userRole);
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED", statusCode: 401 },
        { status: 401 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireRole(request: NextRequest, roles: UserRole[]) {
  const { error, session } = await requireAuth(request);
  if (error) return { error, session: null };

  if (!hasAnyRole(session!.user.role, roles)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN", statusCode: 403 },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}
