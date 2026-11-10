# Papertrail

Papertrail is a document chat application built using RAG. Upload PDF files, select a PDF from the sidebar, and ask questions using only that document's content.

## Features

- Upload and process PDF documents
- Ask questions using retrieval-augmented generation(RAG)
- Select a PDF to keep chat context isolated
- Start a new chat and choose another document
- Light and dark themes
- React and Vite frontend
- FastAPI backend with Chroma vector storage

## Project structure

```text
app/
  main.py                 FastAPI application
  routes/
    chat.py               Document question endpoint
    documents.py          Uploaded document listing endpoint
    upload.py             PDF upload endpoint
  services/
    ingestion.py          PDF loading and chunking
    retrival.py           Similarity search with document filtering
    vector_store.py       Chroma storage and document metadata
    genration.py          Gemini answer generation
frontend/
  src/
    App.jsx               React application
    main.jsx              React entry point
  styles.css              Existing Papertrail UI styles
```

## Requirements

- Python 3.10+
- Node.js 18+
- A Google Gemini API key

## Backend setup

Create and activate a virtual environment, then install the backend packages:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn python-dotenv python-multipart `
  langchain-chroma langchain-community langchain-core `
  langchain-google-genai langchain-text-splitters pypdf
```

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_google_api_key
```

Start the API:

```powershell
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

## Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

To use a different backend URL, create `frontend/.env`:

```env
VITE_API_BASE=http://127.0.0.1:8000
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API health |
| `GET` | `/documents` | List uploaded PDFs |
| `POST` | `/upload` | Upload a PDF |
| `GET` | `/chat?question=...&document_id=...` | Ask about one selected PDF |

Uploaded files are stored temporarily in `temp/`. Chroma data is stored in `storage/chroma_db/`; both are ignored by Git.

## Important notes

- Select or upload a PDF before asking a question.
- Chat retrieval is filtered by the selected document ID, so other PDFs are not included.
- Keep API keys in `.env`; never commit them to source control.
