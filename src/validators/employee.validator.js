const { z } = require("zod");

const employeeSchema = z.object({
  employeeCode: z.string().min(2),
  fullName: z.string().min(2),
  fullNameKana: z.string().optional().nullable(),
  email: z.email(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  hobby: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  workingStatus: z.string().optional().nullable(),
  selfPr: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

const qualificationSchema = z.object({
  title: z.string().min(2),
  issuer: z.string().optional().nullable(),
  acquiredDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

const employeeDocumentSchema = z.object({
  type: z.enum(["SKILL_SHEET", "CV", "CONTRACT", "DECISION", "OTHER"]).default("SKILL_SHEET"),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  note: z.string().optional().nullable(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2),
  relationship: z.string().min(1),
  address: z.string().min(2),
  phoneNumber: z.string().min(6),
});

module.exports = {
  employeeSchema,
  qualificationSchema,
  employeeDocumentSchema,
  emergencyContactSchema,
};
