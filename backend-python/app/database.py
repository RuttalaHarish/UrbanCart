"""
UrbanCart — MongoDB Connection Manager
Uses Motor (async MongoDB driver) to manage the database connection.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/urbancart")


class _DatabaseManager:
    """Singleton holder for the Motor client and database handle."""

    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


_manager = _DatabaseManager()


async def connect_to_mongo() -> None:
    """Open the Motor client and select the database."""
    _manager.client = AsyncIOMotorClient(MONGODB_URI)
    # get_default_database() reads the DB name from the URI path (/urbancart)
    _manager.db = _manager.client.get_default_database()
    print(f"[OK] Connected to MongoDB - database: {_manager.db.name}")


async def close_mongo_connection() -> None:
    """Cleanly close the Motor client on shutdown."""
    if _manager.client is not None:
        _manager.client.close()
        print("[CLOSED] MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency — injects the database handle into any route.

    Usage:
        async def my_route(db: AsyncIOMotorDatabase = Depends(get_db)):
            ...
    """
    return _manager.db
