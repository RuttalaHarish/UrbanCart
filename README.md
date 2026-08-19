# 🛒 UrbanCart — Full-Stack E-Commerce Platform

> A production-ready MERN stack e-commerce application with a complete customer shopping experience, Razorpay payment integration, and a full admin management panel.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture & Data Flow](#architecture--data-flow)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

**UrbanCart** is a fully functional e-commerce web application built with the **MERN Stack** (MongoDB, Express, React, Node.js). It allows customers to browse products, manage a cart and wishlist, place orders via COD or Razorpay, and track their order history — all from a responsive, modern UI.

The platform includes a dedicated **Admin Panel** to manage products, categories, orders, and view real-time business analytics from a dashboard with charts.

---

## Live Demo

| Service  | URL |
|----------|-----|
| **Frontend** | [https://urban-cart-beige.vercel.app](https://urban-cart-beige.vercel.app) |
| **Backend API** | Deployed on Render / Railway |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP API communication |
| **React Context API** | Global state (Auth, Cart, Wishlist) |
| **Recharts** | Admin dashboard charts |
| **React Icons** | Icon library |
| **React Toastify** | Toast notifications |
| **Vanilla CSS** | All styling (no Tailwind) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JSON Web Tokens (JWT)** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **Razorpay SDK** | Payment gateway integration |
| **Morgan** | HTTP request logging |
| **CORS** | Cross-origin resource sharing |
| **Nodemon** | Development auto-reload |

---

## Features

### 👤 Customer Features
- **User Registration & Login** — JWT-based authentication with session persistence via `localStorage`
- **Browse Shop** — Product listing with search, filter by category, and sort options
- **Product Details** — Full product page with images, description, price, brand, stock status
- **Categories Page** — Browse products by category
- **Shopping Cart** — Add, remove, update quantities; persists per user via backend
- **Wishlist** — Save products for later; synced to backend
- **Checkout** — Full checkout flow with shipping address form
- **Payment** — Two options:
  - **COD (Cash on Delivery)**
  - **Razorpay** — Online payment with order verification
- **My Orders** — View all past orders with status tracking
- **Order Details** — Detailed per-order view with item breakdown, shipping info, and payment status
- **Order Cancellation** — Cancel pending orders
- **Profile Management** — Update name, email, phone, and address
- **About & Contact Pages** — Static informational pages

### 🛠️ Admin Features
- **Admin Dashboard** — Real-time business stats: total revenue, orders, users, products; charts for revenue, order status distribution
- **Product Management** — Add, edit, delete products with image URLs, category, brand, price, and stock
- **Category Management** — Manage product categories from admin panel
- **Order Management** — View all customer orders, update order status (Pending → Processing → Shipped → Delivered)
- **Admin Order Details** — Full per-order view with customer and payment information
- **Role-Based Access Control** — Admin routes are protected; regular users cannot access admin pages

### 🔒 Security
- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens required on all protected routes
- Admin middleware validates both authentication AND admin role
- CORS configured for specific trusted origins only

---

## Project Structure

```
UrbanCart/
├── frontend/                        # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with base URL
│   │   ├── assets/                  # Static assets (images, logos)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar/          # Main site navigation
│   │   │   │   ├── Footer/          # Site footer
│   │   │   │   ├── BottomNav/       # Mobile bottom navigation bar
│   │   │   │   └── AdminNavbar/     # Admin panel sidebar/navbar
│   │   │   ├── home/
│   │   │   │   ├── Hero/            # Homepage hero banner
│   │   │   │   ├── Categories/      # Homepage category cards
│   │   │   │   └── FeaturedProducts/# Featured product section
│   │   │   ├── cart/                # Cart UI components
│   │   │   ├── product/             # Product card, grid components
│   │   │   ├── wishlist/            # Wishlist UI components
│   │   │   ├── common/              # Shared/reusable components
│   │   │   ├── ui/                  # Generic UI primitives (buttons, modals)
│   │   │   ├── CategoryNav.jsx      # Category filter navigation
│   │   │   └── OrderDetailsModal.jsx# Reusable order modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state: user, token, login/logout
│   │   │   ├── CartContext.jsx      # Cart state: items, add/remove/clear
│   │   │   └── WishlistContext.jsx  # Wishlist state: items, add/remove
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx       # Customer layout (Navbar + Footer)
│   │   │   └── AdminLayout.jsx      # Admin layout (AdminNavbar + content)
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Homepage
│   │   │   ├── Shop.jsx             # All products with filters
│   │   │   ├── ProductDetails.jsx   # Single product page
│   │   │   ├── Categories.jsx       # Browse by category
│   │   │   ├── Cart.jsx             # Shopping cart
│   │   │   ├── Wishlist.jsx         # Saved products
│   │   │   ├── Checkout.jsx         # Checkout + payment
│   │   │   ├── MyOrders.jsx         # Customer order history
│   │   │   ├── OrderDetails.jsx     # Single order detail view
│   │   │   ├── Profile.jsx          # User profile editor
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── About.jsx            # About page
│   │   │   ├── Contact.jsx          # Contact page
│   │   │   ├── AdminDashboard.jsx   # Admin analytics dashboard
│   │   │   ├── AdminOrders.jsx      # Admin: all orders table
│   │   │   ├── AdminOrderDetails.jsx# Admin: single order detail
│   │   │   ├── AdminProducts.jsx    # Admin: product listing
│   │   │   ├── AdminAddProduct.jsx  # Admin: add/edit product form
│   │   │   └── NotFound.jsx         # 404 page
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx        # All route definitions
│   │   │   ├── AppRouter.jsx        # Router wrapper with providers
│   │   │   ├── ProtectedRoute.jsx   # Guards authenticated pages
│   │   │   └── AdminRoute.jsx       # Guards admin-only pages
│   │   ├── constants/               # API endpoint constants
│   │   ├── services/                # API service functions
│   │   ├── styles/                  # Global CSS variables/tokens
│   │   ├── utils/                   # Helper/utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                  # Vercel SPA routing config
│   └── package.json
│
└── backend/                         # Node.js + Express REST API
    ├── seeds/
    │   └── seedProducts.js          # Seed script for sample products
    ├── src/
    │   ├── config/                  # DB connection config
    │   ├── controllers/
    │   │   ├── authController.js    # Register, Login
    │   │   ├── userController.js    # Get/Update profile
    │   │   ├── productController.js # CRUD products
    │   │   ├── categoryController.js# CRUD categories
    │   │   ├── cartController.js    # Cart operations
    │   │   ├── wishlistController.js# Wishlist operations
    │   │   ├── orderController.js   # Orders + dashboard stats
    │   │   └── paymentController.js # Razorpay order creation & verification
    │   ├── middleware/
    │   │   └── authMiddleware.js    # protect() + admin() middleware
    │   ├── models/
    │   │   ├── User.js              # User schema
    │   │   ├── Product.js           # Product schema
    │   │   ├── Category.js          # Category schema
    │   │   ├── Cart.js              # Cart schema
    │   │   ├── Wishlist.js          # Wishlist schema
    │   │   └── Order.js             # Order schema with payment fields
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── userRoutes.js
    │   │   ├── productRoutes.js
    │   │   ├── categoryRoutes.js
    │   │   ├── cartRoutes.js
    │   │   ├── wishlistRoutes.js
    │   │   ├── orderRoutes.js
    │   │   └── paymentRoutes.js
    │   ├── services/                # Business logic services
    │   ├── utils/                   # Utility helpers
    │   ├── app.js                   # Express app setup + middleware
    │   └── server.js                # DB connect + server start
    ├── .env.example
    ├── resetAdminPassword.js        # Utility script to reset admin password
    └── package.json
```

---

## Architecture & Data Flow

```
Browser (React + Vite)
        │
        │  HTTP Requests (Axios)
        ▼
Express REST API (Node.js)
        │
        ├── authMiddleware (JWT verify + role check)
        │
        ├── Controllers (business logic)
        │
        ▼
MongoDB (via Mongoose)
```

**State Management:**
- **Auth state** → `AuthContext` (user, token stored in `localStorage`)
- **Cart state** → `CartContext` (synced with backend per user)
- **Wishlist state** → `WishlistContext` (synced with backend per user)

**Payment Flow (Razorpay):**
1. Customer clicks "Pay Online" → Frontend calls `/api/payments/create-order`
2. Backend creates Razorpay order → returns `orderId + amount`
3. Razorpay checkout widget opens in browser
4. Customer completes payment → Razorpay calls success callback with `paymentId + signature`
5. Frontend calls `/api/payments/verify` → Backend verifies HMAC signature
6. On success → order is saved with `paymentStatus: Paid`

---

## Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Hashed with bcrypt |
| `phone` | String | Optional |
| `address` | String | Optional |
| `role` | String | `customer` or `admin` |

### Product
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | >= 0 |
| `category` | String | Required |
| `brand` | String | Required |
| `stock` | Number | >= 0 |
| `images` | [String] | Array of image URLs |
| `createdBy` | ObjectId | Ref to User (admin) |

### Order
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Ref to User |
| `items` | [OrderItem] | At least 1 required |
| `totalAmount` | Number | >= 0 |
| `shippingAddress` | Object | fullName, phone, address, city, state, postalCode, country |
| `orderStatus` | String | `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled` |
| `paymentStatus` | String | `Pending`, `Paid`, `Failed` |
| `paymentMethod` | String | `COD` or `RAZORPAY` |
| `razorpayOrderId` | String | Set if Razorpay used |
| `razorpayPaymentId` | String | Set after payment |
| `razorpaySignature` | String | For HMAC verification |

### Cart
- Belongs to one User
- Contains array of `{ product: ObjectId, quantity: Number }`

### Wishlist
- Belongs to one User
- Contains array of product ObjectIds

### Category
- Name-based category document managed by admin

---

## API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login, returns JWT token |

### Users — `/api/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | Protected | Get logged-in user profile |
| PUT | `/profile` | Protected | Update profile (name, phone, address) |

### Products — `/api/products`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all products |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Admin | Create a product |
| PUT | `/:id` | Admin | Update a product |
| DELETE | `/:id` | Admin | Delete a product |

### Categories — `/api/categories`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all categories |
| POST | `/` | Admin | Create a category |
| PUT | `/:id` | Admin | Update a category |
| DELETE | `/:id` | Admin | Delete a category |

### Cart — `/api/cart`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Protected | Get user's cart |
| POST | `/` | Protected | Add item to cart |
| PUT | `/:productId` | Protected | Update item quantity |
| DELETE | `/:productId` | Protected | Remove item from cart |
| DELETE | `/` | Protected | Clear entire cart |

### Wishlist — `/api/wishlist`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Protected | Get user's wishlist |
| POST | `/` | Protected | Add product to wishlist |
| DELETE | `/:productId` | Protected | Remove from wishlist |

### Orders — `/api/orders`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Protected | Get logged-in user's orders |
| POST | `/` | Protected | Create a new order |
| GET | `/all` | Admin | Get all orders |
| GET | `/dashboard/stats` | Admin | Get dashboard statistics |
| GET | `/:id` | Protected | Get single order by ID |
| PUT | `/:id/status` | Admin | Update order status |
| PUT | `/:id/cancel` | Protected | Cancel an order |
| DELETE | `/:id` | Admin | Delete an order |

### Payments — `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create-order` | Protected | Create Razorpay order |
| POST | `/verify` | Protected | Verify Razorpay payment signature |

---

## Frontend Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/shop` | Shop (all products) | Public |
| `/products/:id` | Product Details | Public |
| `/categories` | Categories | Public |
| `/cart` | Shopping Cart | Public |
| `/wishlist` | Wishlist | Public |
| `/about` | About | Public |
| `/contact` | Contact | Public |
| `/checkout` | Checkout + Payment | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/profile` | User Profile | Protected |
| `/my-orders` | My Orders | Protected |
| `/orders/:id` | Order Details | Protected |
| `/admin/dashboard` | Admin Dashboard | Admin Only |
| `/admin/orders` | Admin Orders List | Admin Only |
| `/admin/orders/:id` | Admin Order Detail | Admin Only |
| `/admin/products` | Admin Products List | Admin Only |
| `/admin/products/add` | Add Product | Admin Only |
| `/admin/products/:id/edit` | Edit Product | Admin Only |

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/urbancart
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> Never commit `.env` files to version control. Use `.env.example` as a template.

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local or Atlas cloud cluster)
- **Razorpay** account (for payment testing)

---

### 1. Clone the Repository

```bash
git clone https://github.com/RuttalaHarish/UrbanCart.git
cd UrbanCart
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

Backend runs on: `http://localhost:5000`

**Seed sample products (optional):**
```bash
npm run seed:products
```

**Reset admin password (if needed):**
```bash
node resetAdminPassword.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
# Create .env file and add your values
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Deployment

### Frontend — Vercel

The frontend is deployed on **Vercel** with SPA routing configured via `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Deploy steps:**
```bash
cd frontend
npm run build
# Deploy dist/ folder via Vercel CLI or GitHub integration
```

### Backend — Render / Railway

- Set all environment variables in the hosting dashboard
- Entry point: `src/server.js`
- Start command: `node src/server.js`

---

## Author

**Ruttala Harish**
- GitHub: [@RuttalaHarish](https://github.com/RuttalaHarish)

---

> Built from scratch as a full-stack portfolio project demonstrating end-to-end product development — from database design and REST API architecture to React state management, payment gateway integration, and production deployment.
