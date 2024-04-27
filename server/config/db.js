// config/db.js
const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "1m2m3m4m5m",
	database: "dbms",
});

module.exports = connection;
