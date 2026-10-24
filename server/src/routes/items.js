const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { idParams, itemListQuery, createItemBody, bidBody } = require("../validation/schemas");
const itemsController = require("../controllers/itemsController");
const bidsController = require("../controllers/bidsController");

const router = express.Router();

router.get("/", validate({ query: itemListQuery }), asyncHandler(itemsController.list));
router.get("/mine", requireAuth, requireRole("seller"), asyncHandler(itemsController.listMine));
router.post(
  "/",
  requireAuth,
  requireRole("seller"),
  validate({ body: createItemBody }),
  asyncHandler(itemsController.create),
);
router.get("/:id", validate({ params: idParams }), asyncHandler(itemsController.getById));
router.get("/:id/bids", validate({ params: idParams }), asyncHandler(bidsController.listForItem));
router.post(
  "/:id/bids",
  requireAuth,
  requireRole("buyer"),
  validate({ params: idParams, body: bidBody }),
  asyncHandler(bidsController.place),
);

module.exports = router;
