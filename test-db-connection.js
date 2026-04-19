const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    // Test simple connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log('✅ User table accessible, count:', userCount);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
