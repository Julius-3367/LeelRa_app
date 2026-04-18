import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect", code: "INVALID_PASSWORD", statusCode: 400 },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("[CHANGE_PASSWORD]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
