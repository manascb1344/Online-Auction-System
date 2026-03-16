const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.use(express.json());

router.post("/", authController.login);

module.exports = router;
