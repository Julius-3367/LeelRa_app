import { z } from "zod";
import {
  loginSchema,
  createUserSchema,
  activityRequestSchema,
  reviewRequestSchema,
  attendedEventSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validators";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(() => loginSchema.parse({ email: "user@example.com", password: "password123" })).not.toThrow();
  });
  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ email: "not-an-email", password: "password123" })).toThrow();
  });
  it("rejects empty password", () => {
    expect(() => loginSchema.parse({ email: "user@example.com", password: "" })).toThrow();
  });
});

describe("createUserSchema", () => {
  it("accepts valid user", () => {
    expect(() =>
      createUserSchema.parse({ name: "Alice", email: "alice@example.com", password: "Password@1", role: "MEMBER" })
    ).not.toThrow();
  });
  it("rejects short password", () => {
    expect(() =>
      createUserSchema.parse({ name: "Alice", email: "alice@example.com", password: "123", role: "MEMBER" })
    ).toThrow();
  });
  it("rejects invalid role", () => {
    expect(() =>
      createUserSchema.parse({ name: "Alice", email: "alice@example.com", password: "Password@1", role: "GOD" })
    ).toThrow();
  });
});

describe("activityRequestSchema", () => {
  const validRequest = {
    title: "Harambee Meeting",
    description: "Community fundraiser event",
    venue: "Ainamoi Stadium",
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    eventTime: "10:00",
    expectedAttendance: 200,
    organiserName: "John Doe",
    contactPhone: "+254700000000",
  };
  it("accepts valid request", () => {
    expect(() => activityRequestSchema.parse(validRequest)).not.toThrow();
  });
  it("rejects past event date", () => {
    expect(() =>
      activityRequestSchema.parse({ ...validRequest, eventDate: new Date(Date.now() - 86400000).toISOString() })
    ).toThrow();
  });
  it("rejects zero expected attendance", () => {
    expect(() =>
      activityRequestSchema.parse({ ...validRequest, expectedAttendance: 0 })
    ).toThrow();
  });
});

describe("reviewRequestSchema", () => {
  it("accepts approve with notes", () => {
    expect(() => reviewRequestSchema.parse({ status: "APPROVED", adminNotes: "Looks good" })).not.toThrow();
  });
  it("accepts reject without notes", () => {
    expect(() => reviewRequestSchema.parse({ status: "REJECTED" })).not.toThrow();
  });
  it("rejects invalid status", () => {
    expect(() => reviewRequestSchema.parse({ status: "MAYBE" })).toThrow();
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid password change", () => {
    expect(() =>
      changePasswordSchema.parse({ currentPassword: "OldPass@1", newPassword: "NewPass@1" })
    ).not.toThrow();
  });
  it("rejects if new password equals current password", () => {
    expect(() =>
      changePasswordSchema.parse({ currentPassword: "SamePass@1", newPassword: "SamePass@1" })
    ).toThrow();
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "test@example.com" })).not.toThrow();
  });
  it("rejects invalid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "not-email" })).toThrow();
  });
});
