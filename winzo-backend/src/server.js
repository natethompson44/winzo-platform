const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const initDatabase = require('./database/init');
const authRoutes = require('./routes/auth');

const app = express();

// Global security middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(limiter);
app.use(express.json());

// Initialize database connection
initDatabase();

// Application routes
app.use('/api/auth', authRoutes);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
