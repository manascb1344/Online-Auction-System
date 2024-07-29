// // config/db.js
// const mysql = require("mysql2");

// const connection = mysql.createConnection({
// 	host: "127.0.0.1",
// 	user: "root",
// 	password: "1",
// 	database: "dbms",
// });

// module.exports = connection;

const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "auction-system-v2-with-data-v2.onrender.com", // Updated host URL
	port: process.env.DB_PORT || 3306, 
	user: process.env.DB_USER,       
	password: process.env.DB_PASS,   
	database: process.env.DB_NAME,   
});

module.exports = connection;
