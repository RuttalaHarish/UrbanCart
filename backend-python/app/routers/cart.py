"""
UrbanCart — Cart Router
GET    /api/cart                    — get user's cart (auto-create if missing)
POST   /api/cart                    — add item (merges quantity if item exists)
PUT    /api/cart/{product_id}       — update quantity
DELETE /api/cart/{product_id}       — remove single item
DELETE /api/cart                    — clear entire cart
"""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from ..database import get_db
from ..dependencies import get_current_user
from ..utils import is_valid_object_id, serialize_id

router = APIRouter(prefix="/api/cart", tags=["Cart"])


# ── Helper: fetch cart with products populated ───────────────────────────────

async def _get_populated_cart(user_id: str, db: AsyncIOMotorDatabase) -> dict:
    """Return the user's cart with each item.product fully populated."""
    pipeline = [
        {"$match": {"user": ObjectId(user_id)}},
        {
            "$lookup": {
                "from": "products",
                "localField": "items.product",
                "foreignField": "_id",
                "as": "_products",
            }
        },
        {
            "$addFields": {
                "items": {
                    "$map": {
                        "input": "$items",
                        "as": "item",
                        "in": {
                            "product": {
                                "$arrayElemAt": [
                                    {
                                        "$filter": {
                                            "input": "$_products",
                                            "cond": {"$eq": ["$$this._id", "$$item.product"]},
                                        }
                                    },
                                    0,
                                ]
                            },
                            "quantity": "$$item.quantity",
                            "_id": "$$item._id",
                        },
                    }
                }
            }
        },
        {"$project": {"_products": 0}},
    ]
    results = await db.carts.aggregate(pipeline).to_list(length=1)
    return results[0] if results else None


# ── Request Schemas ──────────────────────────────────────────────────────────

class AddToCartBody(BaseModel):
    productId: str
    quantity: int = 1


class UpdateCartBody(BaseModel):
    quantity: int


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("")
async def get_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return the user's cart. Auto-creates an empty cart if none exists."""
    user_id = current_user["_id"]

    cart = await db.carts.find_one({"user": ObjectId(user_id)})
    if not cart:
        # Auto-create empty cart
        now = datetime.now(tz=timezone.utc)
        result = await db.carts.insert_one(
            {"user": ObjectId(user_id), "items": [], "createdAt": now, "updatedAt": now}
        )
        cart = await db.carts.find_one({"_id": result.inserted_id})

    populated = await _get_populated_cart(user_id, db)
    return {"success": True, "data": serialize_id(populated or cart)}


@router.post("")
async def add_to_cart(
    body: AddToCartBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Add a product to the cart. If already present, increments quantity."""
    user_id = current_user["_id"]
    qty = body.quantity

    # Validate
    if not body.productId:
        raise HTTPException(status_code=400, detail="Please provide productId")
    if not is_valid_object_id(body.productId):
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    if qty < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    # Check product exists
    product = await db.products.find_one({"_id": ObjectId(body.productId)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get or create cart
    cart = await db.carts.find_one({"user": ObjectId(user_id)})
    if not cart:
        now = datetime.now(tz=timezone.utc)
        await db.carts.insert_one(
            {"user": ObjectId(user_id), "items": [], "createdAt": now, "updatedAt": now}
        )
        cart = await db.carts.find_one({"user": ObjectId(user_id)})

    # Check if product already in cart
    items = cart.get("items", [])
    product_obj_id = ObjectId(body.productId)
    existing_index = next(
        (i for i, item in enumerate(items) if item["product"] == product_obj_id), -1
    )

    if existing_index >= 0:
        # Increment quantity
        await db.carts.update_one(
            {"user": ObjectId(user_id), f"items.{existing_index}.product": product_obj_id},
            {
                "$inc": {f"items.{existing_index}.quantity": qty},
                "$set": {"updatedAt": datetime.now(tz=timezone.utc)},
            },
        )
    else:
        # Push new item
        await db.carts.update_one(
            {"user": ObjectId(user_id)},
            {
                "$push": {"items": {"product": product_obj_id, "quantity": qty, "_id": ObjectId()}},
                "$set": {"updatedAt": datetime.now(tz=timezone.utc)},
            },
        )

    populated = await _get_populated_cart(user_id, db)
    return {"success": True, "data": serialize_id(populated)}


@router.put("/{product_id}")
async def update_cart_item(
    product_id: str,
    body: UpdateCartBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Set the exact quantity for a cart item."""
    user_id = current_user["_id"]

    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    cart = await db.carts.find_one({"user": ObjectId(user_id)})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = cart.get("items", [])
    product_obj_id = ObjectId(product_id)
    idx = next((i for i, item in enumerate(items) if item["product"] == product_obj_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail="Product not in cart")

    await db.carts.update_one(
        {"user": ObjectId(user_id)},
        {
            "$set": {
                f"items.{idx}.quantity": body.quantity,
                "updatedAt": datetime.now(tz=timezone.utc),
            }
        },
    )

    populated = await _get_populated_cart(user_id, db)
    return {"success": True, "data": serialize_id(populated)}


@router.delete("/{product_id}")
async def remove_cart_item(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove a single product from the cart."""
    user_id = current_user["_id"]

    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    cart = await db.carts.find_one({"user": ObjectId(user_id)})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    product_obj_id = ObjectId(product_id)
    items = cart.get("items", [])
    if not any(item["product"] == product_obj_id for item in items):
        raise HTTPException(status_code=404, detail="Product not in cart")

    await db.carts.update_one(
        {"user": ObjectId(user_id)},
        {
            "$pull": {"items": {"product": product_obj_id}},
            "$set": {"updatedAt": datetime.now(tz=timezone.utc)},
        },
    )

    populated = await _get_populated_cart(user_id, db)
    return {"success": True, "data": serialize_id(populated)}


@router.delete("")
async def clear_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Clear all items from the cart."""
    user_id = current_user["_id"]
    now = datetime.now(tz=timezone.utc)

    result = await db.carts.find_one_and_update(
        {"user": ObjectId(user_id)},
        {"$set": {"items": [], "updatedAt": now}},
        return_document=True,
        upsert=True,
    )

    return {
        "success": True,
        "message": "Cart cleared successfully",
        "data": serialize_id(result),
    }
