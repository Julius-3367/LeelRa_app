export function validateEnvironmentVariables() {
  const required = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "JWT_SECRET",
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error("Missing environment variables:", missing);
    return false;
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith("postgresql://")) {
    console.error("Invalid DATABASE_URL format. Expected postgresql://...");
    return false;
  }

  return true;
}
