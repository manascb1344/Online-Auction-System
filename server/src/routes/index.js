const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/items", require("./items"));
router.use("/sellers", require("./sellers"));
router.use("/me", require("./me"));
router.use("/admin", require("./admin"));

module.exports = router;
