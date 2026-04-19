import { prisma } from './lib/prisma';

// Test the specific failing case
async function testActivityFindUnique() {
  const activity = await prisma.activity.findUnique({
    where: { id: 'test-id' },
    include: {
      request: {
        select: {
          organiserName: true,
          contactPhone: true,
          expectedAttendance: true,
          attachmentUrl: true,
        },
      },
    },
  });
  return activity;
}

testActivityFindUnique();
