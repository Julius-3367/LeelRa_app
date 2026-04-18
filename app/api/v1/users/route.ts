import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { createUserSchema, paginationSchema } from "@/lib/validators";
import { createAuditLog, paginate, paginatedResponse } from "@/lib/utils";
import { UserRole } from "@prisma/client";

// GET /api/v1/users - List all users
export async function GET(request: NextRequest) {
  const { error, session } = await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (role && Object.values(UserRole).includes(role)) where.role = role;
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          profilePhoto: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        ...paginate(parsed.page, parsed.limit),
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(users, total, parsed.page, parsed.limit));
  } catch (err) {
    console.error("[USERS_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST /api/v1/users - Create user
export async function POST(request: NextRequest) {
  const { error, session } = await requireRole(request, [UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const { name, email, phone, role, password } = result.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists", code: "DUPLICATE_EMAIL", statusCode: 409 },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        role: role as UserRole,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: session!.user.id,
      action: "CREATE",
      resource: "user",
      resourceId: user.id,
      description: `Created user ${user.email} with role ${user.role}`,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[USERS_POST]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
