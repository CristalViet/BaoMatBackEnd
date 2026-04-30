const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");

// Get all contracts for an employee
exports.getContracts = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const contracts = await prisma.contract.findMany({
    where: { employeeId },
    orderBy: { startDate: "desc" },
  });

  res.json({ data: contracts });
});

// Create a new contract
exports.createContract = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { contractNumber, type, startDate, endDate, baseSalary, status, fileUrl } = req.body;

  if (!contractNumber || !type || !startDate) {
    return res.status(400).json({ message: "Contract Number, Type, and Start Date are required" });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const existingContract = await prisma.contract.findUnique({
    where: { contractNumber },
  });

  if (existingContract) {
    return res.status(400).json({ message: "Contract number already exists" });
  }

  const contract = await prisma.contract.create({
    data: {
      employeeId,
      contractNumber,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      baseSalary: baseSalary ? parseFloat(baseSalary) : null,
      status: status || "ACTIVE",
      fileUrl,
    },
  });

  res.status(201).json({ message: "Contract created successfully", data: contract });
});

// Update a contract
exports.updateContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const { type, startDate, endDate, baseSalary, status, fileUrl } = req.body;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    return res.status(404).json({ message: "Contract not found" });
  }

  const updatedContract = await prisma.contract.update({
    where: { id: contractId },
    data: {
      type: type || contract.type,
      startDate: startDate ? new Date(startDate) : contract.startDate,
      endDate: endDate ? new Date(endDate) : contract.endDate,
      baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : contract.baseSalary,
      status: status || contract.status,
      fileUrl: fileUrl !== undefined ? fileUrl : contract.fileUrl,
    },
  });

  res.json({ message: "Contract updated successfully", data: updatedContract });
});

// Delete a contract
exports.deleteContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    return res.status(404).json({ message: "Contract not found" });
  }

  await prisma.contract.delete({
    where: { id: contractId },
  });

  res.json({ message: "Contract deleted successfully" });
});
