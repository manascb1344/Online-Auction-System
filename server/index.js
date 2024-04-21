const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const PORT = 4000;
const fs = require("fs");
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:3000",
	},
});
const mysql = require("mysql2"); // Import the mysql2 library

const connection = mysql.createConnection({
	host: "127.0.0.1", // Your MySQL host
	user: "root", // Your MySQL username
	password: "1m2m3m4m5m", // Your MySQL password
	database: "dbms", // Your MySQL database name
});

app.use(cors());

function findProduct(nameKey, myArray, last_bidder, amount) {
	console.log("Entering findProduct function...");
	for (let i = 0; i < myArray.length; i++) {
		if (myArray[i].name === nameKey) {
			console.log("Product found:", myArray[i]);
			myArray[i].last_bidder = last_bidder;
			myArray[i].price = amount;
		}
	}
	const stringData = JSON.stringify(objectData, null, 2);
	fs.writeFile("data.json", stringData, (err) => {
		if (err) {
			console.error("Error writing to file:", err);
		} else {
			console.log("Data written to data.json successfully");
		}
	});
}

socketIO.on("connection", (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);
	socket.on("disconnect", () => {
		console.log("🔥: A user disconnected");
	});

	socket.on("addProduct", (data) => {
		console.log("Received addProduct event:", data);
		objectData["products"].push(data);
		const stringData = JSON.stringify(objectData, null, 2);
		fs.writeFile("data.json", stringData, (err) => {
			if (err) {
				console.error("Error writing to file:", err);
			} else {
				console.log("Data written to data.json successfully");
			}
		});
		socket.broadcast.emit("addProductResponse", data);
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

// Route to fetch data from the MySQL database
app.get("/api", (req, res) => {
  console.log("Received API request");
  // Query to select all items from the items table with seller's details
  connection.query(
    "SELECT items.Item_ID, items.Item_Name, items.Description, items.Starting_Price, items.Auction_End_Time, items.Category, sellers.Username AS Seller_Username, sellers.Email AS Seller_Email, sellers.Address AS Seller_Address, sellers.Account_Balance AS Seller_Account_Balance FROM items JOIN sellers ON items.Seller_ID = sellers.Seller_ID",
    (err, results) => {
      if (err) {
        console.error("Error fetching items from database:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("Received results from database:", results);
        res.json({ items: results }); // Send the items as JSON response
      }
    }
  );
});



// Route to fetch seller's name based on seller ID
app.get("/api/seller/:id", (req, res) => {
	console.log("Received request to fetch seller by ID");
	const sellerId = req.params.id;
	// Query to select seller name from the sellers table based on seller ID
	connection.query(
		"SELECT name FROM sellers WHERE id = ?",
		[sellerId],
		(err, results) => {
			if (err) {
				console.error("Error fetching seller from database:", err);
				res.status(500).json({ error: "Internal Server Error" });
			} else {
				if (results.length === 0) {
					res.status(404).json({ error: "Seller not found" });
				} else {
					const sellerName = results[0].name;
					console.log(
						"Received seller name from database:",
						sellerName
					);
					res.json({ sellerName }); // Send the seller name as part of JSON response
				}
			}
		}
	);
});

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
