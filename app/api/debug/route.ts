import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Debug endpoint called");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
    
    // Test simple database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database query result:", result);
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    return NextResponse.json({
      status: "success",
      database: "connected",
      userCount: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
