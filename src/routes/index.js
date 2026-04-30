const express = require("express");
const authRoutes = require("./auth.routes");
const employeeRoutes = require("./employee.routes");
const accountRoutes = require("./account.routes");
const documentRoutes = require("./document.routes");
const contractRoutes = require("./contract.routes");
const payrollRoutes = require("./payroll.routes");

const router = express.Router();

console.log('[Routes] Registering all routes...');

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "hr-management-backend",
    timestamp: new Date().toISOString(),
  });
});

console.log('[Routes] Mounting /auth routes');
router.use("/auth", authRoutes);
console.log('[Routes] Mounting /employees routes');
router.use("/employees", employeeRoutes);
console.log('[Routes] Mounting /documents routes');
router.use("/documents", documentRoutes);
console.log('[Routes] Mounting /contracts routes');
router.use("/contracts", contractRoutes);
console.log('[Routes] Mounting /payrolls routes');
router.use("/payrolls", payrollRoutes);
console.log('[Routes] Mounting / (account) routes - WARNING: This has authenticate middleware on all routes');
router.use("/", accountRoutes);

module.exports = router;
