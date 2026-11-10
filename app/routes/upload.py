from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid


from app.services.ingestion import clean_documents, load_pdf, split_documents
from app.services.vector_store import store_chunks

upload_router = APIRouter()

@upload_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .pdf files are allowed.")
    
    file_id = str(uuid.uuid4())
    file_path = f"temp/{file_id}.pdf"

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    documents = load_pdf(file_path)
    cleaned_documents = clean_documents(documents)
    chunked_documents = split_documents(cleaned_documents)
    # embeddings = generate_embeddings(chunked_documents)
    store_chunks(chunked_documents, file_id, file.filename)
    
    return {
        "document_id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "File uploaded successfully.",
    }