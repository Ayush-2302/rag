import os
from pymongo import MongoClient
from app.config import MONGO_URI, DB_NAME, COLLECTION_NAME
from app.embeddings.embedder import embed_text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def reembed_mongo():
    logger.info("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    docs = list(collection.find({}))
    logger.info(f"Found {len(docs)} documents to re-embed.")

    for i, doc in enumerate(docs):
        text = doc.get("text")
        print(text)
        if not text:
            logger.warning(f"Doc {doc['_id']} has no text. Skipping.")
            continue

        logger.info(f"[{i+1}/{len(docs)}] Re-embedding doc: {doc['_id']}")
        try:
            new_embedding = embed_text(text)
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"embedding": new_embedding}}
            )
        except Exception as e:
            logger.error(f"Error re-embedding doc {doc['_id']}: {e}")

    logger.info("Re-embedding complete!")


if __name__ == "__main__":
    reembed_mongo()
