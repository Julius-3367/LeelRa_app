import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { uploadFile } from "@/lib/cloudinary";

// GET /api/v1/users/me
export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("[ME_GET]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/users/me — update own profile
export async function PATCH(request: NextRequest) {
  const { error, session } = await requireAuth(request);
  if (error) return error;

  try {
    let name: string | undefined;
    let phone: string | undefined;
    let profilePhoto: string | undefined;

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        profilePhoto = await uploadFile(buffer, "profile-photos", session!.user.id);
      }
    } else {
      const body = await request.json();
      name = body.name;
      phone = body.phone;
      profilePhoto = body.profilePhoto;
    }

    const updated = await prisma.user.update({
      where: { id: session!.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(profilePhoto !== undefined && { profilePhoto }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profilePhoto: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[ME_PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
