const express = require("express");
const controller = require("../controllers/employee.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize(["employees.read"]), controller.listEmployees);
router.get("/:id", authorize(["employees.read"]), controller.getEmployeeById);
router.post("/", authorize(["employees.create"]), controller.createEmployee);
router.patch("/:id", authorize(["employees.update"]), controller.updateEmployee);
router.post(
  "/:id/qualifications",
  authorize(["employees.qualifications.manage"]),
  controller.addQualification
);
router.post(
  "/:id/documents",
  authorize(["employees.documents.manage"]),
  controller.addSkillDocument
);
router.put(
  "/:id/emergency-contact",
  authorize(["employees.emergency.manage"]),
  controller.upsertEmergencyContact
);

module.exports = router;
