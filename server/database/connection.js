const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'manufacturing_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test PostgreSQL database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    // Verify it's PostgreSQL
    const result = await client.query('SELECT version()');
    const pgVersion = result.rows[0].version;
    console.log('✅ PostgreSQL database connected successfully');
    console.log('📊 PostgreSQL Version:', pgVersion.split(',')[0]);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL database connection failed:', err.message);
    console.error('Make sure PostgreSQL is running and credentials are correct');
    return false;
  }
};

// Execute query with error handling
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

// Close all connections in the pool
const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool
};


