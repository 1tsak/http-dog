const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');

dotenv.config();

const app = express();

// Simple and permissive CORS configuration for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Debug middleware to log CORS headers
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({ message: 'HTTP Dogs API is running', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working', cors: 'enabled' });
});

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 HTTP Dogs Server running on port ${PORT}`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🔄 CORS enabled for all origins`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop other services or use a different port.`);
      process.exit(1);
    }
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
