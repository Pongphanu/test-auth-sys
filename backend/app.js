// app.js - แยก Express app ออกจาก server
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

// สร้าง Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;