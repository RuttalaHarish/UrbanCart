"""
UrbanCart — Wishlist Router
GET    /api/wishlist                 — get user's wishlist (auto-create if missing)
POST   /api/wishlist                 — add product (no duplicates)
DELETE /api/wishlist/{product_id}    — remove product
"""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from ..database import get_db
from ..dependencies import get_current_user
from ..utils import is_valid_object_id, serialize_id

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


# ── Helper: fetch wishlist with products populated ───────────────────────────

async def _get_populated_wishlist(user_id: str, db: AsyncIOMotorDatabase) -> dict | None:
    pipeline = [
        {"$match": {"user": ObjectId(user_id)}},
        {
            "$lookup": {
                "from": "products",
                "localField": "products",
                "foreignField": "_id",
                "as": "products",
            }
        },
    ]
    results = await db.wishlists.aggregate(pipeline).to_list(length=1)
    return results[0] if results else None


# ── Request Schema ───────────────────────────────────────────────────────────

class AddToWishlistBody(BaseModel):
    productId: str


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("")
async def get_wishlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return the user's wishlist. Auto-creates an empty one if missing."""
    user_id = current_user["_id"]

    wishlist = await db.wishlists.find_one({"user": ObjectId(user_id)})
    if not wishlist:
        now = datetime.now(tz=timezone.utc)
        result = await db.wishlists.insert_one(
            {"user": ObjectId(user_id), "products": [], "createdAt": now, "updatedAt": now}
        )
        wishlist = await db.wishlists.find_one({"_id": result.inserted_id})

    populated = await _get_populated_wishlist(user_id, db)
    return {"success": True, "data": serialize_id(populated or wishlist)}


@router.post("")
async def add_to_wishlist(
    body: AddToWishlistBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Add a product to the wishlist. Returns 400 if already present."""
    user_id = current_user["_id"]

    if not body.productId:
        raise HTTPException(status_code=400, detail="Please provide productId")
    if not is_valid_object_id(body.productId):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    # Check product exists
    product = await db.products.find_one({"_id": ObjectId(body.productId)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get or create wishlist
    wishlist = await db.wishlists.find_one({"user": ObjectId(user_id)})
    if not wishlist:
        now = datetime.now(tz=timezone.utc)
        await db.wishlists.insert_one(
            {"user": ObjectId(user_id), "products": [], "createdAt": now, "updatedAt": now}
        )
        wishlist = await db.wishlists.find_one({"user": ObjectId(user_id)})

    product_obj_id = ObjectId(body.productId)

    # Prevent duplicate
    if product_obj_id in wishlist.get("products", []):
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    await db.wishlists.update_one(
        {"user": ObjectId(user_id)},
        {
            "$push": {"products": product_obj_id},
            "$set": {"updatedAt": datetime.now(tz=timezone.utc)},
        },
    )

    populated = await _get_populated_wishlist(user_id, db)
    return {"success": True, "data": serialize_id(populated)}


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove a product from the wishlist."""
    user_id = current_user["_id"]

    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    wishlist = await db.wishlists.find_one({"user": ObjectId(user_id)})
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    product_obj_id = ObjectId(product_id)
    if product_obj_id not in wishlist.get("products", []):
        raise HTTPException(status_code=404, detail="Product not in wishlist")

    await db.wishlists.update_one(
        {"user": ObjectId(user_id)},
        {
            "$pull": {"products": product_obj_id},
            "$set": {"updatedAt": datetime.now(tz=timezone.utc)},
        },
    )

    populated = await _get_populated_wishlist(user_id, db)
    return {"success": True, "data": serialize_id(populated)}
