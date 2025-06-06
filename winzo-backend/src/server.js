const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const initDatabase = require('./database/init');
const authRoutes = require('./routes/auth');

const app = express();

// Global security middleware
app.use(helmet());
app.use(cors());
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
