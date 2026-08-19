"""
UrbanCart — Categories Router
GET    /api/categories         — all categories (public)
GET    /api/categories/{id}    — single category (public)
POST   /api/categories         — create (admin)
PUT    /api/categories/{id}    — update (admin)
DELETE /api/categories/{id}    — delete (admin)
"""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, field_validator

from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..utils import is_valid_object_id, serialize_id

router = APIRouter(prefix="/api/categories", tags=["Categories"])


# ── Request Schemas ──────────────────────────────────────────────────────────

class CategoryBody(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    isActive: bool = True

    @field_validator("name")
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("cannot be empty")
        return v


class UpdateCategoryBody(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    isActive: Optional[bool] = None


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("")
async def get_categories(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return all categories."""
    categories = await db.categories.find({}).to_list(length=None)
    return {
        "success": True,
        "count": len(categories),
        "data": serialize_id(categories),
    }


@router.get("/{id}")
async def get_category_by_id(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return a single category by ID."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid category ID format")

    category = await db.categories.find_one({"_id": ObjectId(id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"success": True, "data": serialize_id(category)}


@router.post("", status_code=201)
async def create_category(
    body: CategoryBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new category (admin only)."""
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Please provide category name")

    # Duplicate check
    existing = await db.categories.find_one({"name": body.name.strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    now = datetime.now(tz=timezone.utc)
    cat_doc = {
        "name": body.name.strip(),
        "description": body.description,
        "image": body.image,
        "isActive": body.isActive,
        "createdAt": now,
        "updatedAt": now,
    }

    result = await db.categories.insert_one(cat_doc)
    cat_doc["_id"] = result.inserted_id

    return {"success": True, "data": serialize_id(cat_doc)}


@router.put("/{id}")
async def update_category(
    id: str,
    body: UpdateCategoryBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a category by ID (admin only)."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid category ID format")

    existing = await db.categories.find_one({"_id": ObjectId(id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    # Name uniqueness check when changing the name
    if body.name and body.name.strip() != existing["name"]:
        dup = await db.categories.find_one({"name": body.name.strip()})
        if dup:
            raise HTTPException(status_code=400, detail="Category name already exists")

    update_fields: dict = {"updatedAt": datetime.now(tz=timezone.utc)}
    if body.name is not None:
        update_fields["name"] = body.name.strip()
    if body.description is not None:
        update_fields["description"] = body.description
    if body.image is not None:
        update_fields["image"] = body.image
    if body.isActive is not None:
        update_fields["isActive"] = body.isActive

    updated = await db.categories.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": update_fields},
        return_document=True,
    )

    return {"success": True, "data": serialize_id(updated)}


@router.delete("/{id}")
async def delete_category(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a category by ID (admin only)."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid category ID format")

    result = await db.categories.find_one_and_delete({"_id": ObjectId(id)})
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"success": True, "message": "Category removed successfully"}
