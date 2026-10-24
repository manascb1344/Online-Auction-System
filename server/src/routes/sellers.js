const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { sellerParams } = require("../validation/schemas");
const itemsController = require("../controllers/itemsController");

const router = express.Router();

router.get("/:sellerId/items", validate({ params: sellerParams }), asyncHandler(itemsController.listBySeller));

module.exports = router;
