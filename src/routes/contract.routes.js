const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const contractController = require("../controllers/contract.controller");

const router = express.Router();

router.use(authenticate);

// HR and Admin can manage contracts
router.get("/:employeeId", authorize(["employees.read"]), contractController.getContracts);
router.post("/:employeeId", authorize(["employees.contracts.manage"]), contractController.createContract);
router.put("/:contractId", authorize(["employees.contracts.manage"]), contractController.updateContract);
router.delete("/:contractId", authorize(["employees.contracts.manage"]), contractController.deleteContract);

module.exports = router;
