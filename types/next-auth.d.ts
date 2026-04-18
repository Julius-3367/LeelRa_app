import { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      profilePhoto?: string | null;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    profilePhoto?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profilePhoto?: string | null;
  }
}
