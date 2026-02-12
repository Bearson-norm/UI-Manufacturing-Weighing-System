const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./database/connection');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const uomRoutes = require('./routes/uom');
const skuRoutes = require('./routes/sku');
const bomRoutes = require('./routes/bom');
const moRoutes = require('./routes/manufacturing-order');
const consumptionRoutes = require('./routes/consumption');
const scaleRoutes = require('./routes/scale');

const app = express();
const PORT = process.env.PORT || 6657;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Manufacturing Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/uom', uomRoutes);
app.use('/api/sku', skuRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/manufacturing-order', moRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/scale', scaleRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. Running in limited mode (scale functionality only).');
      console.warn('   To enable full functionality, please set up PostgreSQL database.');
    } else {
      console.log('✅ Database connected successfully');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Manufacturing Dashboard API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      if (!dbConnected) {
        console.log(`⚖️  Scale API available at: http://localhost:${PORT}/api/scale`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;
