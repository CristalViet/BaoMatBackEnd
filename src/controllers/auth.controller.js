const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");
const { signAccessToken } = require("../utils/jwt");
const {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/auth.validator");

const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const account = await prisma.userAccount.findUnique({
    where: { email: payload.email },
    include: {
      employee: true,
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

  if (!account) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const isMatch = await bcrypt.compare(payload.password, account.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  if (account.status !== "ACTIVE") {
    return res.status(403).json({ message: "Account is not active" });
  }

  const permissions = [
    ...new Set(
      account.roles.flatMap((item) =>
        item.role.permissions.map((permissionItem) => permissionItem.permission.key)
      )
    ),
  ];

  const token = signAccessToken({
    sub: account.id,
    employeeId: account.employeeId,
    roles: account.roles.map((item) => item.role.code),
    permissions,
  });

  await prisma.userAccount.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() },
  });

  return res.json({
    message: "Login successful",
    token,
    user: {
      accountId: account.id,
      employeeId: account.employeeId,
      email: account.email,
      fullName: account.employee.fullName,
      roleCodes: account.roles.map((item) => item.role.code),
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
  forgotPassword,
  resetPassword,
  me,
};
