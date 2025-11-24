import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './utils/database.js';

// Import routes
import commandRoutes from './routes/commands.js';
import premiumRoutes from './routes/premium.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Isa Protocol V1 - Core Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/commands', commandRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/isa-protocol';
    await connectDatabase(mongoUri);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║     ISA PROTOCOL V1 - CORE SERVER    ║
╚══════════════════════════════════════╝

✅ Server running on port ${PORT}
✅ Environment: ${process.env.NODE_ENV || 'development'}
✅ Database connected
✅ API endpoints ready

📡 Health: http://localhost:${PORT}/health
📚 Commands: http://localhost:${PORT}/api/commands
💎 Premium: http://localhost:${PORT}/api/premium
🔧 Admin: http://localhost:${PORT}/api/admin
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
