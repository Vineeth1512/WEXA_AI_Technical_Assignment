const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Robust Cross-Origin Resource Sharing (CORS) Configuration
// Automatically permits local development, any Vercel domain, and configured CLIENT_URL
app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // 2. Allow any localhost / 127.0.0.1 port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // 3. Automatically allow ALL Vercel domains (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Allow explicitly configured CLIENT_URL (stripped of any trailing slash)
    const configuredClient = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/$/, '') : null;
    if (configuredClient && origin === configuredClient) {
      return callback(null, true);
    }

    // 5. Default fallback: allow
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware: Parse incoming JSON requests
app.use(express.json());

// Middleware: Parse URL-encoded query/body data
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'StockFlow API is online and healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
