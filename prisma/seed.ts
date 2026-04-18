import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const superAdminPassword = await bcrypt.hash("SuperAdmin@2026", 12);
  const adminPassword = await bcrypt.hash("Admin@2026", 12);
  const memberPassword = await bcrypt.hash("Member@2026", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "wakili.langat@leelra.ke" },
    update: {},
    create: {
      name: "Wakili Geoffrey Langat",
      email: "wakili.langat@leelra.ke",
      phone: "+254700000001",
      passwordHash: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@leelra.ke" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@leelra.ke",
      phone: "+254700000002",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const supportStaff = await prisma.user.upsert({
    where: { email: "support@leelra.ke" },
    update: {},
    create: {
      name: "Support Staff",
      email: "support@leelra.ke",
      phone: "+254700000003",
      passwordHash: memberPassword,
      role: UserRole.SUPPORT_STAFF,
      isActive: true,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@leelra.ke" },
    update: {},
    create: {
      name: "John Organiser",
      email: "member@leelra.ke",
      phone: "+254700000004",
      passwordHash: memberPassword,
      role: UserRole.MEMBER,
      isActive: true,
    },
  });

  console.log("✅ Created users:", {
    superAdmin: superAdmin.email,
    admin: admin.email,
    supportStaff: supportStaff.email,
    member: member.email,
  });

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
