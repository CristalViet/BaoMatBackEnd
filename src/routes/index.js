const express = require("express");
const authRoutes = require("./auth.routes");
const employeeRoutes = require("./employee.routes");
const accountRoutes = require("./account.routes");
const documentRoutes = require("./document.routes");
const contractRoutes = require("./contract.routes");
const payrollRoutes = require("./payroll.routes");

const router = express.Router();



router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/documents", documentRoutes);
router.use("/contracts", contractRoutes);
router.use("/payrolls", payrollRoutes);
router.use("/", accountRoutes);

module.exports = router;
