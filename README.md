# Docubase — Enterprise Multi-DB RAG Platform

> A production-grade, multi-tenant Retrieval-Augmented Generation (RAG) platform with document privacy isolation, dual vector databases (MongoDB & PostgreSQL), fine-grained Role-Based Access Control (RBAC), and a standardized design system.

---

## 🌟 Key Features

### 1. 🔒 Multi-Tenant Document Isolation
- **Strict Privacy**: Uploaded documents and vector chunks are tied directly to the user (`user_id` and `username`).
- **Zero Cross-Leakage**: Users can only browse, search, and run RAG queries against their own documents.
- **Enforced Authorization**: Attempting to query an unowned document returns an immediate `403 Forbidden`.

### 2. 🗄️ Dual Vector Database Architecture
- **MongoDB Atlas**: Custom high-performance cosine similarity vector search over 1,024-dimensional embeddings.
- **PostgreSQL (`pgvector`)**: Cloud vector retrieval powered by pure-Python `pg8000` driver and LangChain PGVector.

### 3. 🧠 State-of-the-Art AI Stack
- **Embedding Model**: [`BAAI/bge-large-en`](https://huggingface.co/BAAI/bge-large-en) (1,024 dimensions, `[CLS]` pooling, L2 normalization) running on PyTorch and Hugging Face Transformers.
- **Generative LLM**: Google Gemini (`gemini-2.5-flash`) at temperature 0 for factual, grounded answers with citations.
- **Local Fallback**: Optional seamless toggle to local Ollama (`llama3`).
- **Document Chunking**: Custom recursive text chunker (700 characters, 50 overlap) with priority split boundaries.

### 4. 👥 Admin User Management & RBAC
- **Self-Registration**: Public registrations automatically receive standard `user` status (first registered user initializes as `admin`).
- **User Provisioning**: Admins can create users with specific roles (`user` or `admin`).
- **Account Control**: Admins can activate or deactivate accounts in real-time. Deactivated accounts are instantly blocked from login and API usage.
- **Confirmation Modals**: Accessible, themed confirmation dialogs (`danger`, `warning`, `info`, `success`) with the `useConfirm()` hook.

### 5. 🎨 Design System & UI
- **Design Tokens**: Standardized colors (`primary`, `success`, `danger`, `warning`), subtle borders, soft surfaces, and dark mode readiness.
- **Iconify Integration**: Offline bundle of Lucide icons (`@iconify-json/lucide`).
- **Feedback**: Integrated [Sonner](https://sonner.emilkowal.ski/) rich notifications and contextual alerts.
- **Multi-Format Ingestion**: Ingests PDF, TXT, CSV, HTML, Word (`.docx`), and Excel (`.xlsx`).

---

## 🏗️ Architecture

```
                       ┌────────────────────────────┐
                       │  Docubase Frontend (React) │
                       │  Tailwind CSS Design System│
                       │  Sonner + Iconify + Lucide │
                       └─────────────┬──────────────┘
                                     │  JWT Bearer
                                     ▼
                       ┌────────────────────────────┐
                       │   FastAPI Backend Server   │
                       │   Router, RBAC & Auth API  │
                       └───────┬────────────┬───────┘
                               │            │
             ┌─────────────────┴─┐        ┌─┴────────────────┐
             │                   │        │                  │
             ▼                   ▼        ▼                  ▼
    ┌─────────────────┐ ┌──────────────┐ ┌───────────┐ ┌───────────┐
    │ BGE-Large-En    │ │ Gemini 2.5   │ │ MongoDB   │ │ PostgreSQL│
    │ (PyTorch 1024d) │ │ (Google AI)  │ │ (Vector)  │ │ (pgvector)│
    └─────────────────┘ └──────────────┘ └───────────┘ └───────────┘
```

---

## 📁 Repository Structure

```
try_rag/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth_routes.py     # Login, register & admin user management
│   │   │   └── routes.py          # Document upload, MongoDB/PG search endpoints
│   │   ├── database/
│   │   │   ├── mongodb.py         # Mongo client & collection providers
│   │   │   └── vector_store.py    # Multi-tenant similarity search & chunk indexing
│   │   ├── embeddings/
│   │   │   └── embedder.py        # BGE-Large-En embedding & recursive chunking
│   │   ├── rag/
│   │   │   ├── loader.py          # Native document loaders (PDF, TXT, CSV, HTML, DOCX, XLSX)
│   │   │   ├── mongo_pipeline.py  # MongoDB RAG pipeline
│   │   │   ├── pdf_pipeline.py    # PostgreSQL RAG pipeline
│   │   │   └── pg_vectordb.py     # PGVector & pg8000 database operations
│   │   ├── schemas/
│   │   │   └── auth.py            # Pydantic schemas for auth & admin operations
│   │   ├── services/
│   │   │   ├── auth.py            # Password hashing, JWT creation, RBAC dependencies
│   │   │   ├── indexer.py         # Multi-database document ingestion service
│   │   │   └── llm.py             # Gemini and Ollama LLM provider wrapper
│   │   ├── config.py              # Centralized environment configuration
│   │   └── main.py                # FastAPI application entry point
│   ├── .env.example               # Backend environment template
│   ├── Dockerfile                 # Containerization definition
│   └── requirements.txt           # Python package dependencies
│
├── ui/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js         # Client authentication & admin management calls
│   │   │   └── ragApi.js          # RAG questions & document upload calls
│   │   ├── components/
│   │   │   ├── ui/                # Reusable design system primitives
│   │   │   │   ├── modal.jsx      # Base modal with variant support
│   │   │   │   ├── confirm-dialog.jsx # Confirm modal & useConfirm hook
│   │   │   │   ├── button.jsx, badge.jsx, card.jsx, input.jsx...
│   │   │   ├── AuthModal.jsx      # Authentication & registration modal
│   │   │   ├── BackendChat.jsx    # MongoDB scoped search interface
│   │   │   ├── DocumentIndexer.jsx# Document ingestion interface
│   │   │   ├── Overview.jsx       # Platform dashboard & knowledge status
│   │   │   ├── RagAppChat.jsx     # PostgreSQL document Q&A interface
│   │   │   └── UserManagement.jsx # Admin account management panel
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # React Auth Provider & session state
│   │   └── lib/design-system/     # Design tokens and utilities
│   ├── .env.example               # Frontend environment template
│   └── package.json               # Node.js dependencies
└── README.md                      # Platform documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and `npm`
- **MongoDB Atlas** cluster URL
- **PostgreSQL** instance with `pgvector` enabled (e.g. Supabase)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials (MongoDB, PostgreSQL, Gemini API key)

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Backend will be running at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

---

### 2. Frontend Setup

```bash
# Navigate to UI directory
cd ui

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:5173`.

---

## 🔑 Default Authorization & Users

- **First Registered User**: Automatically promoted to **Admin**.
- **Public Registrations**: Role is locked to standard **User**.
- **Admin Capabilities**:
  - Access `/users` in sidebar.
  - Create users with customized roles (`user` or `admin`).
  - Activate or deactivate accounts.
  - Delete user accounts with confirmation safeguards.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (assigned `user` role) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile & role |
| `GET` | `/api/admin/users` | Admin | List all registered accounts |
| `POST` | `/api/admin/users` | Admin | Provision user with designated role and status |
| `PATCH` | `/api/admin/users/{id}/status` | Admin | Activate or deactivate user access |
| `PATCH` | `/api/admin/users/{id}/role` | Admin | Change user role (`user` / `admin`) |
| `DELETE`| `/api/admin/users/{id}` | Admin | Delete user account |
| `GET` | `/api/collections` | Authenticated | List collections owned by the caller |
| `POST` | `/api/upload` | Authenticated | Upload and index document to personal scope |
| `POST` | `/api/ask` | Authenticated | Query personal MongoDB collections |
| `POST` | `/api/pdf-query` | Authenticated | Query personal PostgreSQL document |

---

## 📄 License
MIT License.
