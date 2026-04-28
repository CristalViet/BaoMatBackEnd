const { z } = require("zod");

const createAccountSchema = z.object({
  employeeId: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "LOCKED"]).default("ACTIVE"),
  roleCodes: z.array(z.string().min(1)).min(1),
});

const updateAccountRolesSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "LOCKED"]).optional(),
  roleCodes: z.array(z.string().min(1)).min(1).optional(),
});

const createRoleSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  permissionKeys: z.array(z.string().min(1)).default([]),
});

module.exports = {
  createAccountSchema,
  updateAccountRolesSchema,
  createRoleSchema,
};
