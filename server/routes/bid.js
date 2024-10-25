const express = require("express");
const router = express.Router();
const bidController = require("../controller/bidController")

router.use(express.json());

router.post("/", bidController.bidItem);

module.exports = router;
