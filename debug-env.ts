// Debug environment variables
console.log("=== Environment Variables Debug ===");
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "MISSING");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "SET" : "MISSING");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING");
console.log("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "SET" : "MISSING");

export default function DebugEnv() {
  return (
    <div>
      <h1>Environment Variables Debug</h1>
      <p>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING"}</p>
      <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? "✅ SET" : "❌ MISSING"}</p>
      <p>DATABASE_URL: {process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING"}</p>
      <p>JWT_SECRET: {process.env.JWT_SECRET ? "✅ SET" : "❌ MISSING"}</p>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ SET" : "❌ MISSING"}</p>
      <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "✅ SET" : "❌ MISSING"}</p>
    </div>
  );
}
