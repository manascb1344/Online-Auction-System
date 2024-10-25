const express = require("express");
const addProductController = require("../controller/addProductController");

const router = express.Router();

router.post("/", addProductController.addProduct);

module.exports = router;
