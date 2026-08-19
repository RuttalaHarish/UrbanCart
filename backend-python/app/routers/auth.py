"""
UrbanCart — Auth Router
POST /api/auth/register
POST /api/auth/login
"""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, field_validator

from ..auth import create_token, hash_password, verify_password
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Request Schemas ──────────────────────────────────────────────────────────

class RegisterBody(BaseModel):
    name: str
    email: str
    password: str
    role: str = "customer"

    @field_validator("name", "email", "password")
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("cannot be empty")
        return v


class LoginBody(BaseModel):
    email: str
    password: str

    @field_validator("email", "password")
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("cannot be empty")
        return v


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterBody, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register a new user and return a JWT token."""

    # 1. Basic validation
    if not body.name.strip() or not body.email.strip() or not body.password:
        raise HTTPException(
            status_code=400,
            detail="Please provide name, email, and password",
        )

    # 2. Check duplicate email
    existing = await db.users.find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 3. Build user document
    now = datetime.now(tz=timezone.utc)
    safe_role = body.role if body.role in ("customer", "admin") else "customer"
    user_doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password": hash_password(body.password),
        "phone": "",
        "address": "",
        "role": safe_role,
        "createdAt": now,
        "updatedAt": now,
    }

    # 4. Insert and generate token
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id, safe_role)

    return {
        "success": True,
        "user": {
            "_id": user_id,
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
        },
        "token": token,
    }


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(body: LoginBody, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Authenticate a user and return a JWT token."""

    # 1. Basic validation
    if not body.email.strip() or not body.password:
        raise HTTPException(
            status_code=400, detail="Please provide email and password"
        )

    # 2. Lookup user
    user = await db.users.find_one({"email": body.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=401, detail="Email is not registered.")

    # 3. Verify password
    if not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    # 4. Generate token
    user_id = str(user["_id"])
    token = create_token(user_id, user["role"])

    return {
        "success": True,
        "user": {
            "_id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
        "token": token,
    }
