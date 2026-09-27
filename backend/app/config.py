import os
from dotenv import load_dotenv

load_dotenv(override=True)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# Consolidated Embedding Model (BAAI/bge-large-en from rag-app)
EMBEDDING_MODEL = "BAAI/bge-large-en"

LLM_PROVIDER = os.getenv("LLM_PROVIDER") 
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")
TOP_K = int(os.getenv("TOP_K", "8"))
DATA_PATH = os.getenv("DATA_PATH", "data")

# PostgreSQL Individual Configuration (Using user-preferred keys)
POSTGRES_USER = os.getenv("user")
POSTGRES_PASSWORD = os.getenv("password")
POSTGRES_HOST = os.getenv("host")
POSTGRES_PORT = os.getenv("port", "5432")
POSTGRES_DB = os.getenv("dbname", "postgres")

# Dynamically construct the connection string for SQLAlchemy/LangChain compatibility (using pure Python pg8000)
if POSTGRES_USER and POSTGRES_PASSWORD and POSTGRES_HOST:
    PG_CONNECTION_STRING = f"postgresql+pg8000://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
else:
    raw_conn = os.getenv("PG_CONNECTION_STRING")
    PG_CONNECTION_STRING = raw_conn.replace("postgresql+psycopg2://", "postgresql+pg8000://") if raw_conn else None

# Authentication and Authorization
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "rag-secret-jwt-key-development-2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours