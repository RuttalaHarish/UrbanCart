# UrbanCart — Python FastAPI Backend

> Drop-in Python replacement for the original Node.js/Express backend.
> The React frontend works with **zero changes** — same API URLs, same JSON shapes.

---

## Tech Stack

| Library | Role |
|---------|------|
| **FastAPI** | Web framework (replaces Express) |
| **Uvicorn** | ASGI server (replaces Node HTTP) |
| **Motor** | Async MongoDB driver (replaces Mongoose) |
| **python-jose** | JWT encode/decode (replaces jsonwebtoken) |
| **passlib[bcrypt]** | Password hashing (replaces bcryptjs) |
| **razorpay** | Razorpay SDK (same API) |
| **python-dotenv** | Env vars (replaces dotenv npm) |

---

## Project Structure

```
backend-python/
├── app/
│   ├── main.py          # FastAPI app, CORS, routers, error handlers
│   ├── database.py      # Motor MongoDB connection
│   ├── auth.py          # JWT + bcrypt utilities
│   ├── dependencies.py  # get_current_user + require_admin (replaces middleware)
│   ├── utils.py         # serialize_id helper (ObjectId → str)
│   └── routers/
│       ├── auth.py       # POST /api/auth/register, /login
│       ├── users.py      # GET/PUT /api/users/profile
│       ├── products.py   # CRUD /api/products
│       ├── categories.py # CRUD /api/categories
│       ├── cart.py       # /api/cart operations
│       ├── wishlist.py   # /api/wishlist operations
│       ├── orders.py     # /api/orders + dashboard stats
│       └── payments.py   # /api/payments (Razorpay)
├── .env
├── .env.example
└── requirements.txt
```

---

## Setup & Run

### 1. Create a virtual environment

```bash
cd backend-python
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values (already done if copied from old backend).

### 4. Start the server

```bash
# Development (auto-reload on file change)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Server runs at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

## Connect Frontend

Change `VITE_API_BASE_URL` in `frontend/.env`:

```env
# Was: http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## API Endpoints

All endpoints are identical to the original Node.js backend.

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET/PUT | `/api/users/profile` | Protected |
| GET | `/api/products` | Public |
| GET | `/api/products/{id}` | Public |
| POST/PUT/DELETE | `/api/products` | Admin |
| GET | `/api/categories` | Public |
| POST/PUT/DELETE | `/api/categories` | Admin |
| GET/POST/PUT/DELETE | `/api/cart` | Protected |
| GET/POST/DELETE | `/api/wishlist` | Protected |
| GET/POST | `/api/orders` | Protected |
| GET | `/api/orders/all` | Admin |
| GET | `/api/orders/dashboard/stats` | Admin |
| GET/DELETE | `/api/orders/{id}` | Admin |
| PUT | `/api/orders/{id}/status` | Admin |
| PUT | `/api/orders/{id}/cancel` | Protected |
| POST | `/api/payments/create-order` | Protected |
| POST | `/api/payments/verify` | Protected |

---

## Deployment (Render/Railway)

- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Root directory:** `backend-python`
- Set all `.env` variables in the hosting dashboard
