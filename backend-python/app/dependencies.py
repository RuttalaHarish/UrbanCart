"""
UrbanCart — FastAPI Dependencies
Reusable dependency functions injected into route handlers via Depends().

  get_current_user  →  replaces Node.js protect middleware
  require_admin     →  replaces Node.js admin middleware
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from .auth import decode_token
from .database import get_db

# HTTPBearer extracts the token from the "Authorization: Bearer <token>" header
_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    """
    Verify the JWT token and return the authenticated user document (no password).
    Raises HTTP 401 on any failure — mirrors the Node.js 'protect' middleware.
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id: str = payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authorized, invalid token payload",
            )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Not authorized, token failed: {exc}",
        )

    user = await db.users.find_one(
        {"_id": ObjectId(user_id)}, {"password": 0}
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized, user not found",
        )

    # Stringify _id so the rest of the code works with plain strings
    user["_id"] = str(user["_id"])
    return user


async def require_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Ensure the authenticated user has the 'admin' role.
    Raises HTTP 403 otherwise — mirrors the Node.js 'admin' middleware.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized, admin privileges required",
        )
    return current_user
