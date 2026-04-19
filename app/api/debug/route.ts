import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    console.log("Debug endpoint called");
    
    // Show exact DATABASE_URL being used
    const dbUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL:", dbUrl ? "SET" : "NOT SET");
    console.log("Full DATABASE_URL:", dbUrl);
    
    // Use direct database URL to avoid Transaction Pooler issues
    const directDbUrl = "postgresql://postgres:tybp0pDhZCUf2JVr@db.opnloqodiufrbwuswfam.supabase.co:5432/postgres";
    
    // Create fresh Prisma client with direct database URL
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: directDbUrl,
        },
      },
    });
    
    // Test database connection with simple Prisma query (no raw queries)
    const userCount = await prisma.user.count();
    console.log("Database connection successful, user count:", userCount);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: "success",
      database: "connected",
      databaseUrl: directDbUrl.substring(0, 50) + "...",
      envDatabaseUrl: dbUrl ? dbUrl.substring(0, 50) + "..." : "NOT SET",
      userCount: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      database: "disconnected",
      databaseUrl: "postgresql://postgres:***@db.opnloqodiufrbwuswfam.supabase.co:5432/postgres",
      envDatabaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "NOT SET",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
