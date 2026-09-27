import os
import uuid
import shutil
from app.embeddings.embedder import get_embeddings, split_documents
from app.database.vector_store import add_documents
import logging

logger = logging.getLogger(__name__)

async def index_document(file_path: str, file_name: str, database_type: str, user_id: str = None, username: str = None):
    """
    Processes a document file, generates embeddings, and stores them in the selected database
    with strict user ownership metadata.
    """
    try:
        logger.info(f"Indexing {file_name} into {database_type} for user {username or user_id}...")
        
        from app.rag.loader import get_loader
        
        # Load Document
        loader = get_loader(file_path)
        if not loader:
            raise ValueError(f"No loader found for {file_name}")
        docs = loader.load()
        
        # Get unified embeddings
        embeddings = get_embeddings()
        
        # Split into chunks
        chunks = split_documents(docs)
        
        # Assign metadata directly to chunks including user ownership
        doc_id = str(uuid.uuid4())
        logger.info(f"Assigning metadata to {len(chunks)} chunks...")
        for i, chunk in enumerate(chunks):
            chunk.metadata.update({
                "source": file_name,
                "doc_id": doc_id,
                "chunk_index": i,
                "user_id": str(user_id) if user_id else None,
                "username": str(username) if username else None
            })
            # Ensure 'page' is preserved from original doc metadata if available
            if "page" not in chunk.metadata:
                chunk.metadata["page"] = i # Fallback
            
        if database_type.lower() == "mongo":
            logger.info(f"Processing {len(chunks)} chunks for MongoDB indexing...")
            
            # Use batch embedding for efficiency
            chunk_texts = [chunk.page_content for chunk in chunks]
            logger.info(f"Generating embeddings for {len(chunks)} chunks (Batch Processing)...")
            vectors = embeddings.embed_documents(chunk_texts)
            
            embedded_docs = []
            for chunk, vector in zip(chunks, vectors):
                doc = {
                    "page_content": chunk.page_content,
                    "embedding": vector,
                    "metadata": chunk.metadata,
                    "user_id": str(user_id) if user_id else None,
                    "username": str(username) if username else None
                }
                embedded_docs.append(doc)
            
            logger.info(f"Inserting into MongoDB collection: {file_name} (Owner: {username or user_id})...")
            add_documents(embedded_docs, collection_name=file_name, user_id=user_id, username=username)
            logger.info("Successfully indexed in MongoDB with user ownership.")
            
        elif database_type.lower() == "postgres":
            from app.rag.pg_vectordb import create_vector_db
            logger.info(f"Inserting {len(chunks)} chunks into PostgreSQL collection: {file_name} (Owner: {username or user_id})...")
            
            # Prepare document-level metadata
            from datetime import datetime
            collection_metadata = {
                "source": file_name,
                "doc_id": doc_id,
                "user_id": str(user_id) if user_id else None,
                "username": str(username) if username else None,
                "indexed_at": datetime.now().isoformat(),
                "chunk_count": len(chunks)
            }
            
            # PGVector handles its own batch embedding/insertion
            create_vector_db(
                chunks, 
                embeddings, 
                collection_name=file_name, 
                collection_metadata=collection_metadata
            )
            logger.info("Successfully indexed in PostgreSQL with collection-level user metadata.")
        
        else:
            raise ValueError(f"Unsupported database type: {database_type}")
            
        return True
    except Exception as e:
        logger.error(f"Error during indexing: {e}")
        raise e
