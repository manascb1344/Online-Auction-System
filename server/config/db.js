const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'auction_user',
    password: process.env.DB_PASSWORD || 'auction_password',
    database: process.env.DB_NAME || 'auction_system',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

pool.getConnection()
    .then(connection => {
        console.log("Connected to MySQL database successfully");
        connection.release();
    })
    .catch(err => {
        console.error("Error connecting to database:", err.message);
    });

const dbWrapper = {
    query: async (sql, params) => {
        const [rows] = await pool.execute(sql, params);
        return { rows };
    }
};

module.exports = dbWrapper;