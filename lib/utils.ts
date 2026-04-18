import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  userId,
  action,
  resource,
  resourceId,
  description,
  ipAddress,
}: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
}) {
  return await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      description,
      ipAddress,
    },
  });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export function paginate(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export function apiError(
  message: string,
  code: string,
  statusCode: number
) {
  return { error: message, code, statusCode };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
