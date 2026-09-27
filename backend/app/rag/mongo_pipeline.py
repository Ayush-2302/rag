from app.database.vector_store import similarity_search
from app.embeddings.embedder import get_embeddings
from app.services.llm import LLMService
from app.utils.prompt import build_rag_prompt
import logging

logger = logging.getLogger(__name__)

def run_mongo_rag(question: str, collection_name: str = None, user_id: str = None, username: str = None):
    logger.info(f"Starting MongoDB RAG query (Collection: {collection_name or 'All'}, User: {username or user_id})")
    try:
        # Get unified services
        embeddings = get_embeddings()
        llm = LLMService.get_llm()
        
        # Generate query embedding
        query_embedding = embeddings.embed_query(question)
        
        # Search MongoDB with optional collection filtering and strict user isolation
        docs = similarity_search(
            query_embedding, 
            collection_name=collection_name, 
            top_k=3, 
            user_id=user_id, 
            username=username
        )
        
        if not docs:
            return "I couldn't find any relevant information in your MongoDB knowledge base.", []

        # Format Context
        context_parts = []
        for doc in docs:
            text = doc.get('page_content') or doc.get('text', '')
            context_parts.append(text)
            
        context = "\n\n---\n\n".join(context_parts)
        
        # Build the unified prompt
        prompt = build_rag_prompt(question, context)
        
        # Generate using the unified LLM
        answer = llm.invoke(prompt)
        return answer, docs
    except Exception as e:
        logger.error(f"Error in run_mongo_rag: {e}")
        return f"An error occurred: {e}", []
