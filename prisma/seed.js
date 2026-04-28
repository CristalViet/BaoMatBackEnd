const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { APP_PERMISSIONS } = require("../src/utils/permissions");

const prisma = new PrismaClient();

async function main() {
  for (const item of APP_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: item.key },
      update: {
        name: item.name,
        group: item.group,
        description: item.description || null,
      },
      create: item,
    });
  }

  const permissionRecords = await prisma.permission.findMany();
  const permissionIds = permissionRecords.map((item) => item.id);

  const adminRole = await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: {
      name: "Administrator",
      description: "Full access to HR system",
    },
    create: {
      code: "ADMIN",
      name: "Administrator",
      description: "Full access to HR system",
    },
  });

  const hrRole = await prisma.role.upsert({
    where: { code: "HR_MANAGER" },
    update: {
      name: "HR Manager",
      description: "Manage employees and accounts",
    },
    create: {
      code: "HR_MANAGER",
      name: "HR Manager",
      description: "Manage employees and accounts",
    },
  });

  await prisma.rolePermission.deleteMany({
    where: { roleId: { in: [adminRole.id, hrRole.id] } },
  });

  await prisma.rolePermission.createMany({
    data: permissionIds.flatMap((permissionId) => [
      { roleId: adminRole.id, permissionId },
      { roleId: hrRole.id, permissionId },
    ]),
    skipDuplicates: true,
  });

  const employee = await prisma.employee.upsert({
    where: { employeeCode: "EX0123" },
    update: {
      fullName: "Nguyen Admin",
      email: "admin@exection.co.jp",
      department: "HR",
      position: "Administrator",
      grade: "L2",
      employmentType: "Full-time",
      workingStatus: "Active",
      joinDate: new Date("2025-02-30T00:00:00.000Z".replace("30", "28")),
      birthDate: new Date("2000-02-20T00:00:00.000Z"),
      hobby: "Reading, badminton",
      address: "Tokyo, Japan",
      phoneNumber: "09012345678",
      selfPr: "Responsible for system administration and HR operations.",
    },
    create: {
      employeeCode: "EX0123",
      fullName: "Nguyen Admin",
      fullNameKana: "グエン・アドミン",
      email: "admin@exection.co.jp",
      department: "HR",
      position: "Administrator",
      grade: "L2",
      employmentType: "Full-time",
      workingStatus: "Active",
      joinDate: new Date("2025-02-28T00:00:00.000Z"),
      birthDate: new Date("2000-02-20T00:00:00.000Z"),
      hobby: "Reading, badminton",
      address: "Tokyo, Japan",
      phoneNumber: "09012345678",
      selfPr: "Responsible for system administration and HR operations.",
    },
  });

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const account = await prisma.userAccount.upsert({
    where: { email: "admin@exection.co.jp" },
    update: {
      employeeId: employee.id,
      passwordHash,
      status: "ACTIVE",
    },
    create: {
      employeeId: employee.id,
      email: "admin@exection.co.jp",
      passwordHash,
      status: "ACTIVE",
    },
  });

  await prisma.userRole.deleteMany({
    where: { userId: account.id },
  });

  await prisma.userRole.createMany({
    data: [{ userId: account.id, roleId: adminRole.id }],
    skipDuplicates: true,
  });

  await prisma.qualification.upsert({
    where: { id: "seed-qualification-jlpt-n3" },
    update: {
      employeeId: employee.id,
      title: "Japanese Language Proficiency Test - JLPT N3",
      issuer: "JLPT",
      acquiredDate: new Date("2025-09-08T00:00:00.000Z"),
      expiryDate: new Date("2028-09-08T00:00:00.000Z"),
      note: "Seed qualification",
    },
    create: {
      id: "seed-qualification-jlpt-n3",
      employeeId: employee.id,
      title: "Japanese Language Proficiency Test - JLPT N3",
      issuer: "JLPT",
      acquiredDate: new Date("2025-09-08T00:00:00.000Z"),
      expiryDate: new Date("2028-09-08T00:00:00.000Z"),
      note: "Seed qualification",
    },
  });

  await prisma.employeeDocument.upsert({
    where: { id: "seed-skill-sheet" },
    update: {
      employeeId: employee.id,
      type: "SKILL_SHEET",
      fileName: "skill-sheet.docx",
      fileUrl: "https://example.com/files/skill-sheet.docx",
    },
    create: {
      id: "seed-skill-sheet",
      employeeId: employee.id,
      type: "SKILL_SHEET",
      fileName: "skill-sheet.docx",
      fileUrl: "https://example.com/files/skill-sheet.docx",
    },
  });

  const existingContact = await prisma.emergencyContact.findFirst({
    where: { employeeId: employee.id },
  });

  if (existingContact) {
    await prisma.emergencyContact.update({
      where: { id: existingContact.id },
      data: {
        name: "Tran Family Contact",
        relationship: "Sibling",
        address: "Tokyo, Japan",
        phoneNumber: "09088889999",
      },
    });
  } else {
    await prisma.emergencyContact.create({
      data: {
        employeeId: employee.id,
        name: "Tran Family Contact",
        relationship: "Sibling",
        address: "Tokyo, Japan",
        phoneNumber: "09088889999",
      },
    });
  }

  console.log("Seed completed");
  console.log("Admin login:", {
    email: "admin@exection.co.jp",
    password: "Admin@123",
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
