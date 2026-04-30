const express = require("express");
const controller = require("../controllers/account.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

console.log('[AccountRoutes] account.routes.js loaded - applying authenticate middleware to ALL routes in this file');
router.use(authenticate);

router.get("/accounts", authorize(["accounts.read"]), controller.listAccounts);
router.post("/accounts", authorize(["accounts.manage"]), controller.createAccount);
router.patch("/accounts/:id", authorize(["accounts.manage"]), controller.updateAccount);

router.get("/permissions", authorize(["roles.read"]), controller.listPermissions);
router.post("/permissions/bootstrap", authorize(["roles.manage"]), controller.bootstrapPermissions);

router.get("/roles", authorize(["roles.read"]), controller.listRoles);
router.post("/roles", authorize(["roles.manage"]), controller.createRole);

module.exports = router;
