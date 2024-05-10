// server.js
const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = 4000;

// Import middleware
const cors = require("cors");
const bodyParser = require("body-parser");

// Import routes
const apiRoutes = require("./routes/api");
const sellerRoutes = require("./routes/seller");
const authRoutes = require("./routes/authRoutes");
const bidRoute = require("./routes/bid");
const addProdRoute = require("./routes/addProduct");
const getProductsBySeller = require("./routes/sellerProductRoute");
const auctionsRoute = require("./routes/auctions");
const transactionsRoute = require("./routes/transactions");
const bidsRoute = require("./routes/bids");
const buyerProfileRoute = require("./routes/buyerProfile");

// Socket.io setup
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:3000",
	},
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", apiRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/login", authRoutes);
app.use("/api/bid", bidRoute);
app.use("/api/addProduct", addProdRoute);
app.use("/api/seller/products", getProductsBySeller);
app.use("/api/auctions", auctionsRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/placedbids", bidsRoute);
app.use("/api", buyerProfileRoute);

// Socket.io events
require("./socket")(socketIO);

// Start server
http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
