from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_routes import router as auth_router, admin_router
from app.api.routes import router as rag_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Unified Multi-DB RAG API",
    description="RAG Application with JWT Authentication and Role-Based Authorization",
    version="1.0.0"
)

# Allow local dev and production frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Unified Multi-DB RAG API is starting up...")

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(rag_router)