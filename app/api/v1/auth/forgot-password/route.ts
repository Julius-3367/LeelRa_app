import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendEmail, passwordResetEmailTemplate } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message, code: "VALIDATION_ERROR", statusCode: 400 },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate existing tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email: email.toLowerCase(), usedAt: null },
        data: { usedAt: new Date() },
      });

      await prisma.passwordResetToken.create({
        data: {
          email: email.toLowerCase(),
          token,
          expiresAt,
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      await sendEmail({
        to: email,
        subject: "LeelRa App — Password Reset Request",
        html: passwordResetEmailTemplate(user.name, resetUrl),
      });
    }

    return NextResponse.json({
      message: "If that email is registered, you will receive a reset link.",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}
