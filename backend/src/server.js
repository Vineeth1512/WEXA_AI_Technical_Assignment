require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test database connection on startup
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 StockFlow Backend running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌱 Environment:  ${process.env.NODE_ENV || 'development'}`);
    console.log(`=========================================`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
    });
  });
};

startServer();
