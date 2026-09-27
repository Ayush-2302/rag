import numpy as np
from app.database.mongodb import get_collection

def cosine_similarity(a, b):
    a = np.asarray(a, dtype=np.float32).reshape(-1)
    b = np.asarray(b, dtype=np.float32).reshape(-1)
    
    # Handle dimension mismatch gracefully
    if a.shape != b.shape:
        return 0.0
        
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


def similarity_search(query_embedding, collection_name=None, top_k=3, user_id=None, username=None):
    from app.database.mongodb import get_collections_coll, get_embeddings_coll
    import logging
    logger = logging.getLogger(__name__)

    query_filter = {"embedding": {"$exists": True}}
    
    # Restrict search strictly to documents owned by this user
    user_match = []
    if user_id:
        user_match.append({"user_id": str(user_id)})
    if username:
        user_match.append({"username": str(username)})

    if user_match:
        if len(user_match) == 1:
            query_filter.update(user_match[0])
        else:
            query_filter["$or"] = user_match
    
    # If collection_name provided, verify user ownership of collection
    if collection_name:
        coll_filter = {"name": collection_name}
        if user_match:
            if len(user_match) == 1:
                coll_filter.update(user_match[0])
            else:
                coll_filter["$or"] = user_match

        coll_record = get_collections_coll().find_one(coll_filter)
        if coll_record:
            query_filter["collection_id"] = coll_record["_id"]
        else:
            logger.warning(f"Collection '{collection_name}' not found or access denied for user {username or user_id}.")
            return []

    collection = get_embeddings_coll()
    docs = list(collection.find(query_filter))
    logger.info(f"MongoDB search: found {len(docs)} documents with embeddings for user {username or user_id}.")
    
    if len(docs) == 0:
        logger.warning(f"No documents with embeddings found.")
        return []
    
    scored_docs = []
    for doc in docs:
        emb = doc.get("embedding")
        if emb is None:
            continue
        score = cosine_similarity(query_embedding, emb)
        scored_docs.append((score, doc))

    scored_docs.sort(reverse=True, key=lambda x: x[0])
    top_docs = scored_docs[:top_k]
    
    if top_docs:
        logger.info(f"Top similarity score: {top_docs[0][0]:.4f}")
    
    return [doc for score, doc in top_docs]

def add_documents(documents, collection_name=None, user_id=None, username=None):
    """Inserts multiple documents into the MongoDB embeddings collection with user ownership."""
    from app.database.mongodb import get_collections_coll, get_embeddings_coll
    
    collection_id = None
    if collection_name:
        set_fields = {"name": collection_name}
        if user_id:
            set_fields["user_id"] = str(user_id)
        if username:
            set_fields["username"] = str(username)

        # Get or create collection record with user ownership
        coll_record = get_collections_coll().find_one_and_update(
            {"name": collection_name},
            {"$set": set_fields},
            upsert=True,
            return_document=True
        )
        collection_id = coll_record["_id"]

    if documents:
        # Attach collection_id and user ownership to each chunk document
        for doc in documents:
            if collection_id:
                doc["collection_id"] = collection_id
            if user_id:
                doc["user_id"] = str(user_id)
            if username:
                doc["username"] = str(username)
        
        get_embeddings_coll().insert_many(documents)
