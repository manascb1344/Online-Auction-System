module.exports = (socketIO) => {
	socketIO.on("connection", (socket) => {
		console.log(`⚡: ${socket.id} user just connected!`);
		socket.on("disconnect", () => {
			console.log("🔥: A user disconnected");
		});

		socket.on("addProduct", (data) => {
			console.log("Received addProduct event:", data);
			const { name, price, owner } = data;

			connection.query(
				"INSERT INTO items (Item_Name, Starting_Price, Seller_ID) VALUES (?, ?, (SELECT Seller_ID FROM sellers WHERE Username = ?))",
				[name, price, owner],
				(err, results) => {
					if (err) {
						console.error("Error adding a new product:", err);
						socket.emit("addProductResponse", {
							success: false,
							message: "Failed to add product",
						});
					} else {
						console.log("New product added successfully");
						socket.emit("addProductResponse", {
							success: true,
							message: "Product added successfully",
						});
					}
				}
			);
		});

		socket.on("bidProduct", (data) => {
			console.log("Received bidProduct event:", data);
			findProduct(
				data.name,
				objectData["products"],
				data.last_bidder,
				data.amount
			);
			socket.broadcast.emit("bidProductResponse", data);
		});
	});
};
