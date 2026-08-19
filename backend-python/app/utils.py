"""
UrbanCart — Shared Utilities
Helpers for MongoDB document serialisation (ObjectId → str, datetime → ISO).
"""

from bson import ObjectId
from datetime import datetime


def serialize_id(obj):
    """
    Recursively walk a dict or list and convert:
      - ObjectId  → str
      - datetime  → ISO-8601 string (so JSON encoding works)
    Returns the same structure with all MongoDB types replaced.
    """
    if isinstance(obj, dict):
        return {k: serialize_id(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [serialize_id(item) for item in obj]
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def is_valid_object_id(value: str) -> bool:
    """Return True if *value* is a valid 24-hex MongoDB ObjectId string."""
    return ObjectId.is_valid(value)
