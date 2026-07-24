const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

/* ===========================
   Middleware Configuration
=========================== */

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',

      // Vercel Production Domains
      'https://urban-cart-beige.vercel.app',
      'https://urban-cart-8pix5q7b0-ruttala-harish.vercel.app',
      'https://urban-cart-git-main-ruttala-harish.vercel.app'
    ],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());

/* ===========================
   API Routes
=========================== */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

/* ===========================
   Health Check
=========================== */

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UrbanCart Backend Running',
  });
});

module.exports = app;