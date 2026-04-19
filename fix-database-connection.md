# Database Connection Fix for Supabase

## Issue Identified
The DATABASE_URL format is incorrect for Supabase. Current format is missing required components.

## Required DATABASE_URL Format
```
postgresql://[username]:[password]@[host]:5432/[database]
```

## For Supabase
1. Go to your Supabase dashboard
2. Go to Project Settings -> Database
3. Find the "Connection string" 
4. Copy the full connection string

## Example Format
```
postgresql://postgres.abc123:password@abc123.supabase.co:5432/postgres
```

## Netlify Environment Variables
1. Go to Netlify dashboard
2. Select your site: deluxe-tiramisu-66fa7a
3. Go to Site settings -> Environment variables
4. Add/update DATABASE_URL with the correct format

## Test Connection
After fixing DATABASE_URL, test with:
```bash
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL)"
```

## Common Issues
- Missing username/password in URL
- Wrong database name (should be 'postgres')
- Incorrect port (should be 5432)
- Special characters not properly encoded
