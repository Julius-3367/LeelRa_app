import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    console.log("Debug endpoint called");
    
    // Show exact DATABASE_URL being used
    const dbUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL:", dbUrl ? "SET" : "NOT SET");
    
    // Create fresh Prisma client to avoid caching
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    
    // Test simple database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database query result:", result);
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: "success",
      database: "connected",
      databaseUrl: dbUrl ? dbUrl.substring(0, 50) + "..." : "NOT SET",
      userCount: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      database: "disconnected",
      databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "NOT SET",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
