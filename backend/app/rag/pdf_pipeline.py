from app.rag.pg_vectordb import load_vector_db, get_pg_collection_metadata
from app.embeddings.embedder import get_embeddings
from app.services.llm import LLMService
from app.utils.prompt import build_rag_prompt
import logging

logger = logging.getLogger(__name__)

def run_rag(question: str, file_name: str, user_id: str = None, username: str = None):
    logger.info(f"Starting RAG query for file: {file_name} (User: {username or user_id})")
    
    # Ownership verification
    meta = get_pg_collection_metadata(file_name)
    if meta and (meta.get("user_id") or meta.get("username")):
        owner_id = meta.get("user_id")
        owner_user = meta.get("username")
        is_owner = (user_id and owner_id and str(owner_id) == str(user_id)) or (username and owner_user and owner_user == username)
        if not is_owner:
            raise PermissionError(f"Access denied: You do not have permission to access document '{file_name}'.")

    embeddings = get_embeddings()
    llm = LLMService.get_llm()
    
    db = load_vector_db(embeddings, collection_name=file_name)
    retriever = db.as_retriever(search_kwargs={"k": 3})
    
    docs = retriever.invoke(question) 
    context = "\n\n---\n\n".join([doc.page_content for doc in docs])
    
    prompt = build_rag_prompt(question, context)
    answer = llm.invoke(prompt)
    
    return answer, docs