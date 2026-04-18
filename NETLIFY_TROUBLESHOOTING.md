# Netlify Deployment Failure - Troubleshooting Guide

## Issue: Deploy Failed During Build Phase

The deployment failed during the "Building" phase. This is typically due to:
1. Missing environment variables
2. Build errors in the code
3. Dependency issues
4. Configuration problems

## Immediate Steps to Fix

### 1. Check Detailed Build Logs
In Netlify dashboard:
- Click "Maximize log" under the deploy summary
- Look for specific error messages
- Note the exact error line

### 2. Add Missing Environment Variables
Go to Site settings > Environment variables and add:

```env
# Required for Next.js build
NEXTAUTH_SECRET=your_32_character_secret
NEXTAUTH_URL=https://deluxe-tiramisu-66fa7a.netlify.app

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.opnloqodiufrbwuswfam.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://opnloqodiufrbwuswfam.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_LyD1pKmVAOdWHfOIw9H8lA_8ws2mCP5

# JWT
JWT_SECRET=your_jwt_secret
```

### 3. Common Build Issues & Solutions

#### Issue: Database Connection Error
**Symptom**: `DATABASE_URL not found` or connection errors
**Fix**: Add DATABASE_URL environment variable

#### Issue: NextAuth Error
**Symptom**: `NEXTAUTH_SECRET not found`
**Fix**: Add NEXTAUTH_SECRET environment variable

#### Issue: TypeScript Build Error
**Symptom**: TypeScript compilation errors
**Fix**: Check for type errors in code

#### Issue: Memory Limit
**Symptom**: Build runs out of memory
**Fix**: Add NODE_OPTIONS=--max-old-space-size=2048

### 4. Try Local Build Test
```bash
# Clean build test
rm -rf .next
npm run build
```

If this fails locally, it will fail on Netlify too.

### 5. Alternative Configuration
Try changing Netlify build settings:
- **Base directory**: `.` (default)
- **Build command**: `npm run build`
- **Publish directory**: `.next`

## Quick Fix Steps

1. **Add environment variables** in Netlify dashboard
2. **Retry deployment** - click "Retry" button
3. **Check logs** if still failing
4. **Test locally** if needed

## If Still Failing

### Option 1: Use Vercel Instead
Vercel often has fewer build issues with Next.js.

### Option 2: Simplify Build
Create a `netlify.toml` file:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

### Option 3: Check Dependencies
Ensure all required packages are in package.json.

## Most Likely Issue
Missing environment variables is the #1 cause of Next.js build failures on Netlify.

**Add the environment variables first, then retry deployment!**
