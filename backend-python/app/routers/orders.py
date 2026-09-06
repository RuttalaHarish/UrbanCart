"""
UrbanCart — Orders Router
POST   /api/orders                     — create order from cart (protected)
GET    /api/orders                     — user's own orders (protected)
GET    /api/orders/all                 — all orders (admin)
GET    /api/orders/dashboard/stats     — admin dashboard stats (admin)
GET    /api/orders/{id}                — single order (user/admin)
PUT    /api/orders/{id}/status         — update status (admin)
PUT    /api/orders/{id}/cancel         — cancel order (user/admin)
DELETE /api/orders/{id}                — delete order (admin)
"""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, field_validator

from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..utils import is_valid_object_id, serialize_id

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# Valid enum values (must match Node.js exactly for frontend compatibility)
VALID_ORDER_STATUSES = {"Pending", "Processing", "Shipped", "Delivered", "Cancelled"}
VALID_PAYMENT_STATUSES = {"Pending", "Paid", "Failed"}
VALID_PAYMENT_METHODS = {"COD", "RAZORPAY"}


# ── Request Schemas ──────────────────────────────────────────────────────────

class ShippingAddress(BaseModel):
    fullName: str
    phone: str
    address: str
    city: str
    state: str
    postalCode: str
    country: str

    @field_validator("fullName", "phone", "address", "city", "state", "postalCode", "country")
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("cannot be empty")
        return v


class CreateOrderBody(BaseModel):
    shippingAddress: ShippingAddress
    paymentMethod: str = "COD"


class UpdateOrderStatusBody(BaseModel):
    orderStatus: Optional[str] = None
    paymentStatus: Optional[str] = None


# ── Helper: populate order for response ─────────────────────────────────────

def _order_pipeline(match: dict, with_user: bool = False) -> list:
    """Return an aggregation pipeline that populates items.product (and optionally user)."""
    pipeline: list = [{"$match": match}]

    if with_user:
        pipeline += [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user",
                    "foreignField": "_id",
                    "as": "user",
                    "pipeline": [{"$project": {"name": 1, "email": 1}}],
                }
            },
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        ]

    pipeline += [
        {
            "$lookup": {
                "from": "products",
                "localField": "items.product",
                "foreignField": "_id",
                "as": "_products",
                "pipeline": [{"$project": {"name": 1, "price": 1, "images": 1, "category": 1, "brand": 1}}],
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
                            "priceAtPurchase": "$$item.priceAtPurchase",
                            "_id": "$$item._id",
                        },
                    }
                }
            }
        },
        {"$project": {"_products": 0}},
        {"$sort": {"createdAt": -1}},
    ]
    return pipeline


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def create_order(
    body: CreateOrderBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new order from the user's active cart."""
    user_id = current_user["_id"]
    payment_method = body.paymentMethod.upper()

    if payment_method not in VALID_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    # 1. Retrieve and populate cart
    cart_pipeline = [
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
                        },
                    }
                }
            }
        },
        {"$project": {"_products": 0}},
    ]
    carts = await db.carts.aggregate(cart_pipeline).to_list(length=1)
    cart = carts[0] if carts else None

    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Your cart is empty")

    # 2. Auto-cleanup: remove items whose product was deleted
    initial_count = len(cart["items"])
    valid_items = [item for item in cart["items"] if item.get("product") is not None]

    if len(valid_items) < initial_count:
        # Save cleaned cart and notify frontend
        await db.carts.update_one(
            {"user": ObjectId(user_id)},
            {"$set": {"items": [{"product": item["product"]["_id"], "quantity": item["quantity"]} for item in valid_items]}},
        )
        return JSONResponse(
            status_code=409,
            content={
                "success": False,
                "cartUpdated": True,
                "message": "Some products in your cart are no longer available. They have been removed automatically. Please review your cart before placing your order.",
            },
        )

    # 3. Build order items and calculate total
    total_amount: float = 0.0
    order_items = []
    for item in valid_items:
        product = item["product"]
        price = product["price"]
        qty = item["quantity"]
        total_amount += price * qty
        order_items.append(
            {
                "product": product["_id"],
                "quantity": qty,
                "priceAtPurchase": price,
                "_id": ObjectId(),
            }
        )

    # 4. Build and save order document
    now = datetime.now(tz=timezone.utc)
    order_doc = {
        "user": ObjectId(user_id),
        "items": order_items,
        "totalAmount": round(total_amount, 2),
        "shippingAddress": body.shippingAddress.model_dump(),
        "orderStatus": "Pending",
        "paymentStatus": "Pending",
        "paymentMethod": payment_method,
        "razorpayOrderId": None,
        "razorpayPaymentId": None,
        "razorpaySignature": None,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id

    # 5. Clear cart immediately for COD; for Razorpay, clear after payment verification
    if payment_method != "RAZORPAY":
        await db.carts.update_one(
            {"user": ObjectId(user_id)},
            {"$set": {"items": [], "updatedAt": now}},
        )

    return {
        "success": True,
        "message": "Order created successfully",
        "data": serialize_id(order_doc),
    }


@router.get("")
async def get_user_orders(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return all orders belonging to the authenticated user."""
    user_id = current_user["_id"]
    pipeline = _order_pipeline({"user": ObjectId(user_id)}, with_user=False)
    orders = await db.orders.aggregate(pipeline).to_list(length=None)
    return {"success": True, "count": len(orders), "data": serialize_id(orders)}


@router.get("/all")
async def get_all_orders(
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return all orders across all users (admin only)."""
    pipeline = _order_pipeline({}, with_user=True)
    orders = await db.orders.aggregate(pipeline).to_list(length=None)
    return {"success": True, "count": len(orders), "data": serialize_id(orders)}


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return high-level business metrics for the admin dashboard."""
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"orderStatus": "Pending"})
    delivered_orders = await db.orders.count_documents({"orderStatus": "Delivered"})
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})

    revenue_pipeline = [
        {"$match": {"paymentStatus": "Paid"}},
        {"$group": {"_id": None, "totalRevenue": {"$sum": "$totalAmount"}}},
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(length=1)
    total_revenue = revenue_result[0]["totalRevenue"] if revenue_result else 0

    return {
        "success": True,
        "data": {
            "totalOrders": total_orders,
            "pendingOrders": pending_orders,
            "deliveredOrders": delivered_orders,
            "totalRevenue": total_revenue,
            "totalUsers": total_users,
            "totalProducts": total_products,
        },
    }


@router.get("/{id}")
async def get_order_by_id(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return a single order. Users can only see their own; admins can see any."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    pipeline = _order_pipeline({"_id": ObjectId(id)}, with_user=False)
    results = await db.orders.aggregate(pipeline).to_list(length=1)
    if not results:
        raise HTTPException(status_code=404, detail="Order not found")

    order = results[0]

    # Authorization: user can only view own order
    if str(order["user"]) != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return {"success": True, "data": serialize_id(order)}


@router.put("/{id}/status")
async def update_order_status(
    id: str,
    body: UpdateOrderStatusBody,
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update orderStatus and/or paymentStatus (admin only)."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    order = await db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_fields: dict = {"updatedAt": datetime.now(tz=timezone.utc)}

    if body.orderStatus is not None:
        if body.orderStatus not in VALID_ORDER_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid order status value")
        update_fields["orderStatus"] = body.orderStatus

    if body.paymentStatus is not None:
        if body.paymentStatus not in VALID_PAYMENT_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid payment status value")
        update_fields["paymentStatus"] = body.paymentStatus

    updated = await db.orders.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": update_fields},
        return_document=True,
    )

    return {
        "success": True,
        "message": "Order status updated successfully",
        "data": serialize_id(updated),
    }


@router.put("/{id}/cancel")
async def cancel_order(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Cancel an order. Customers can cancel their own; admins can cancel any."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    order = await db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorization
    if str(order["user"]) != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    # Status guards
    if order["orderStatus"] in ("Shipped", "Delivered"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel an order that is already {order['orderStatus']}",
        )
    if order["orderStatus"] == "Cancelled":
        raise HTTPException(status_code=400, detail="Order is already cancelled")

    updated = await db.orders.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"orderStatus": "Cancelled", "updatedAt": datetime.now(tz=timezone.utc)}},
        return_document=True,
    )

    return {
        "success": True,
        "message": "Order cancelled successfully",
        "data": serialize_id(updated),
    }


@router.delete("/{id}")
async def delete_order(
    id: str,
    _: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Permanently delete an order (admin only)."""
    if not is_valid_object_id(id):
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    result = await db.orders.find_one_and_delete({"_id": ObjectId(id)})
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"success": True, "message": "Order deleted successfully"}
