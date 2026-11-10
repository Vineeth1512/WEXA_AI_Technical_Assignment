const { Sequelize } = require('sequelize');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('CRITICAL: DATABASE_URL is missing in environment variables.');
}

// Detect if connecting to a cloud-hosted PostgreSQL database (Supabase, Render, Neon, etc.)
// Cloud databases require SSL connections, whereas local PostgreSQL instances usually do not.
const isCloudDatabase = 
  Boolean(connectionString && (
    connectionString.includes('supabase.co') || 
    connectionString.includes('render.com') || 
    connectionString.includes('neon.tech') ||
    process.env.NODE_ENV === 'production'
  ));

const sequelize = new Sequelize(connectionString || '', {
  dialect: 'postgres',
  // Log SQL queries in development so we can see exactly what Sequelize executes
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[SQL]: ${msg}`) : false,
  dialectOptions: isCloudDatabase ? {
    ssl: {
      require: true,
      rejectUnauthorized: false // Allows SSL handshake with cloud provider certificates
    }
  } : {},
  pool: {
    max: 5,         // Maximum connections in pool (keeps connection usage lean for free-tier databases)
    min: 0,         // Minimum connections
    acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000     // Maximum time (ms) that a connection can be idle before being released
  }
});

// Helper function to test database connectivity
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database connected successfully via Sequelize.');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
