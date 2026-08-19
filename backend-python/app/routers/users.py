"""
UrbanCart — Users Router
GET /api/users/profile
PUT /api/users/profile
"""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


# ── Request Schema ───────────────────────────────────────────────────────────

class UpdateProfileBody(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/profile")
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return the authenticated user's profile (no password)."""
    user = await db.users.find_one(
        {"_id": ObjectId(current_user["_id"])}, {"password": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "success": True,
        "data": {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "role": user["role"],
            "createdAt": user.get("createdAt", "").isoformat() if user.get("createdAt") else "",
        },
    }


@router.put("/profile")
async def update_user_profile(
    body: UpdateProfileBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update name, phone, address — email/role/password are read-only here."""
    update_fields: dict = {"updatedAt": datetime.now(tz=timezone.utc)}

    if body.name is not None:
        update_fields["name"] = body.name.strip()
    if body.phone is not None:
        update_fields["phone"] = body.phone.strip()
    if body.address is not None:
        update_fields["address"] = body.address.strip()

    updated = await db.users.find_one_and_update(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_fields},
        return_document=True,  # return the updated doc
        projection={"password": 0},
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": {
            "_id": str(updated["_id"]),
            "name": updated["name"],
            "email": updated["email"],
            "phone": updated.get("phone", ""),
            "address": updated.get("address", ""),
            "role": updated["role"],
            "createdAt": updated.get("createdAt", "").isoformat() if updated.get("createdAt") else "",
        },
    }
