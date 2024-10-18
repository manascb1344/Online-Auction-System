// utils/asyncHandler.js
const asyncHandler =
  (fn, errorMessage = "Internal server error") =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error(`Error: ${error.message}`);
      res.status(500).json({ error: errorMessage });
    });

module.exports = asyncHandler;
