const express = require("express");
const authRoutes = require("./auth.routes");
const employeeRoutes = require("./employee.routes");
const accountRoutes = require("./account.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "hr-management-backend",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/", accountRoutes);

module.exports = router;
