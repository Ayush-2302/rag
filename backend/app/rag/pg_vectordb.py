import json
import logging
from langchain_community.vectorstores import PGVector
from app.config import (
    PG_CONNECTION_STRING,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB
)

logger = logging.getLogger(__name__)


def _get_pg_connection():
    """
    Connect to PostgreSQL using pure Python pg8000 to prevent
    Windows Application Control from blocking compiled .pyd DLLs.
    """
    try:
        import pg8000.dbapi
        return pg8000.dbapi.connect(
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=int(POSTGRES_PORT or 5432),
            database=POSTGRES_DB
        )
    except Exception as e:
        logger.warning(f"pg8000 connect failed: {e}. Trying psycopg2 fallback...")
        import psycopg2
        return psycopg2.connect(
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            dbname=POSTGRES_DB
        )


def create_vector_db(chunks, embeddings, collection_name, collection_metadata=None):
    # Step 1: Create embeddings and collection
    db = PGVector.from_documents(
        embedding=embeddings,
        documents=chunks,
        collection_name=collection_name,
        connection_string=PG_CONNECTION_STRING,
        use_jsonb=True,
        pre_delete_collection=True,
    )
    
    # Step 2: Manually update collection-level metadata if provided
    if collection_metadata:
        try:
            logger.info(f"Updating collection-level metadata for: {collection_name}...")
            conn = _get_pg_connection()
            cur = conn.cursor()
            query = "UPDATE langchain_pg_collection SET cmetadata = %s WHERE name = %s;"
            cur.execute(query, (json.dumps(collection_metadata), collection_name))
            conn.commit()
            cur.close()
            conn.close()
            logger.info("Collection metadata updated successfully.")
        except Exception as e:
            logger.error(f"Error updating collection metadata: {e}")
            
    return db


def get_pg_collection_metadata(collection_name):
    """Retrieve collection-level metadata to verify ownership."""
    try:
        conn = _get_pg_connection()
        cur = conn.cursor()
        cur.execute("SELECT cmetadata FROM langchain_pg_collection WHERE name = %s;", (collection_name,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row and row[0]:
            return json.loads(row[0]) if isinstance(row[0], str) else row[0]
        return None
    except Exception as e:
        logger.error(f"Error reading PG collection metadata: {e}")
        return None


def load_vector_db(embeddings, collection_name):
    return PGVector(
        collection_name=collection_name,
        connection_string=PG_CONNECTION_STRING,
        embedding_function=embeddings,
        use_jsonb=True,
    )
