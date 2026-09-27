# Docubase Backend

FastAPI backend service powering the multi-tenant RAG platform.

## Features
- **Authentication**: JWT Bearer token authentication with password hashing using bcrypt.
- **Role-Based Access Control**: Role checks for standard `user` and `admin` operations.
- **Tenant-Scoped Search**: All similarity searches in MongoDB and PostgreSQL filter by `user_id` and `username`.
- **Pure-Python Drivers**: Uses `pg8000` to guarantee resilience against Application Control / DLL blocking on Windows.
- **Embedding Pipeline**: `BAAI/bge-large-en` (1024 dimensions) using PyTorch and Hugging Face Transformers.
- **Document Ingestion**: Supports PDF, TXT, CSV, HTML, Word (.docx), and Excel (.xlsx) with automatic chunking.

## Development

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server with hot reload
uvicorn app.main:app --reload --port 8000
```

## Environment Variables
See [.env.example](.env.example) for required configuration keys.
