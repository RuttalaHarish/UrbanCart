"""
UrbanCart — Authentication Utilities
Handles JWT creation/decoding and bcrypt password hashing.
"""

import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
import bcrypt

# ── Config ──────────────────────────────────────────────────────────────────
JWT_SECRET: str = os.getenv("JWT_SECRET", "urbancartdefaultsecretkey")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRY_DAYS: int = 30


# ── Password Helpers ─────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Compare a plain-text password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT Helpers ──────────────────────────────────────────────────────────────

def create_token(user_id: str, role: str) -> str:
    """
    Create a signed JWT for the given user.
    Expires in JWT_EXPIRY_DAYS days (matches the Node.js 30d setting).
    """
    expire = datetime.now(tz=timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS)
    payload = {"id": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT.
    Raises jose.JWTError on failure (expired, tampered, etc.).
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
