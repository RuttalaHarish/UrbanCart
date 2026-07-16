const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware configuration
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes registration
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UrbanCart Backend Running'
  });
});

module.exports = app;
