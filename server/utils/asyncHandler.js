// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  });

module.exports = asyncHandler;
