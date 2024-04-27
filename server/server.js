// server.js
const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = 4000;

// Import middleware
const cors = require("cors");

// Import routes
const apiRoutes = require("./routes/api");
const sellerRoutes = require("./routes/seller");
const authRoutes = require("./routes/authRoutes");

// Socket.io setup
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:3000",
	},
});

// Middleware
app.use(cors());

// Routes
app.use("/api", apiRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/login", authRoutes);

// Socket.io events
require("./socket")(socketIO);

// Start server
http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
