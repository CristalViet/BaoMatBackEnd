const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");
const {
  createAccountSchema,
  updateAccountRolesSchema,
  createRoleSchema,
} = require("../validators/account.validator");
const { APP_PERMISSIONS } = require("../utils/permissions");

const listAccounts = asyncHandler(async (req, res) => {
  const items = await prisma.userAccount.findMany({
    include: {
      employee: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ data: items });
});

const createAccount = asyncHandler(async (req, res) => {
  const payload = createAccountSchema.parse(req.body);
  const roleRecords = await prisma.role.findMany({
    where: { code: { in: payload.roleCodes } },
  });

  if (roleRecords.length !== payload.roleCodes.length) {
    return res.status(400).json({ message: "One or more roles do not exist" });
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const account = await prisma.userAccount.create({
    data: {
      employeeId: payload.employeeId,
      email: payload.email,
      passwordHash,
      status: payload.status,
      roles: {
        create: roleRecords.map((role) => ({
          roleId: role.id,
        })),
      },
    },
    include: {
      roles: {
        include: { role: true },
      },
      employee: true,
    },
  });

  return res.status(201).json({ message: "Account created", data: account });
});

const updateAccount = asyncHandler(async (req, res) => {
  const payload = updateAccountRolesSchema.parse(req.body);
  let roleRecords = [];

  if (payload.roleCodes?.length) {
    roleRecords = await prisma.role.findMany({
      where: { code: { in: payload.roleCodes } },
    });

    if (roleRecords.length !== payload.roleCodes.length) {
      return res.status(400).json({ message: "One or more roles do not exist" });
    }
  }

  const account = await prisma.$transaction(async (tx) => {
    if (payload.roleCodes?.length) {
      await tx.userRole.deleteMany({
        where: { userId: req.params.id },
      });
    }

    return tx.userAccount.update({
      where: { id: req.params.id },
      data: {
        status: payload.status,
        roles: payload.roleCodes?.length
          ? {
              create: roleRecords.map((role) => ({
                roleId: role.id,
              })),
            }
          : undefined,
      },
      include: {
        employee: true,
        roles: {
          include: { role: true },
        },
      },
    });
  });

  return res.json({ message: "Account updated", data: account });
});

const listPermissions = asyncHandler(async (req, res) => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });

  return res.json({ data: permissions });
});

const listRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
      users: true,
    },
  });

  return res.json({ data: roles });
});

const createRole = asyncHandler(async (req, res) => {
  const payload = createRoleSchema.parse(req.body);
  const permissions = await prisma.permission.findMany({
    where: { key: { in: payload.permissionKeys } },
  });

  if (permissions.length !== payload.permissionKeys.length) {
    return res.status(400).json({ message: "One or more permissions do not exist" });
  }

  const role = await prisma.role.create({
    data: {
      code: payload.code,
      name: payload.name,
      description: payload.description,
      permissions: {
        create: permissions.map((permission) => ({
          permissionId: permission.id,
        })),
      },
    },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  return res.status(201).json({ message: "Role created", data: role });
});

const bootstrapPermissions = asyncHandler(async (req, res) => {
  const results = [];

  for (const item of APP_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { key: item.key },
      update: {
        name: item.name,
        group: item.group,
        description: item.description || null,
      },
      create: item,
    });
    results.push(permission);
  }

  return res.json({ message: "Permissions synchronized", data: results });
});

module.exports = {
  listAccounts,
  createAccount,
  updateAccount,
  listPermissions,
  listRoles,
  createRole,
  bootstrapPermissions,
};
