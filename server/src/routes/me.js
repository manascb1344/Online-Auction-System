const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");
const meController = require("../controllers/meController");

const router = express.Router();

router.use(requireAuth, requireRole("buyer"));
router.get("/bids", asyncHandler(meController.myBids));
router.get("/transactions", asyncHandler(meController.myTransactions));

module.exports = router;
