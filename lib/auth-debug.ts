// Debug NextAuth configuration
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("NextAuth authorize called with:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          
          console.log("User found:", user ? "YES" : "NO");
          
          if (!user) {
            console.log("User not found in database");
            throw new Error("Invalid email or password");
          }

          if (!user.isActive) {
            console.log("User account is inactive");
            throw new Error("Your account has been deactivated");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          
          console.log("Password valid:", isValid);
          
          if (!isValid) {
            console.log("Invalid password");
            throw new Error("Invalid email or password");
          }

          console.log("Authentication successful");
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profilePhoto: user.profilePhoto,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed: " + error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback called");
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.profilePhoto = (user as any).profilePhoto;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called");
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.profilePhoto = token.profilePhoto as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
