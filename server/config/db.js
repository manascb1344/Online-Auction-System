const { Client } = require("pg");

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Connect to the database
client.connect((err) => {
    if (err) {
        console.error("Error connecting: ", err.stack);
    } else {
        console.log("Connected successfully");
    }
});

// Export the client for use in other files
module.exports = client;
