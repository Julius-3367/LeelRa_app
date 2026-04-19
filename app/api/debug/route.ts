import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Debug endpoint called");
    
    // Test Supabase REST API connection
    const supabaseUrl = "https://opnloqodiufrbwuswfam.supabase.co";
    const supabaseKey = "sb_publishable_LyD1pKmVAOdWHfOIw9H8lA_8ws2mCP5";
    
    // Test simple connection via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const userCount = data.length > 0 ? data[0].count : 0;
    
    console.log("Supabase REST API connection successful, user count:", userCount);
    
    return NextResponse.json({
      status: "success",
      database: "connected",
      databaseUrl: "Supabase REST API",
      connectionMethod: "REST API",
      userCount: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      database: "disconnected",
      databaseUrl: "Supabase REST API",
      connectionMethod: "REST API",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
