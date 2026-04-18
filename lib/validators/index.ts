import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF", "MEMBER"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF", "MEMBER"]).optional(),
  isActive: z.boolean().optional(),
});

export const activityRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  venue: z.string().min(3, "Venue must be at least 3 characters"),
  eventDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid date format",
  }),
  eventTime: z.string().regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Invalid time format (HH:MM)"),
  expectedAttendance: z
    .number()
    .int()
    .positive("Expected attendance must be a positive number"),
  organiserName: z.string().min(2, "Organiser name is required"),
  contactPhone: z.string().min(10, "Contact phone must be at least 10 digits"),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

export const reviewRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "UNDER_CONSIDERATION"]),
  adminNotes: z.string().optional(),
});

export const attendedEventSchema = z.object({
  activityId: z.string().uuid("Invalid activity ID"),
  dateAttended: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid date",
  }),
  venue: z.string().min(3),
  participantCount: z.number().int().positive(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional().default([]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateActivitySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  venue: z.string().min(3).optional(),
  eventDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)))
    .optional(),
  eventTime: z
    .string()
    .regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
    .optional(),
  status: z.enum(["UPCOMING", "ATTENDED", "CANCELLED"]).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
