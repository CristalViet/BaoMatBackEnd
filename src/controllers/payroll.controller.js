const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");

// Get all payrolls for an employee
exports.getPayrolls = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const payrolls = await prisma.payroll.findMany({
    where: { employeeId },
    orderBy: { period: "desc" },
  });

  res.json({ data: payrolls });
});

// Create a new payroll
exports.createPayroll = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { period, basicSalary, allowances, deductions, netSalary, status, paymentDate } = req.body;

  if (!period || basicSalary === undefined || netSalary === undefined) {
    return res.status(400).json({ message: "Period, basicSalary, and netSalary are required" });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const payroll = await prisma.payroll.create({
    data: {
      employeeId,
      period,
      basicSalary: parseFloat(basicSalary),
      allowances: allowances ? parseFloat(allowances) : 0,
      deductions: deductions ? parseFloat(deductions) : 0,
      netSalary: parseFloat(netSalary),
      status: status || "DRAFT",
      paymentDate: paymentDate ? new Date(paymentDate) : null,
    },
  });

  res.status(201).json({ message: "Payroll created successfully", data: payroll });
});

// Update a payroll
exports.updatePayroll = asyncHandler(async (req, res) => {
  const { payrollId } = req.params;
  const { basicSalary, allowances, deductions, netSalary, status, paymentDate } = req.body;

  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  const updatedPayroll = await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      basicSalary: basicSalary !== undefined ? parseFloat(basicSalary) : payroll.basicSalary,
      allowances: allowances !== undefined ? parseFloat(allowances) : payroll.allowances,
      deductions: deductions !== undefined ? parseFloat(deductions) : payroll.deductions,
      netSalary: netSalary !== undefined ? parseFloat(netSalary) : payroll.netSalary,
      status: status || payroll.status,
      paymentDate: paymentDate ? new Date(paymentDate) : payroll.paymentDate,
    },
  });

  res.json({ message: "Payroll updated successfully", data: updatedPayroll });
});

// Delete a payroll
exports.deletePayroll = asyncHandler(async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  await prisma.payroll.delete({
    where: { id: payrollId },
  });

  res.json({ message: "Payroll deleted successfully" });
});
