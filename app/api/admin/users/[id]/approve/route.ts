import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or super admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Approve the user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: true },
    });

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "User approved successfully",
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "An error occurred while approving user" },
      { status: 500 }
    );
  }
}
