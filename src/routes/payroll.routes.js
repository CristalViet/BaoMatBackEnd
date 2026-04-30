const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const payrollController = require("../controllers/payroll.controller");

const router = express.Router();

router.use(authenticate);

// HR and Admin can manage payrolls
router.get("/:employeeId", authorize(["employees.read"]), payrollController.getPayrolls);
router.post("/:employeeId", authorize(["employees.payrolls.manage"]), payrollController.createPayroll);
router.put("/:payrollId", authorize(["employees.payrolls.manage"]), payrollController.updatePayroll);
router.delete("/:payrollId", authorize(["employees.payrolls.manage"]), payrollController.deletePayroll);

module.exports = router;
