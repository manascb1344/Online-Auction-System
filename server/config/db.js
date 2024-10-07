const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "127.0.0.1",  // or "localhost"
    user: "root",
    password: "1m2m3m4m5m",
    database: "dbms",
    port: 3306  // Ensure this is correct
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting: ", err.stack);
        return;
    }
    console.log("Connected as id " + connection.threadId);
});

connection.end();
