import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/prisma";

export async function GET() {
  try {
    const dbConnected = await testDatabaseConnection();
    
    return NextResponse.json({
      status: "ok",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
