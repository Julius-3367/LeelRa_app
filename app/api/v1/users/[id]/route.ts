import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { updateUserSchema } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { UserRole } from "@prisma/client";

// GET /api/v1/users/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("[USER_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/users/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: result.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "UPDATE",
      resource: "user",
      resourceId: params.id,
      description: `Updated user ${user.email}`,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[USER_PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users/:id — deactivates the user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole(request, [UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    if (params.id === session!.user.id) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account", code: "FORBIDDEN", statusCode: 400 },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "DEACTIVATE",
      resource: "user",
      resourceId: params.id,
      description: `Deactivated user ${user.email}`,
    });

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("[USER_DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
