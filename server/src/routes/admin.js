const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { adminListQuery } = require("../validation/schemas");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/auctions", asyncHandler(adminController.listAuctions));
router.get("/bids", validate({ query: adminListQuery }), asyncHandler(adminController.listBids));
router.get("/transactions", asyncHandler(adminController.listTransactions));
router.get("/stats", asyncHandler(adminController.summary));

module.exports = router;
