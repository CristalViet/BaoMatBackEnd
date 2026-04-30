const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");
const {
  employeeSchema,
  qualificationSchema,
  employeeDocumentSchema,
  emergencyContactSchema,
} = require("../validators/employee.validator");

function normalizeDate(value) {
  return value ? new Date(value) : null;
}

const listEmployees = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  const search = req.query.search || "";
  const department = req.query.department;
  const month = req.query.month;
  const sortBy = req.query.sortBy || "fullName";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  const where = {
    AND: [
      search
        ? {
            OR: [
              { fullName: { contains: search } },
              { email: { contains: search } },
              { employeeCode: { contains: search } },
            ],
          }
        : {},
      department ? { department } : {},
      month
        ? {
            joinDate: {
              gte: new Date(`${new Date().getFullYear()}-${String(month).padStart(2, "0")}-01`),
              lt: new Date(`${new Date().getFullYear()}-${String(Number(month) + 1).padStart(2, "0")}-01`),
            },
          }
        : {},
    ],
  };

  const [total, items] = await prisma.$transaction([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        account: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
      },
    }),
  ]);

  return res.json({
    data: items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: {
      account: {
        include: {
          roles: {
            include: { role: true },
          },
        },
      },
      qualifications: true,
      skillDocuments: true,
      emergencyContacts: true,
      contracts: true,
      payrolls: true,
    },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  return res.json({ data: employee });
});

const createEmployee = asyncHandler(async (req, res) => {
  const payload = employeeSchema.parse(req.body);
  const employee = await prisma.employee.create({
    data: {
      ...payload,
      birthDate: normalizeDate(payload.birthDate),
      joinDate: normalizeDate(payload.joinDate),
    },
  });

  return res.status(201).json({ message: "Employee created", data: employee });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const payload = employeeSchema.partial().parse(req.body);
  const employee = await prisma.employee.update({
    where: { id: req.params.id },
    data: {
      ...payload,
      birthDate:
        payload.birthDate === undefined ? undefined : normalizeDate(payload.birthDate),
      joinDate: payload.joinDate === undefined ? undefined : normalizeDate(payload.joinDate),
    },
  });

  return res.json({ message: "Employee updated", data: employee });
});

const addQualification = asyncHandler(async (req, res) => {
  const payload = qualificationSchema.parse(req.body);
  const qualification = await prisma.qualification.create({
    data: {
      employeeId: req.params.id,
      title: payload.title,
      issuer: payload.issuer,
      acquiredDate: normalizeDate(payload.acquiredDate),
      expiryDate: normalizeDate(payload.expiryDate),
      note: payload.note,
    },
  });

  return res.status(201).json({ message: "Qualification added", data: qualification });
});

const addSkillDocument = asyncHandler(async (req, res) => {
  const payload = employeeDocumentSchema.parse(req.body);
  const document = await prisma.employeeDocument.create({
    data: {
      employeeId: req.params.id,
      type: payload.type,
      fileName: payload.fileName,
      fileUrl: payload.fileUrl,
      note: payload.note,
    },
  });

  return res.status(201).json({ message: "Document added", data: document });
});

const upsertEmergencyContact = asyncHandler(async (req, res) => {
  const payload = emergencyContactSchema.parse(req.body);
  const existing = await prisma.emergencyContact.findFirst({
    where: { employeeId: req.params.id },
  });

  const data = existing
    ? await prisma.emergencyContact.update({
        where: { id: existing.id },
        data: payload,
      })
    : await prisma.emergencyContact.create({
        data: { employeeId: req.params.id, ...payload },
      });

  return res.json({ message: "Emergency contact saved", data });
});

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  addQualification,
  addSkillDocument,
  upsertEmergencyContact,
};
