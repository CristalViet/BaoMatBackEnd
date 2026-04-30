const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");
const { signAccessToken } = require("../utils/jwt");
const {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
} = require("../validators/auth.validator");

const register = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);

  const existingAccount = await prisma.userAccount.findUnique({
    where: { email: payload.email },
  });

  if (existingAccount) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const existingEmployee = await prisma.employee.findUnique({
    where: { employeeCode: payload.employeeCode },
  });

  if (existingEmployee) {
    return res.status(400).json({ message: "Employee code already exists" });
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const employeeRole = await prisma.role.findUnique({
    where: { code: "EMPLOYEE" },
  });

  const result = await prisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({
      data: {
        employeeCode: payload.employeeCode,
        fullName: payload.fullName,
        email: payload.email,
        workingStatus: "Active",
      },
    });

    const account = await tx.userAccount.create({
      data: {
        employeeId: employee.id,
        email: payload.email,
        passwordHash,
        status: "ACTIVE",
      },
    });

    if (employeeRole) {
      await tx.userRole.create({
        data: {
          userId: account.id,
          roleId: employeeRole.id,
        },
      });
    }

    return { employee, account };
  });

  return res.status(201).json({
    message: "Registration successful",
    user: {
      email: result.account.email,
      fullName: result.employee.fullName,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  console.log(`[Auth Controller] Login endpoint called`);
  console.log(`[Auth Controller] Request body:`, JSON.stringify(req.body, null, 2));
  
  const payload = req.body;


  const query = `SELECT * FROM UserAccount WHERE email = '${payload.email}' LIMIT 1`;
  
  console.log(`[Auth Controller] Executing query:`, query);
  
  const accounts = await prisma.$queryRawUnsafe(query);
  const account = accounts[0];
  console.log(`[Auth Controller] Query result - found account:`, !!account);
  
  if (!account) {
    console.log(`[Auth Controller] Account not found for email`);
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const isMatch = await bcrypt.compare(payload.password, account.passwordHash);
  console.log(`[Auth Controller] Password match result:`, isMatch);
  if (!isMatch) {
    console.log(`[Auth Controller] Password mismatch`);
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  if (account.status !== "ACTIVE") {
    console.log(`[Auth Controller] Account status not ACTIVE:`, account.status);
    return res.status(403).json({ message: "Account is not active" });
  }

  console.log(`[Auth Controller] Validation passed, fetching full account info`);
  const fullAccountInfo = await prisma.userAccount.findUnique({
    where: { id: account.id },
    include: {
      employee: true,
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  });

  const permissions = [
    ...new Set(
      fullAccountInfo.roles.flatMap((item) =>
        item.role.permissions.map((p) => p.permission.key)
      )
    ),
  ];

  const token = signAccessToken({
    sub: account.id,
    employeeId: account.employeeId,
    roles: fullAccountInfo.roles.map((item) => item.role.code),
    permissions,
  });

  await prisma.userAccount.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() },
  });

  console.log(`[Auth Controller] Login successful for user: ${account.email}`);
  return res.json({
    message: "Login successful",
    token,
    user: {
      accountId: account.id,
      employeeId: account.employeeId,
      email: account.email,
      fullName: fullAccountInfo.employee.fullName,
      roleCodes: fullAccountInfo.roles.map((item) => item.role.code),
      permissions,
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const payload = forgotPasswordSchema.parse(req.body);
  const account = await prisma.userAccount.findFirst({
    where: {
      email: payload.email,
      employee: {
        employeeCode: payload.employeeCode,
      },
    },
    include: { employee: true },
  });

  if (!account) {
    return res.status(404).json({ message: "Account not found for provided information" });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.updateMany({
    where: { userId: account.id, status: "PENDING" },
    data: { status: "EXPIRED" },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: account.id,
      token,
      expiresAt,
    },
  });

  return res.json({
    message: "Password reset request created",
    resetToken: token,
    expiresAt,
    note: "In production, this token should be emailed instead of returned in the API response.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const payload = resetPasswordSchema.parse(req.body);

  const resetRequest = await prisma.passwordResetToken.findUnique({
    where: { token: payload.token },
    include: { user: true },
  });

  if (!resetRequest || resetRequest.status !== "PENDING" || resetRequest.expiresAt < new Date()) {
    return res.status(400).json({ message: "Reset token is invalid or expired" });
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, 10);

  await prisma.$transaction([
    prisma.userAccount.update({
      where: { id: resetRequest.userId },
      data: { passwordHash, status: "ACTIVE" },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRequest.id },
      data: { status: "USED" },
    }),
  ]);

  return res.json({ message: "Password updated successfully" });
});

const me = asyncHandler(async (req, res) => {
  const account = await prisma.userAccount.findUnique({
    where: { id: req.user.id },
    include: {
      employee: {
        include: {
          qualifications: true,
          skillDocuments: true,
          emergencyContacts: true,
        },
      },
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  return res.json({ data: account });
});

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  me,
};
