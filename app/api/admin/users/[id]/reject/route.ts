import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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
      where: { email: session.user?.email },
    });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the user (reject)
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "User rejected and removed successfully",
    });

  } catch (error) {
    console.error("Error rejecting user:", error);
    return NextResponse.json(
      { error: "An error occurred while rejecting user" },
      { status: 500 }
    );
  }
}
