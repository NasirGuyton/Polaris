const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: parseInt(process.env.DB_POOL_MAX) || 10,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
    });

pool.on("error", (err) => {
  console.error("Unexpected idle client error:", err.message);
});

module.exports = pool;
