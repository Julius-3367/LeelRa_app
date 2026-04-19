import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Supabase configuration
    const supabaseUrl = "https://opnloqodiufrbwuswfam.supabase.co";
    const supabaseKey = "sb_publishable_LyD1pKmVAOdWHfOIw9H8lA_8ws2mCP5";

    // Check if user already exists
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checkResponse.ok) {
      throw new Error(`HTTP ${checkResponse.status}: ${checkResponse.statusText}`);
    }

    const existingUsers = await checkResponse.json();
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user via Supabase REST API
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name,
        email,
        password_hash: passwordHash,
        phone,
        role: 'MEMBER',
        is_active: false, // Require admin approval
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.error("Create user error:", errorData);
      throw new Error(`HTTP ${createResponse.status}: ${createResponse.statusText}`);
    }

    const createdUser = await createResponse.json();
    const user = createdUser[0];

    // Return user without password hash
    const { password_hash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "User registered successfully. Awaiting admin approval.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
