const express = require("express");
const router = express.Router();
const apiController = require("../controller/apiController");

router.get("/", apiController.getItems);

module.exports = router;
