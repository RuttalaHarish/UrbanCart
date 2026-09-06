"""
UrbanCart — Products Router
GET    /api/products          — search, filter, sort, paginate (public)
GET    /api/products/{id}     — single product (public)
POST   /api/products          — create (admin)
PUT    /api/products/{id}     — update (admin)
DELETE /api/products/{id}     — delete (admin)
"""

import re
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, field_validator

from ..database import get_db
from ..dependencies import require_admin
from ..utils import is_valid_object_id, serialize_id

router = APIRouter(prefix="/api/products", tags=["Products"])


# ── Request Schemas ──────────────────────────────────────────────────────────

class ProductBody(BaseModel):
    name: str
    description: str
    price: float
    category: str
    brand: str
    stock: int = 0
    images: list[str] = []

    @field_validator("name", "description", "category", "brand")
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("cannot be empty")
        return v


class UpdateProductBody(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[list[str]] = None


# ── Helper: populate createdBy via $lookup ───────────────────────────────────

def _product_pipeline(match: dict, sort: dict, skip: int, limit: int) -> list:
    return [
        {"$match": match},
        {
            "$lookup": {
                "from": "users",
                "localField": "createdBy",
                "foreignField": "_id",
                "as": "createdBy",
                "pipeline": [{"$project": {"name": 1, "email": 1}}],
            }
        },
        {
            "$unwind": {
                "path": "$createdBy",
                "preserveNullAndEmptyArrays": True,
            }
        },
        {"$sort": sort},
        {"$skip": skip},
        {"$limit": limit},
    ]


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("")
async def get_products(
    q: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    minPrice: Optional[float] = Query(None),
    maxPrice: Optional[float] = Query(None),
    sort: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return paginated products with optional search, category, price, and sort filters."""
    skip = (page - 1) * limit
    query: dict = {}

    # 1. Keyword search across name / description / brand / category
    search_param = (q or keyword or "").strip()
    if search_param:
        regex = re.compile(re.escape(search_param), re.IGNORECASE)
        query["$or"] = [
            {"name": {"$regex": regex}},
            {"description": {"$regex": regex}},
            {"brand": {"$regex": regex}},
            {"category": {"$regex": regex}},
        ]

    # 2. Category filter (case-insensitive exact match)
    if category and category.strip():
        query["category"] = re.compile(f"^{re.escape(category.strip())}$", re.IGNORECASE)

    # 3. Price range
    price_filter: dict = {}
    if minPrice is not None:
        price_filter["$gte"] = minPrice
    if maxPrice is not None:
        price_filter["$lte"] = maxPrice
    if price_filter:
        query["price"] = price_filter

    # 4. Sort options (stable secondary sort on _id)
    sort_map = {
        "price-asc":  {"price": 1, "_id": 1},
        "price-desc": {"price": -1, "_id": -1},
        "name-asc":   {"name": 1, "_id": 1},
        "name-desc":  {"name": -1, "_id": -1},
        "newest":     {"createdAt": -1, "_id": -1},
    }
    sort_options = sort_map.get(sort, {"createdAt": -1, "_id": -1})

    # 5. Count total before pagination
    total_products = await db.products.count_documents(query)
    total_pages = max(1, -(-total_products // limit))  # ceiling division

    # 6. Run aggregation pipeline (includes $lookup for createdBy)
    pipeline = _product_pipeline(query, sort_options, skip, limit)
    cursor = db.products.aggregate(pipeline)
    products = await cursor.to_list(length=limit)

    return {
        "success": True,
        "count": len(products),
        "totalProducts": total_products,
        "currentPage": page,
        "totalPages": total_pages,
        "limit": limit,
        "data": serialize_id(products),
    }


@router.get("/{id}")
async def get_product_by_id(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return a single product with populated createdBy."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    pipeline = _product_pipeline({"_id": ObjectId(id)}, {"_id": 1}, 0, 1)
    cursor = db.products.aggregate(pipeline)
    results = await cursor.to_list(length=1)

    if not results:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"success": True, "data": serialize_id(results[0])}


@router.post("", status_code=201)
async def create_product(
    body: ProductBody,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new product."""
    # Validation
    if body.price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")
    if body.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")

    now = datetime.now(tz=timezone.utc)
    product_doc = {
        "name": body.name.strip(),
        "description": body.description.strip(),
        "price": body.price,
        "category": body.category.strip(),
        "brand": body.brand.strip(),
        "stock": body.stock,
        "images": body.images,
        "createdBy": ObjectId(current_user["_id"]),
        "createdAt": now,
        "updatedAt": now,
    }

    result = await db.products.insert_one(product_doc)
    product_doc["_id"] = result.inserted_id

    return {"success": True, "data": serialize_id(product_doc)}


@router.put("/{id}")
async def update_product(
    id: str,
    body: UpdateProductBody,
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a product by ID."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    if body.price is not None and body.price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")
    if body.stock is not None and body.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")

    existing = await db.products.find_one({"_id": ObjectId(id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_fields = {"updatedAt": datetime.now(tz=timezone.utc)}
    for field in ("name", "description", "price", "category", "brand", "stock", "images"):
        val = getattr(body, field)
        if val is not None:
            update_fields[field] = val.strip() if isinstance(val, str) else val

    updated = await db.products.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": update_fields},
        return_document=True,
    )

    return {"success": True, "data": serialize_id(updated)}


@router.delete("/{id}")
async def delete_product(
    id: str,
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a product by ID."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    result = await db.products.find_one_and_delete({"_id": ObjectId(id)})
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"success": True, "message": "Product removed successfully"}
