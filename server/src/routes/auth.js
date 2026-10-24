const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { registerBody, loginBody } = require("../validation/schemas");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", validate({ body: registerBody }), asyncHandler(authController.register));
router.post("/login", validate({ body: loginBody }), asyncHandler(authController.login));
router.get("/me", requireAuth, asyncHandler(authController.me));

module.exports = router;
