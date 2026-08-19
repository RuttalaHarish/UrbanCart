"""
UrbanCart — FastAPI Application Entry Point

Registers:
  - CORS middleware (same allowed origins as the original Node.js backend)
  - All 8 API routers under /api/*
  - Health check route at GET /
  - Global exception handlers that format errors as { success, message }
    (matches the Node.js response shape that the React frontend expects)
  - Lifespan context: connects/disconnects MongoDB on startup/shutdown
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import close_mongo_connection, connect_to_mongo
from .routers import auth, cart, categories, orders, payments, products, users, wishlist

load_dotenv()

# ── Lifespan (startup / shutdown) ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup; close connection on shutdown."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


# ── App Instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="UrbanCart API",
    description="Python FastAPI backend for the UrbanCart e-commerce platform",
    version="2.0.0",
    lifespan=lifespan,
)


# ── CORS Middleware ──────────────────────────────────────────────────────────
# Mirrors the exact allow-list from the original Node.js app.js

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    # Vercel Production Domains
    "https://urban-cart-beige.vercel.app",
    "https://urban-cart-8pix5q7b0-ruttala-harish.vercel.app",
    "https://urban-cart-git-main-ruttala-harish.vercel.app",
    "https://urban-cart-k68uljhjd-ruttala-harish.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handlers ────────────────────────────────────────────────
# Ensures ALL error responses use { "success": false, "message": "..." }
# so the React frontend (which checks the `success` field) stays compatible.

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msgs = []
    for err in exc.errors():
        loc = err.get("loc", [])
        field = str(loc[-1]) if loc else "field"
        msg = err.get("msg", "invalid value")
        error_msgs.append(f"'{field}' {msg}")
    message = "Validation error: " + ", ".join(error_msgs)
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"success": False, "message": message},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": f"Internal server error: {str(exc)}"},
    )


# ── API Routers ──────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(payments.router)


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def health_check():
    return {"success": True, "message": "UrbanCart Python Backend Running"}
