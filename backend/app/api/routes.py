from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.schemas.request import QuestionRequest, QuestionWithFileRequest
from app.schemas.response import AnswerResponse, PdfAnswerResponse
from app.services.auth import get_current_user
import os
import shutil
import json

router = APIRouter(tags=["RAG & Document Operations"])


@router.get("/api/collections")
def list_collections(current_user: dict = Depends(get_current_user)):
    """Fetch available collections strictly owned by the authenticated user."""
    from app.database.mongodb import get_collections_coll
    from app.config import PG_CONNECTION_STRING
    
    user_id = str(current_user.get("id", ""))
    username = current_user.get("username", "")
    is_admin = current_user.get("role") == "admin"
    
    # Fetch Mongo collections owned by this user
    try:
        if is_admin:
            # Admins see their own documents plus unassigned legacy documents
            mongo_query = {
                "$or": [
                    {"user_id": user_id},
                    {"username": username},
                    {"user_id": {"$exists": False}},
                    {"user_id": None}
                ]
            }
        else:
            # Standard users strictly only see documents they uploaded
            mongo_query = {
                "$or": [
                    {"user_id": user_id},
                    {"username": username}
                ]
            }
            
        mongo_cols = list(get_collections_coll().find(mongo_query, {"_id": 0, "name": 1}))
    except Exception as e:
        print(f"Error fetching Mongo collections: {e}")
        mongo_cols = []
    
    # Fetch Postgres collections owned by this user
    pg_cols = []
    try:
        from app.rag.pg_vectordb import _get_pg_connection
        conn = _get_pg_connection()
        cur = conn.cursor()
        cur.execute("SELECT name, cmetadata FROM langchain_pg_collection;")
        rows = cur.fetchall()
        for r_name, r_meta in rows:
            meta = {}
            if r_meta:
                meta = json.loads(r_meta) if isinstance(r_meta, str) else r_meta
            
            # Check ownership match
            owner_id = meta.get("user_id")
            owner_name = meta.get("username")
            
            if (owner_id and str(owner_id) == user_id) or (owner_name and owner_name == username):
                pg_cols.append(r_name)
            elif is_admin and not owner_id and not owner_name:
                pg_cols.append(r_name)
                
        cur.close()
        conn.close()
    except (Exception, ImportError) as e:
        print(f"Error fetching PG collections: {e}")

    return {
        "mongo": [c["name"] for c in mongo_cols],
        "postgres": pg_cols
    }


def serialize_mongo(obj):
    """Recursively convert non-JSON-serializable objects (like ObjectId) to strings."""
    if isinstance(obj, list):
        return [serialize_mongo(i) for i in obj]
    if isinstance(obj, dict):
        return {k: serialize_mongo(v) for k, v in obj.items()}
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj
    return str(obj)


@router.post("/api/ask", response_model=AnswerResponse)
def ask_question(request: QuestionRequest, current_user: dict = Depends(get_current_user)):
    """Ask question against MongoDB RAG pipeline restricted to current user's documents."""
    from app.rag.mongo_pipeline import run_mongo_rag
    from app.database.mongodb import get_collections_coll

    user_id = str(current_user.get("id", ""))
    username = current_user.get("username", "")
    is_admin = current_user.get("role") == "admin"

    # If specific collection requested, verify access ownership
    if request.collection_name:
        coll_query = {"name": request.collection_name}
        if not is_admin:
            coll_query["$or"] = [{"user_id": user_id}, {"username": username}]
        coll = get_collections_coll().find_one(coll_query)
        if not coll:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied: You do not have permission to access collection '{request.collection_name}'."
            )

    answer, docs = run_mongo_rag(
        request.question, 
        collection_name=request.collection_name,
        user_id=user_id,
        username=username
    )

    return {
        "query": request.question,
        "answer": answer,
        "sources": [{
            "content": (doc.get("page_content") or doc.get("text", ""))[:200],
            "metadata": serialize_mongo(doc.get("metadata") or {k: v for k, v in doc.items() if k != "embedding" and k != "_id"})
        } for doc in docs]
    }


@router.post("/api/pdf-query", response_model=PdfAnswerResponse)
def query_pdf_rag(request: QuestionWithFileRequest, current_user: dict = Depends(get_current_user)):
    """Ask question against PostgreSQL/Document RAG pipeline restricted to document owner."""
    from app.rag.pdf_pipeline import run_rag as run_pdf_rag

    user_id = str(current_user.get("id", ""))
    username = current_user.get("username", "")

    try:
        answer, docs = run_pdf_rag(
            request.query, 
            request.file_name,
            user_id=user_id,
            username=username
        )
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "query": request.query,
        "answer": answer,
        "sources": [{
            "content": doc.page_content[:200],
            "metadata": serialize_mongo(doc.metadata)
        } for doc in docs]
    }


@router.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    database: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Uploads a document and indexes it in the selected database
    under the authenticated user's ownership.
    """
    from app.services.indexer import index_document
    allowed_extensions = {".pdf", ".txt", ".html", ".csv", ".xlsx", ".xls", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, detail=f"Unsupported file type. Supported: {', '.join(allowed_extensions)}")

    user_id = str(current_user.get("id", ""))
    username = current_user.get("username", "")

    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        await index_document(
            temp_path, 
            file.filename, 
            database,
            user_id=user_id,
            username=username
        )

        return {
            "message": f"Successfully indexed {file.filename} in {database}",
            "uploaded_by": username
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
