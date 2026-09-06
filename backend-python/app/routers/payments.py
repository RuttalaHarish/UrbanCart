"""
UrbanCart — Payments Router (Razorpay)
POST /api/payments/create-order   — create Razorpay order linked to a MongoDB order
POST /api/payments/verify         — verify HMAC signature, mark order as Paid, clear cart
"""

import hashlib
import hmac
import os
import random
import time
from datetime import datetime, timezone
from typing import Optional

import razorpay
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from ..database import get_db
from ..dependencies import get_current_user
from ..utils import is_valid_object_id, serialize_id

router = APIRouter(prefix="/api/payments", tags=["Payments"])

# ── Razorpay Client (lazy init) ──────────────────────────────────────────────
# Initialized on first use so that .env is guaranteed to be loaded first.

_razorpay_client: Optional[razorpay.Client] = None


def _get_razorpay_client() -> razorpay.Client:
    """Return the Razorpay client, initializing it on first use."""
    global _razorpay_client
    if _razorpay_client is None:
        key_id = os.getenv("RAZORPAY_KEY_ID", "")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not key_id or not key_secret:
            raise HTTPException(
                status_code=500,
                detail="Razorpay credentials not configured",
            )
        _razorpay_client = razorpay.Client(auth=(key_id, key_secret))
    return _razorpay_client


# ── Request Schemas ──────────────────────────────────────────────────────────

class CreateRazorpayOrderBody(BaseModel):
    orderId: Optional[str] = None   # MongoDB order _id
    amount: Optional[float] = None  # fallback if orderId not given


class VerifyPaymentBody(BaseModel):
    orderId: Optional[str] = None           # MongoDB order _id
    razorpay_order_id: str                  # Razorpay order ID
    razorpay_payment_id: str                # Razorpay payment ID
    razorpay_signature: str                 # HMAC signature from Razorpay


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/create-order", status_code=201)
async def create_razorpay_order(
    body: CreateRazorpayOrderBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Create a Razorpay order and link its ID to the MongoDB order document.
    Accepts either a MongoDB orderId (preferred) or a raw amount.
    """
    target_order = None
    payment_amount = body.amount

    # 1. Resolve amount from MongoDB order if orderId provided
    if body.orderId:
        if not is_valid_object_id(body.orderId):
            raise HTTPException(status_code=400, detail="Invalid order ID format")
        target_order = await db.orders.find_one({"_id": ObjectId(body.orderId)})
        if not target_order:
            raise HTTPException(status_code=404, detail="Associated order not found")
        payment_amount = target_order["totalAmount"]

    # 2. Validate amount
    if not payment_amount or payment_amount <= 0:
        raise HTTPException(status_code=400, detail="Please provide a valid payment amount")

    # 3. Convert INR → paise (1 INR = 100 paise)
    amount_in_paise = round(payment_amount * 100)

    # 4. Build unique receipt ID
    if body.orderId:
        receipt_id = f"rcpt_{body.orderId[-12:]}"
    else:
        receipt_id = f"rcpt_{int(time.time())}_{random.randint(0, 999)}"

    # 5. Call Razorpay API
    options = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": receipt_id,
    }
    try:
        razorpay_order = _get_razorpay_client().order.create(data=options)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize payment gateway order: {exc}",
        )

    # 6. Persist the Razorpay order ID on the MongoDB order
    if target_order:
        await db.orders.update_one(
            {"_id": ObjectId(body.orderId)},
            {"$set": {"razorpayOrderId": razorpay_order["id"], "updatedAt": datetime.now(tz=timezone.utc)}},
        )

    return {"success": True, "data": razorpay_order}


@router.post("/verify")
async def verify_payment(
    body: VerifyPaymentBody,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Verify the Razorpay payment HMAC signature.
    On success → mark order as Paid and clear the user's cart.
    On failure → mark order payment as Failed.
    """
    # 1. Input validation
    if not body.razorpay_order_id or not body.razorpay_payment_id or not body.razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing required validation parameter keys")

    # 2. Generate expected HMAC SHA256 signature
    sign_body = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    if not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")

    generated_signature = hmac.HMAC(
        key=key_secret.encode("utf-8"),
        msg=sign_body.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    # 3. Secure comparison
    if hmac.compare_digest(generated_signature, body.razorpay_signature):
        # --- Signature valid → payment successful ---

        # 4. Locate the MongoDB order
        target_order = None
        if body.orderId and is_valid_object_id(body.orderId):
            target_order = await db.orders.find_one({"_id": ObjectId(body.orderId)})
        if target_order is None:
            target_order = await db.orders.find_one({"razorpayOrderId": body.razorpay_order_id})

        if target_order:
            # 5. Mark order as Paid and transition status to Processing if Pending
            update_fields = {
                "paymentStatus": "Paid",
                "razorpayOrderId": body.razorpay_order_id,
                "razorpayPaymentId": body.razorpay_payment_id,
                "razorpaySignature": body.razorpay_signature,
                "updatedAt": datetime.now(tz=timezone.utc),
            }
            if target_order.get("orderStatus") == "Pending":
                update_fields["orderStatus"] = "Processing"

            await db.orders.update_one(
                {"_id": target_order["_id"]},
                {"$set": update_fields},
            )
            # 6. Clear the user's cart
            await db.carts.update_one(
                {"user": target_order["user"]},
                {"$set": {"items": [], "updatedAt": datetime.now(tz=timezone.utc)}},
            )
            target_order["paymentStatus"] = "Paid"
            if target_order.get("orderStatus") == "Pending":
                target_order["orderStatus"] = "Processing"

        return {
            "success": True,
            "message": "Payment verified successfully and order marked as Paid",
            "data": serialize_id(target_order),
        }

    else:
        # --- Signature invalid → mark payment as Failed ---
        if body.orderId and is_valid_object_id(body.orderId):
            await db.orders.update_one(
                {"_id": ObjectId(body.orderId)},
                {"$set": {"paymentStatus": "Failed", "updatedAt": datetime.now(tz=timezone.utc)}},
            )
        elif body.razorpay_order_id:
            await db.orders.update_one(
                {"razorpayOrderId": body.razorpay_order_id},
                {"$set": {"paymentStatus": "Failed", "updatedAt": datetime.now(tz=timezone.utc)}},
            )

        raise HTTPException(status_code=400, detail="Invalid payment signature.")
