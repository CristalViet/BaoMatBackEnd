const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const documentController = require("../controllers/document.controller");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(authenticate);

// HR and Admin can manage documents
router.get("/:employeeId", authorize(["employees.read"]), documentController.getDocuments);
router.post("/:employeeId", authorize(["employees.documents.manage"]), upload.single("file"), documentController.uploadDocument);
router.put("/:documentId", authorize(["employees.documents.manage"]), documentController.updateDocument);
router.delete("/:documentId", authorize(["employees.documents.manage"]), documentController.deleteDocument);

module.exports = router;
