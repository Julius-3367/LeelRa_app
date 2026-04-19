import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    console.log("Debug endpoint called");
    
    // Show exact DATABASE_URL being used
    const dbUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL:", dbUrl ? "SET" : "NOT SET");
    console.log("Full DATABASE_URL:", dbUrl);
    
    // Use Transaction Pooler URL with prepared statements disabled
    const poolerUrl = "postgresql://postgres.opnloqodiufrbwuswfam:tybp0pDhZCUf2JVr@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?prepare=false&statement_cache_size=0&connection_limit=1";
    
    // Create fresh Prisma client with prepared statements disabled
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: poolerUrl,
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
      databaseUrl: poolerUrl.substring(0, 50) + "...",
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
      databaseUrl: "postgresql://postgres.opnloqodiufrbwuswfam:***@aws-1-eu-north-1.pooler.supabase.com:6543/postgres",
      envDatabaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "NOT SET",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
