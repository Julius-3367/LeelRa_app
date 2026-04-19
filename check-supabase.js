// Test different DATABASE_URL formats
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Testing Supabase connection formats...\n');

// Test 1: Check current format
console.log('1. Current DATABASE_URL format check:');
const currentUrl = process.env.DATABASE_URL;
console.log('   URL:', currentUrl || 'NOT SET');

if (currentUrl) {
  try {
    const url = new URL(currentUrl);
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Username:', url.username ? 'SET' : 'MISSING');
    console.log('   Password:', url.password ? 'SET' : 'MISSING');
  } catch (e) {
    console.log('   ❌ Invalid URL format:', e.message);
  }
}

console.log('\n2. Required format for Supabase:');
console.log('   postgresql://[user]:[password]@[host]:5432/[database]');

console.log('\n3. Example:');
console.log('   postgresql://postgres.abc123:password@abc123.supabase.co:5432/postgres');

console.log('\n4. Check Netlify environment variables:');
console.log('   Go to Netlify dashboard -> Site settings -> Environment variables');
console.log('   Verify DATABASE_URL is properly set');
