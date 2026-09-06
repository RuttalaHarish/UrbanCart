# 🛒 UrbanCart — Full-Stack E-Commerce Platform

> A **production-ready, full-stack e-commerce application** built entirely from scratch. Supports complete customer shopping flows, Razorpay online payments, Cash on Delivery, and a dedicated Admin Management Panel.

---

## 📌 Table of Contents

- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Architecture & Data Flow](#️-architecture--data-flow)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Database Collections](#️-database-collections)
- [API Reference](#-api-reference)
- [Frontend Pages & Routes](#️-frontend-pages--routes)
- [State Management](#-state-management)
- [Payment Flow (Razorpay)](#-payment-flow-razorpay)
- [Security Implementation](#-security-implementation)
- [Environment Variables](#-environment-variables)
- [Getting Started (Local Setup)](#-getting-started-local-setup)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://urban-cart-beige.vercel.app](https://urban-cart-beige.vercel.app) |
| **Backend API** | Deployed on Render / Railway |
| **GitHub** | [github.com/RuttalaHarish/UrbanCart](https://github.com/RuttalaHarish/UrbanCart) |

---

## 🧰 Tech Stack

### 🎨 Frontend — `frontend/`

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | v19 | Core UI library |
| **Vite** | v8 | Lightning-fast build tool & dev server |
| **React Router DOM** | v7 | Client-side SPA routing |
| **Axios** | ^1.18 | HTTP client for all API calls |
| **React Context API** | Built-in | Global state (Auth, Cart, Wishlist) |
| **Recharts** | ^3.10 | Admin dashboard analytics charts |
| **React Icons** | v5.7 | Icon library |
| **React Toastify** | v11 | Toast notification system |
| **Vanilla CSS** | — | All custom styling (no frameworks) |
| **ESLint** | v10 | Code linting |

---

### 🐍 Backend — `backend-python/`

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Language |
| **FastAPI** | >=0.115 | High-performance async REST API framework |
| **Uvicorn** | >=0.32 | ASGI production server |
| **Motor** | >=3.6 | Async MongoDB driver |
| **PyMongo** | >=4.10 | MongoDB Python driver |
| **python-jose** | >=3.3 | JWT token creation & verification |
| **passlib[bcrypt]** | >=1.7 | Password hashing (bcrypt, salt rounds 10) |
| **python-dotenv** | >=1.0 | Environment variable management |
| **Razorpay** | >=1.4 | Payment gateway SDK |
| **httpx** | >=0.27 | Async HTTP client |

---

### ☁️ Infrastructure & Deployment

| Tool | Purpose |
|------|---------|
| **Vercel** | Frontend hosting with SPA routing |
| **Render / Railway** | Python backend API hosting |
| **MongoDB Atlas** | Cloud-hosted MongoDB cluster |
| **GitHub** | Source control |

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────┐
│         Browser (React + Vite)          │
│    Port: 5173 (dev) / Vercel (prod)     │
└──────────────────┬──────────────────────┘
                   │  HTTP (Axios)
                   │  Authorization: Bearer <jwt>
                   ▼
        ┌──────────────────────────────────────┐
        │      FastAPI + Uvicorn (ASGI)         │
        │        Port: 8000                    │
        │                                      │
        │  ① CORSMiddleware                    │
        │  ② HTTPBearer → JWT decode           │
        │  ③ get_current_user() dependency     │
        │  ④ require_admin() dependency        │
        │  ⑤ Router handlers (business logic)  │
        │  ⑥ Motor async DB calls              │
        └──────────────────┬──────────────────┘
                           │  Motor (async)
                           ▼
               ┌────────────────────┐
               │   MongoDB Atlas    │
               │  (6 Collections)   │
               └────────────────────┘
```

**Startup / Shutdown (FastAPI Lifespan):**
- On startup → `connect_to_mongo()` opens Motor client
- On shutdown → `close_mongo_connection()` cleanly closes it

**Error Response Shape:**
All errors return `{ "success": false, "message": "..." }` via global exception handlers — matching what the React frontend expects.

---

## 📁 Project Structure

```
UrbanCart/
│
├── frontend/                           ← React + Vite SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                     ← SPA rewrite rule for Vercel
│   ├── package.json
│   └── src/
│       ├── main.jsx                    ← App entry point
│       ├── App.jsx
│       ├── api/
│       │   └── axios.js                ← Axios instance (base URL + interceptors)
│       ├── assets/                     ← Logos, images
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar/             ← Top navigation bar
│       │   │   ├── Footer/             ← Site footer
│       │   │   ├── BottomNav/          ← Mobile bottom navigation
│       │   │   └── AdminNavbar/        ← Admin sidebar/navbar
│       │   ├── home/
│       │   │   ├── Hero/               ← Homepage hero banner
│       │   │   ├── Categories/         ← Category cards section
│       │   │   └── FeaturedProducts/   ← Featured products section
│       │   ├── cart/                   ← Cart UI components
│       │   ├── product/                ← ProductCard, ProductGrid
│       │   ├── wishlist/               ← Wishlist UI components
│       │   ├── common/                 ← Shared reusable components
│       │   ├── ui/                     ← Generic UI primitives (buttons, modals)
│       │   ├── CategoryNav.jsx         ← Category filter navigation bar
│       │   └── OrderDetailsModal.jsx   ← Reusable order detail modal
│       ├── context/
│       │   ├── AuthContext.jsx         ← Auth state: user, token, login/logout/updateUser
│       │   ├── CartContext.jsx         ← Cart state: items, add/remove/update/clear
│       │   └── WishlistContext.jsx     ← Wishlist state: items, add/remove
│       ├── layouts/
│       │   ├── MainLayout.jsx          ← Customer layout (Navbar + Footer)
│       │   └── AdminLayout.jsx         ← Admin layout (AdminNavbar + content)
│       ├── pages/                      ← 20 pages (see routes table below)
│       ├── routes/
│       │   ├── AppRoutes.jsx           ← All route definitions
│       │   ├── AppRouter.jsx           ← Router wrapper with Context Providers
│       │   ├── ProtectedRoute.jsx      ← Guards: redirects unauthenticated users
│       │   └── AdminRoute.jsx          ← Guards: redirects non-admin users
│       ├── services/                   ← API service call functions
│       ├── constants/                  ← API endpoint constants
│       ├── styles/                     ← Global CSS variables & design tokens
│       └── utils/                      ← Helper functions
│
└── backend-python/                     ← Python FastAPI REST API
    ├── requirements.txt
    ├── .env.example
    └── app/
        ├── main.py                     ← FastAPI app, CORS, routers, lifespan
        ├── database.py                 ← Motor async MongoDB connect/disconnect
        ├── auth.py                     ← JWT create/decode (python-jose) + bcrypt hashing
        ├── dependencies.py             ← get_current_user, require_admin DI functions
        ├── utils.py                    ← serialize_id(), is_valid_object_id()
        └── routers/
            ├── auth.py                 ← POST /api/auth/register, /login
            ├── users.py                ← GET/PUT /api/users/profile
            ├── products.py             ← Full CRUD /api/products
            ├── categories.py           ← Full CRUD /api/categories
            ├── cart.py                 ← Full cart management /api/cart
            ├── wishlist.py             ← Full wishlist management /api/wishlist
            ├── orders.py               ← Full order management + dashboard stats
            └── payments.py             ← Razorpay create-order + HMAC verify
```

---

## ✨ Features

### 👤 Customer Features

| Feature | Description |
|---------|-------------|
| **Register & Login** | JWT-based auth; session persisted via `localStorage` (`urbancart_token`, `urbancart_user`) |
| **Browse Shop** | Product listing with real-time search, category filter, and sort |
| **Product Details** | Full product page: images, description, price, brand, stock status |
| **Categories** | Dedicated browse-by-category page |
| **Shopping Cart** | Add, remove, update quantities; cart synced to backend per user |
| **Wishlist** | Save products; wishlist synced to backend per user |
| **Checkout** | Multi-field shipping address form + payment method selection |
| **COD Payment** | Place order with Cash on Delivery |
| **Razorpay Payment** | Full online payment flow with HMAC SHA256 signature verification |
| **My Orders** | View full order history with live status tracking |
| **Order Details** | Item breakdown, shipping info, payment method & status |
| **Cancel Order** | Cancel orders that are still in `Pending` status |
| **Profile Management** | Update name, phone, and address |

### 🛠️ Admin Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time stats: revenue, orders, users, products; Recharts charts |
| **Product Management** | Add, edit, delete products (image URL, category, brand, price, stock) |
| **Category Management** | Create, edit, delete product categories |
| **Order Management** | View all customer orders; update status through full lifecycle |
| **Order Status Lifecycle** | `Pending` → `Processing` → `Shipped` → `Delivered` (or `Cancelled`) |
| **Admin Order Detail** | Full order view with customer info and payment breakdown |
| **Role-Based Access Control** | All admin routes protected; regular users receive 403 Forbidden |

---

## 🗄️ Database Collections (MongoDB)

### users
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `password` | String | bcrypt hashed (salt rounds 10) |
| `phone` | String | Optional, default `""` |
| `address` | String | Optional, default `""` |
| `role` | String | `"customer"` or `"admin"` |
| `createdAt` / `updatedAt` | DateTime | Auto-managed |

### products
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | Required, min 0 |
| `category` | String | Required |
| `brand` | String | Required |
| `stock` | Number | Required, min 0 |
| `images` | [String] | Array of image URLs |
| `createdBy` | ObjectId | Ref → users (admin who created it) |

### orders
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Ref → users |
| `items` | [OrderItem] | Min 1 required; each has product, quantity, priceAtPurchase |
| `totalAmount` | Number | Required, min 0 |
| `shippingAddress` | Object | fullName, phone, address, city, state, postalCode, country |
| `orderStatus` | String | `Pending` / `Processing` / `Shipped` / `Delivered` / `Cancelled` |
| `paymentStatus` | String | `Pending` / `Paid` / `Failed` |
| `paymentMethod` | String | `COD` / `RAZORPAY` |
| `razorpayOrderId` | String | Set when Razorpay order is created |
| `razorpayPaymentId` | String | Set after successful payment |
| `razorpaySignature` | String | Stored for HMAC audit trail |

### carts
| Field | Type |
|-------|------|
| `user` | ObjectId → users |
| `items` | [{ product: ObjectId, quantity: Number }] |

### wishlists
| Field | Type |
|-------|------|
| `user` | ObjectId → users |
| `products` | [ObjectId → products] |

### categories
| Field | Type |
|-------|------|
| `name` | String, required |
| `description` | String, optional |
| `image` | String, optional |
| `isActive` | Boolean |

---

## 📡 API Reference

> **Base URL (local):** `http://localhost:8000/api`
> **Swagger UI (local):** `http://localhost:8000/docs`
> All protected routes require: `Authorization: Bearer <token>`

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user; returns `{ user, token }` |
| POST | `/login` | Public | Authenticate user; returns `{ user, token }` |

### Users — `/api/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | 🔒 Protected | Get logged-in user profile |
| PUT | `/profile` | 🔒 Protected | Update name, phone, address |

### Products — `/api/products`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all products (search, filter, sort, paginate) |
| GET | `/{id}` | Public | Get a single product by ID |
| POST | `/` | 👑 Admin | Create a new product |
| PUT | `/{id}` | 👑 Admin | Update an existing product |
| DELETE | `/{id}` | 👑 Admin | Delete a product |

### Categories — `/api/categories`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all categories |
| GET | `/{id}` | Public | Get single category |
| POST | `/` | 👑 Admin | Create a category |
| PUT | `/{id}` | 👑 Admin | Update a category |
| DELETE | `/{id}` | 👑 Admin | Delete a category |

### Cart — `/api/cart`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | 🔒 Protected | Get user's cart (auto-creates if missing) |
| POST | `/` | 🔒 Protected | Add item; increments quantity if already in cart |
| PUT | `/{product_id}` | 🔒 Protected | Set exact quantity for an item |
| DELETE | `/{product_id}` | 🔒 Protected | Remove a specific item |
| DELETE | `/` | 🔒 Protected | Clear entire cart |

### Wishlist — `/api/wishlist`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | 🔒 Protected | Get user's wishlist (auto-creates if missing) |
| POST | `/` | 🔒 Protected | Add product (rejects duplicates) |
| DELETE | `/{product_id}` | 🔒 Protected | Remove a product |

### Orders — `/api/orders`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | 🔒 Protected | Create order from cart; clears cart on success (COD) |
| GET | `/` | 🔒 Protected | Get all orders for the logged-in user |
| GET | `/{id}` | 🔒 Protected | Get a specific order by ID |
| PUT | `/{id}/cancel` | 🔒 Protected | Cancel an order (Pending status only) |
| GET | `/all` | 👑 Admin | Get all orders across all users |
| GET | `/dashboard/stats` | 👑 Admin | Revenue, order counts, user/product totals |
| PUT | `/{id}/status` | 👑 Admin | Update orderStatus and/or paymentStatus |
| DELETE | `/{id}` | 👑 Admin | Permanently delete an order |

### Payments — `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create-order` | 🔒 Protected | Create Razorpay order; returns `{ orderId, amount, currency }` |
| POST | `/verify` | 🔒 Protected | Verify HMAC SHA256 signature; marks order Paid on success |

---

## 🖥️ Frontend Pages & Routes

| Route | Page | Access | Layout |
|-------|------|--------|--------|
| `/login` | Login | Public | Standalone |
| `/register` | Register | Public | Standalone |
| `/` | Home | Public | MainLayout |
| `/shop` | Shop (all products + filters) | Public | MainLayout |
| `/products/:id` | Product Details | Public | MainLayout |
| `/categories` | Categories | Public | MainLayout |
| `/cart` | Shopping Cart | Public | MainLayout |
| `/wishlist` | Wishlist | Public | MainLayout |
| `/about` | About | Public | MainLayout |
| `/contact` | Contact | Public | MainLayout |
| `/checkout` | Checkout + Payment | Public | MainLayout |
| `*` | 404 Not Found | Public | MainLayout |
| `/profile` | User Profile | 🔒 Protected | MainLayout |
| `/my-orders` | My Orders | 🔒 Protected | MainLayout |
| `/orders/:id` | Order Details | 🔒 Protected | MainLayout |
| `/admin/dashboard` | Admin Analytics | 👑 Admin Only | AdminLayout |
| `/admin/orders` | Admin Orders List | 👑 Admin Only | AdminLayout |
| `/admin/orders/:id` | Admin Order Detail | 👑 Admin Only | AdminLayout |
| `/admin/products` | Admin Products | 👑 Admin Only | AdminLayout |
| `/admin/products/add` | Add New Product | 👑 Admin Only | AdminLayout |
| `/admin/products/:id/edit` | Edit Product | 👑 Admin Only | AdminLayout |

> `AdminAddProduct.jsx` is reused for both Add and Edit flows.

---

## 🧠 State Management

All global state is managed via **React Context API** — no Redux or Zustand.

| Context | State | Persistence |
|---------|-------|-------------|
| `AuthContext` | `user`, `token`, `isAuthenticated`, `loading` | `localStorage` (keys: `urbancart_token`, `urbancart_user`) |
| `CartContext` | Cart items, add/remove/update/clear | Backend — synced per user |
| `WishlistContext` | Wishlist items, add/remove | Backend — synced per user |

**Token lifecycle:**
1. Login → token saved in `localStorage` + set on `axios.defaults.headers.common['Authorization']`
2. App reload → token/user restored from `localStorage`
3. Logout → `localStorage` cleared, Axios header removed
4. 401 response → Axios interceptor clears storage and redirects to `/login`

---

## 💳 Payment Flow (Razorpay)

```
Customer clicks "Pay Online"
          │
          ▼
Frontend → POST /api/payments/create-order
          │
          ▼
FastAPI creates Razorpay order via SDK
Returns → { id (razorpay order id), amount, currency }
          │
          ▼
Razorpay Checkout Widget opens in browser
          │
Customer completes payment
          │
          ▼
Razorpay callback:
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
          │
          ▼
Frontend → POST /api/payments/verify
          │
          ▼
FastAPI verifies HMAC SHA256:
  expected = HMAC(key=RAZORPAY_KEY_SECRET,
                  msg=razorpay_order_id + "|" + razorpay_payment_id,
                  digestmod=sha256).hexdigest()
  if expected == razorpay_signature → VALID
          │
          ▼
Order saved:  paymentStatus = "Paid"
              razorpayOrderId, razorpayPaymentId, razorpaySignature stored
Cart cleared: items = []
```

---

## 🔒 Security Implementation

| Concern | Implementation |
|---------|---------------|
| **Password hashing** | `bcrypt` via `passlib`, salt rounds = 10 |
| **Authentication** | JWT `Bearer` tokens via `python-jose` (HS256, 30-day expiry) |
| **Protected routes** | `get_current_user()` FastAPI dependency — decodes JWT, loads user from DB |
| **Admin routes** | `require_admin()` dependency — checks `user["role"] == "admin"`, raises 403 otherwise |
| **CORS** | Restricted to explicit whitelist: localhost + Vercel production URLs |
| **Payment integrity** | Razorpay HMAC SHA256 signature verified before any order is marked Paid |
| **Password exclusion** | All DB queries use `projection={"password": 0}` — password never returned in responses |
| **Input validation** | Pydantic models with `@field_validator` on all request bodies |

---

## 🔧 Environment Variables

### Backend — `backend-python/.env`

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/UrbanCartDB
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> ⚠️ **Never commit `.env` files to version control.** Use `.env.example` as a safe template.

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

- **Python** 3.11+
- **Node.js** v18+ and **npm** v9+
- **MongoDB Atlas** account (or local MongoDB)
- **Razorpay** test account with API keys

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/RuttalaHarish/UrbanCart.git
cd UrbanCart
```

---

### Step 2 — Setup Python Backend

```bash
cd backend-python

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, and Razorpay keys in .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

> ✅ Backend runs at: `http://localhost:8000`
> 📖 Swagger API docs: `http://localhost:8000/docs`
> 📖 ReDoc: `http://localhost:8000/redoc`

---

### Step 3 — Setup Frontend

```bash
cd frontend

npm install

# Create .env file
cp .env.example .env   # or create manually:
# VITE_API_BASE_URL=http://localhost:8000/api
# VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

npm run dev
```

> ✅ Frontend runs at: `http://localhost:5173`

---

## 📦 Deployment

### Frontend — Vercel

SPA routing configured via `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

```bash
cd frontend
npm run build
# Deploy via Vercel CLI or GitHub integration (auto-detected)
```

Set environment variable on Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Backend — Render / Railway

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Root directory:** `backend-python`

Set all environment variables (`MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in the hosting dashboard.

---

## 👤 Author

**Ruttala Harish**
- GitHub: [@RuttalaHarish](https://github.com/RuttalaHarish)
- Live App: [urban-cart-beige.vercel.app](https://urban-cart-beige.vercel.app)

---

> Built from scratch as a full-stack portfolio project demonstrating end-to-end product development — from MongoDB schema design and async REST API architecture with Python/FastAPI to React Context state management, Razorpay payment gateway integration, and production deployment on Vercel + Render.
