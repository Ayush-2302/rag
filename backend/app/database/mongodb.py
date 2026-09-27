from pymongo import MongoClient
from app.config import MONGO_URI, DB_NAME, COLLECTION_NAME

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client[DB_NAME]

def get_collections_coll():
    """Collection storing document/file metadata."""
    return get_db()["collections"]

def get_embeddings_coll():
    """Collection storing text chunks and vector embeddings."""
    return get_db()["embeddings"]

def get_users_coll():
    """Collection storing user credentials and role information."""
    return get_db()["users"]

def get_collection():
    """Legacy helper for backward compatibility."""
    return get_embeddings_coll()
